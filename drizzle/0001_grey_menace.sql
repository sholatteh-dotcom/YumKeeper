CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(64) NOT NULL,
	`stripeSubscriptionId` varchar(64),
	`stripePriceId` varchar(64),
	`tier` enum('free','fresh','family') NOT NULL DEFAULT 'free',
	`billingInterval` enum('month','year') DEFAULT 'month',
	`status` varchar(32) NOT NULL DEFAULT 'inactive',
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
