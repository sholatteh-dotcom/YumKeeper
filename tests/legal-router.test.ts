import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TrpcContext } from "../server/_core/context";

const mocks = vi.hoisted(() => ({
  upsertConsentRecord: vi.fn(),
  getLatestConsentRecord: vi.fn(),
  getConsentStatusSummary: vi.fn(),
  createDeletionRequest: vi.fn(),
  getDeletionRequest: vi.fn(),
  updateDeletionRequestStatus: vi.fn(),
  getAllDeletionRequests: vi.fn(),
  purgeExpiredDeletionRequests: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("../server/db", () => ({
  upsertConsentRecord: mocks.upsertConsentRecord,
  getLatestConsentRecord: mocks.getLatestConsentRecord,
  getConsentStatusSummary: mocks.getConsentStatusSummary,
  createDeletionRequest: mocks.createDeletionRequest,
  getDeletionRequest: mocks.getDeletionRequest,
  updateDeletionRequestStatus: mocks.updateDeletionRequestStatus,
  getAllDeletionRequests: mocks.getAllDeletionRequests,
  purgeExpiredDeletionRequests: mocks.purgeExpiredDeletionRequests,
}));

vi.mock("../server/_core/notification", () => ({
  notifyOwner: mocks.notifyOwner,
}));

import { CURRENT_POLICY_VERSION, legalRouter } from "../server/legal-router";

const requestDate = new Date("2026-09-25T00:00:00.000Z");

function createContext({
  role = "user",
  name = "Yum Keeper",
  email = "keeper@example.com",
}: {
  role?: "user" | "admin";
  name?: string | null;
  email?: string | null;
} = {}): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "yumkeeper-user",
      name,
      email,
      loginMethod: "manus",
      role,
      createdAt: requestDate,
      updatedAt: requestDate,
      lastSignedIn: requestDate,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.upsertConsentRecord.mockResolvedValue(undefined);
  mocks.getLatestConsentRecord.mockResolvedValue(undefined);
  mocks.getConsentStatusSummary.mockResolvedValue({
    totalUsers: 1,
    consentedCount: 1,
    pendingCount: 0,
    pendingUsers: [],
  });
  mocks.createDeletionRequest.mockResolvedValue(73);
  mocks.getDeletionRequest.mockResolvedValue(null);
  mocks.updateDeletionRequestStatus.mockResolvedValue(undefined);
  mocks.getAllDeletionRequests.mockResolvedValue([]);
  mocks.purgeExpiredDeletionRequests.mockResolvedValue(0);
  mocks.notifyOwner.mockResolvedValue(true);
});

describe("legalRouter consent and deletion flows", () => {
  it("records consent using explicit and default optional values", async () => {
    const caller = legalRouter.createCaller(createContext());

    await expect(
      caller.recordConsent({
        consentedAt: "2026-09-25T00:00:00.000Z",
        documents: "terms-of-service,privacy-policy",
        platform: "ios",
      }),
    ).resolves.toEqual({ success: true, policyVersion: CURRENT_POLICY_VERSION });

    expect(mocks.upsertConsentRecord).toHaveBeenLastCalledWith({
      userId: 42,
      policyVersion: CURRENT_POLICY_VERSION,
      consentedAt: requestDate,
      documents: "terms-of-service,privacy-policy",
      platform: "ios",
    });

    await caller.recordConsent({ consentedAt: "2026-09-25T00:00:00.000Z" });
    expect(mocks.upsertConsentRecord).toHaveBeenLastCalledWith({
      userId: 42,
      policyVersion: CURRENT_POLICY_VERSION,
      consentedAt: requestDate,
      documents: "terms-of-service,privacy-policy",
      platform: null,
    });
  });

  it("creates a deletion request and notifies the owner", async () => {
    const caller = legalRouter.createCaller(createContext());

    await expect(caller.requestDeletion({ platform: "android" })).resolves.toMatchObject({
      success: true,
      requestId: 73,
      message: expect.stringContaining("30 days"),
    });

    expect(mocks.createDeletionRequest).toHaveBeenCalledWith(42, "android");
    expect(mocks.notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New GDPR Deletion Request",
        content: expect.stringContaining("Yum Keeper"),
      }),
    );
  });

  it("uses email and an ID fallback in deletion notifications", async () => {
    await legalRouter
      .createCaller(createContext({ name: null, email: "privacy@example.com" }))
      .requestDeletion({});
    expect(mocks.notifyOwner).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: expect.stringContaining("privacy@example.com") }),
    );

    await legalRouter.createCaller(createContext({ name: null, email: null })).requestDeletion({});
    expect(mocks.notifyOwner).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: expect.stringContaining("#42") }),
    );
  });

  it("returns deletion request status for absent and completed requests", async () => {
    const caller = legalRouter.createCaller(createContext());

    await expect(caller.deletionStatus()).resolves.toEqual({
      hasRequest: false,
      status: null,
      requestedAt: null,
      completedAt: null,
    });

    const completedAt = new Date("2026-09-26T00:00:00.000Z");
    mocks.getDeletionRequest.mockResolvedValueOnce({
      id: 73,
      userId: 42,
      requestedAt: requestDate,
      status: "completed",
      completedAt,
      notes: null,
    });
    await expect(caller.deletionStatus()).resolves.toEqual({
      hasRequest: true,
      status: "completed",
      requestedAt: requestDate,
      completedAt,
    });
  });

  it("reports current, outdated, and absent consent records", async () => {
    const caller = legalRouter.createCaller(createContext());

    await expect(caller.consentStatus()).resolves.toEqual({
      currentVersion: CURRENT_POLICY_VERSION,
      hasConsented: false,
      lastConsentedVersion: null,
      lastConsentedAt: null,
    });

    mocks.getLatestConsentRecord.mockResolvedValueOnce({
      id: 9,
      userId: 42,
      policyVersion: "1.0",
      consentedAt: requestDate,
      documents: "terms-of-service,privacy-policy",
      platform: "web",
      createdAt: requestDate,
    });
    await expect(caller.consentStatus()).resolves.toMatchObject({
      hasConsented: false,
      lastConsentedVersion: "1.0",
      lastConsentedAt: requestDate,
    });

    mocks.getLatestConsentRecord.mockResolvedValueOnce({
      id: 10,
      userId: 42,
      policyVersion: CURRENT_POLICY_VERSION,
      consentedAt: requestDate,
      documents: "terms-of-service,privacy-policy",
      platform: "web",
      createdAt: requestDate,
    });
    await expect(caller.consentStatus()).resolves.toMatchObject({
      hasConsented: true,
      lastConsentedVersion: CURRENT_POLICY_VERSION,
    });
  });

  it("supports admin review, status changes, and manual purges", async () => {
    const caller = legalRouter.createCaller(createContext({ role: "admin" }));
    const queue = [{ id: 73, userId: 42, userName: "Yum Keeper" }];
    mocks.getAllDeletionRequests.mockResolvedValueOnce(queue);
    mocks.purgeExpiredDeletionRequests.mockResolvedValueOnce(2).mockResolvedValueOnce(0);

    await expect(caller.adminConsentStatus()).resolves.toMatchObject({
      currentVersion: CURRENT_POLICY_VERSION,
      totalUsers: 1,
    });
    await expect(caller.adminDeletionQueue()).resolves.toEqual({ requests: queue });

    await expect(
      caller.adminUpdateDeletionStatus({ requestId: 73, status: "processing" }),
    ).resolves.toEqual({ success: true, requestId: 73, status: "processing" });
    await expect(
      caller.adminUpdateDeletionStatus({ requestId: 73, status: "completed" }),
    ).resolves.toEqual({ success: true, requestId: 73, status: "completed" });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({ title: "GDPR Deletion Request Completed" }),
    );

    await expect(caller.adminRunPurge()).resolves.toEqual({ success: true, purgedCount: 2 });
    await expect(caller.adminRunPurge()).resolves.toEqual({ success: true, purgedCount: 0 });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({ title: "GDPR Purge Job Completed" }),
    );
  });

  it("rejects protected and admin procedures without the required role", async () => {
    const unauthenticatedCaller = legalRouter.createCaller({
      ...createContext(),
      user: null,
    });
    await expect(unauthenticatedCaller.requestDeletion({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });

    const standardCaller = legalRouter.createCaller(createContext());
    await expect(standardCaller.adminDeletionQueue()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
