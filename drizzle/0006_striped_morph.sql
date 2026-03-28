CREATE TABLE `inventoryActivity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`productId` int NOT NULL,
	`type` enum('purchase','sale','adjustment','production','return') NOT NULL,
	`quantity` int NOT NULL,
	`costPerUnit` decimal(10,2),
	`sellingPrice` decimal(10,2),
	`totalCost` decimal(12,2),
	`totalValue` decimal(12,2),
	`supplierId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryActivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100),
	`costPerUnit` decimal(10,2) NOT NULL,
	`sellingPrice` decimal(10,2) NOT NULL,
	`currentStock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int DEFAULT 10,
	`unit` varchar(50) DEFAULT 'units',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
