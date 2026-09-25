import { describe, expect, it } from "vitest";
import type { Request } from "express";

import { getSessionCookieOptions } from "../server/_core/cookies";

type RequestOptions = {
  hostname?: string;
  protocol?: string;
  forwardedProto?: string | string[];
};

function createRequest({
  hostname,
  protocol = "http",
  forwardedProto,
}: RequestOptions): Request {
  return {
    hostname,
    protocol,
    headers:
      forwardedProto === undefined
        ? {}
        : { "x-forwarded-proto": forwardedProto },
  } as unknown as Request;
}

describe("getSessionCookieOptions", () => {
  it("uses a secure host-only cookie when hostname metadata is unavailable", () => {
    const options = getSessionCookieOptions(
      createRequest({ protocol: "https" }),
    );

    expect(options).toEqual({
      domain: undefined,
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("uses host-only cookies for local, IP, and non-subdomain hosts", () => {
    expect(
      getSessionCookieOptions(createRequest({ hostname: "localhost" })),
    ).toMatchObject({ domain: undefined, secure: false });

    expect(
      getSessionCookieOptions(
        createRequest({ hostname: "127.0.0.1", protocol: "https" }),
      ),
    ).toMatchObject({ domain: undefined, secure: true });

    expect(
      getSessionCookieOptions(createRequest({ hostname: "192.0.2.15" })),
    ).toMatchObject({ domain: undefined, secure: false });

    expect(
      getSessionCookieOptions(createRequest({ hostname: "2001:db8::1" })),
    ).toMatchObject({ domain: undefined, secure: false });

    expect(
      getSessionCookieOptions(createRequest({ hostname: "example.com" })),
    ).toMatchObject({ domain: undefined, secure: false });
  });

  it("shares cookies across production subdomains and trusts forwarded HTTPS", () => {
    const options = getSessionCookieOptions(
      createRequest({
        hostname: "3000-preview.manus.computer",
        forwardedProto: "http, HTTPS",
      }),
    );

    expect(options).toMatchObject({
      domain: ".manus.computer",
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("recognizes an array of forwarded protocols", () => {
    const options = getSessionCookieOptions(
      createRequest({
        hostname: "api.preview.manus.computer",
        forwardedProto: ["http", "https"],
      }),
    );

    expect(options).toMatchObject({
      domain: ".manus.computer",
      secure: true,
    });
  });
});
