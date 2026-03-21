CREATE TABLE `consent_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`policyVersion` varchar(16) NOT NULL DEFAULT '1.0',
	`consentedAt` timestamp NOT NULL,
	`documents` varchar(255) NOT NULL DEFAULT 'terms-of-service,privacy-policy',
	`platform` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
