-- ==========================================================
-- Tennis League Player Auction Database Schema
-- Database: tennis_auction
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `tennis_auction` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tennis_auction`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table: teams
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `team_number` INT NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `tagline` VARCHAR(150) NOT NULL,
  `owner` VARCHAR(100) NOT NULL,
  `total_purse` DECIMAL(12,2) NOT NULL DEFAULT 400000.00,
  `purse_remaining` DECIMAL(12,2) NOT NULL DEFAULT 400000.00,
  `max_players` INT NOT NULL DEFAULT 5,
  `logo_url` VARCHAR(255) NOT NULL,
  `primary_color` VARCHAR(30) NOT NULL,
  `accent_color` VARCHAR(30) NOT NULL,
  `glow_color` VARCHAR(50) NOT NULL,
  `bg_gradient` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table: users (Admin & 4 Teams)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'team') NOT NULL DEFAULT 'team',
  `team_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table: players
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `player_number` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `country` VARCHAR(60) NOT NULL,
  `country_flag` VARCHAR(20) NOT NULL,
  `category` ENUM('Group A', 'Group B', 'Singles', 'Doubles', 'All-Rounder') NOT NULL DEFAULT 'Group A',
  `group` ENUM('A', 'B') NOT NULL DEFAULT 'A',
  `playing_hand` ENUM('Right Hand', 'Left Hand', 'Ambidextrous') NOT NULL DEFAULT 'Right Hand',
  `world_ranking` INT NOT NULL,
  `wins` INT NOT NULL DEFAULT 0,
  `aces` INT NOT NULL DEFAULT 0,
  `matches` INT NOT NULL DEFAULT 0,
  `win_percentage` INT NOT NULL DEFAULT 0,
  `base_price` DECIMAL(12,2) NOT NULL DEFAULT 10000.00,
  `image_url` VARCHAR(255) NOT NULL,
  `status` ENUM('upcoming', 'live', 'sold', 'unsold') NOT NULL DEFAULT 'upcoming',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: auctions
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `auctions`;
CREATE TABLE `auctions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL DEFAULT 'Grand Slam Tennis Player Auction',
  `status` ENUM('waiting', 'live', 'paused', 'completed') NOT NULL DEFAULT 'waiting',
  `current_player_id` INT NULL,
  `current_bid` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `highest_bidder_team_id` INT NULL,
  `bid_increment` DECIMAL(12,2) NOT NULL DEFAULT 2000.00,
  `timer_seconds` INT NOT NULL DEFAULT 15,
  `timer_remaining` INT NOT NULL DEFAULT 15,
  `timer_running` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`current_player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`highest_bidder_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: bids
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `bids`;
CREATE TABLE `bids` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NOT NULL,
  `player_id` INT NOT NULL,
  `team_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `bid_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table: team_players (Drafted players per team)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `team_players`;
CREATE TABLE `team_players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `team_id` INT NOT NULL,
  `player_id` INT NOT NULL UNIQUE,
  `purchase_price` DECIMAL(12,2) NOT NULL,
  `purchased_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Table: auction_events (Audit log)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `auction_events`;
CREATE TABLE `auction_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `player_id` INT NULL,
  `team_id` INT NULL,
  `amount` DECIMAL(12,2) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Table: sponsors
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE `sponsors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `logo_icon` VARCHAR(50) NOT NULL,
  `website` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
