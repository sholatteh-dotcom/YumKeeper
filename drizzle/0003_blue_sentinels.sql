CREATE TABLE `deletion_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
	`completed_at` timestamp,
	`notes` varchar(500),
	CONSTRAINT `deletion_requests_id` PRIMARY KEY(`id`)
);
