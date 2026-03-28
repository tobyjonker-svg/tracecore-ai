CREATE TABLE `workflowAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int,
	`templateUsed` varchar(100),
	`customizationCount` int NOT NULL DEFAULT 0,
	`stagesCount` int NOT NULL,
	`source` varchar(50) NOT NULL DEFAULT 'landing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflowAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowStages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`stageOrder` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(10) NOT NULL,
	`color` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflowStages_id` PRIMARY KEY(`id`)
);
