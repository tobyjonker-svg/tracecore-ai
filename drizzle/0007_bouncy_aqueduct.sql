CREATE TABLE `inputs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`supplierId` int,
	`costPerUnit` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL DEFAULT 'kg',
	`currentStock` decimal(12,4) NOT NULL DEFAULT '0',
	`lowStockThreshold` decimal(12,4) DEFAULT '10',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inputs_id` PRIMARY KEY(`id`)
);
