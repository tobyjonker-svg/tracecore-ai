CREATE TABLE `productionRunMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`productionRunId` int NOT NULL,
	`inputId` int NOT NULL,
	`quantityUsed` decimal(12,4) NOT NULL,
	`unit` varchar(50) DEFAULT 'kg',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productionRunMaterials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inputs` ADD `amountPurchased` decimal(12,4) DEFAULT '0';