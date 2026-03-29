CREATE TABLE `batchLots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`productId` int,
	`inputId` int,
	`batchNumber` varchar(100) NOT NULL,
	`quantity` decimal(12,4) NOT NULL,
	`unit` varchar(50) DEFAULT 'units',
	`manufacturedDate` timestamp,
	`expiryDate` timestamp,
	`qualityStatus` enum('pending','approved','rejected','expired') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batchLots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`productId` int,
	`inputId` int,
	`batchNumber` varchar(100) NOT NULL,
	`quantity` decimal(12,4) NOT NULL,
	`unit` varchar(50) DEFAULT 'units',
	`manufacturedDate` timestamp,
	`expiryDate` timestamp,
	`qualityStatus` enum('pending','approved','rejected','expired') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inputs` ADD `batchNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `inputs` ADD `expiryDate` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `batchNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `expiryDate` timestamp;