CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` varchar(255) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`totalPrice` decimal(12,2) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productionRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`runNumber` varchar(50) NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`status` enum('planned','in_progress','completed','quality_check','approved') DEFAULT 'planned',
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productionRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`orderId` int NOT NULL,
	`trackingNumber` varchar(100),
	`carrier` varchar(100) DEFAULT 'Local Courier',
	`status` enum('pending','picked','packed','shipped','in_transit','delivered') DEFAULT 'pending',
	`estimatedDelivery` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
