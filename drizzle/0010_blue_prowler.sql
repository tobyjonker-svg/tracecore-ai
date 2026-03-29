CREATE TABLE `supplierPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`supplierId` int NOT NULL,
	`totalOrders` int DEFAULT 0,
	`onTimeDeliveries` int DEFAULT 0,
	`lateDeliveries` int DEFAULT 0,
	`qualityIssues` int DEFAULT 0,
	`averageRating` decimal(3,2) DEFAULT '5.00',
	`lastOrderDate` timestamp,
	`totalSpent` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplierPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplierPricingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`supplierId` int NOT NULL,
	`inputId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`unit` varchar(50) DEFAULT 'kg',
	`effectiveDate` timestamp DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplierPricingHistory_id` PRIMARY KEY(`id`)
);
