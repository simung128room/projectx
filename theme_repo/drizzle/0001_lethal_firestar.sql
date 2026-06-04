CREATE TABLE `check_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionName` varchar(255) NOT NULL,
	`status` enum('pending','running','completed','cancelled') NOT NULL DEFAULT 'pending',
	`totalAccounts` int NOT NULL DEFAULT 0,
	`checkedAccounts` int NOT NULL DEFAULT 0,
	`validAccounts` int NOT NULL DEFAULT 0,
	`invalidAccounts` int NOT NULL DEFAULT 0,
	`errorAccounts` int NOT NULL DEFAULT 0,
	`totalBalance` float NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `check_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checked_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`status` enum('valid','invalid','locked','blocked','timeout','error','pending') NOT NULL DEFAULT 'pending',
	`balance` float DEFAULT 0,
	`verified` boolean DEFAULT false,
	`country` varchar(64) DEFAULT 'N/A',
	`message` text,
	`proxyUsed` varchar(128),
	`checkedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checked_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proxy_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proxyAddress` varchar(128) NOT NULL,
	`successCount` int NOT NULL DEFAULT 0,
	`failCount` int NOT NULL DEFAULT 0,
	`lastUsed` timestamp,
	`lastStatus` enum('active','failed','unknown') NOT NULL DEFAULT 'unknown',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proxy_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `proxy_stats_proxyAddress_unique` UNIQUE(`proxyAddress`)
);
