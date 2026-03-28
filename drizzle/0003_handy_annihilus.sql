ALTER TABLE `workspaces` ADD `workflowTemplate` varchar(100);--> statement-breakpoint
ALTER TABLE `workspaces` ADD `workflowStages` text;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `currency` varchar(3) DEFAULT 'ZAR' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `region` varchar(50) DEFAULT 'ZA' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `language` varchar(10) DEFAULT 'en' NOT NULL;