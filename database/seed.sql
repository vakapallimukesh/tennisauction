-- ==========================================================
-- Tennis League Player Auction Initial Seed Data
-- ==========================================================

USE `tennis_auction`;

-- ----------------------------------------------------------
-- 1. Seed Sponsors
-- ----------------------------------------------------------
INSERT INTO `sponsors` (`category`, `name`, `logo_icon`, `website`) VALUES
('POWERED BY', 'SportWave', 'sportwave', 'https://sportwave.example.com'),
('CO-SPONSOR', 'ApexHealth', 'apexhealth', 'https://apexhealth.example.com'),
('ASSOCIATE SPONSOR', 'NovaTech', 'novatech', 'https://novatech.example.com'),
('OFFICIAL PARTNER', 'GrandVista', 'grandvista', 'https://grandvista.example.com');

-- ----------------------------------------------------------
-- 2. Seed 4 Teams
-- ----------------------------------------------------------
INSERT INTO `teams` (`id`, `team_number`, `name`, `tagline`, `owner`, `total_purse`, `purse_remaining`, `max_players`, `logo_url`, `primary_color`, `accent_color`, `glow_color`, `bg_gradient`) VALUES
(1, 1, 'The Racquet Warriors', 'Speed, Spin & Power', 'Rohan Iyer', 200000.00, 125000.00, 5, '/images/teams/team1-lion.svg', '#22c55e', '#4ade80', 'rgba(34, 197, 94, 0.45)', 'from-emerald-950/40 to-slate-950/80'),
(2, 2, 'Ace Storm', 'Precision In Every Serve', 'Vikramaditya Roy', 200000.00, 108000.00, 5, '/images/teams/team2-eagle.svg', '#0ea5e9', '#38bdf8', 'rgba(14, 165, 233, 0.45)', 'from-sky-950/40 to-slate-950/80'),
(3, 3, 'Thunder Bolts', 'Striking Like Lightning', 'Maya Sengupta', 200000.00, 142000.00, 5, '/images/teams/team3-crown.svg', '#a855f7', '#c084fc', 'rgba(168, 85, 247, 0.45)', 'from-purple-950/40 to-slate-950/80'),
(4, 4, 'Fire Servers', 'Feel the Burning Heat', 'Kabir Malhotra', 200000.00, 96000.00, 5, '/images/teams/team4-flame.svg', '#f97316', '#fb923c', 'rgba(249, 115, 22, 0.45)', 'from-orange-950/40 to-slate-950/80');

-- ----------------------------------------------------------
-- 3. Seed Users (1 Admin + 4 Teams)
-- Passwords:
-- admin: admin123
-- team1: team1@auction
-- team2: team2@auction
-- team3: team3@auction
-- team4: team4@auction
-- ----------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `team_id`) VALUES
(1, 'admin', '$2b$10$2/0TlKjh1HTIGlw1VRCpc.VaWcOc1T9u0IcFm9gq.dNwn9D86cR/a', 'Tournament Director', 'admin', NULL),
(2, 'team1', '$2b$10$o/xUKW8afZpQE3USfzyktec//nVn0wvHv66BvgrgMg4/KQkvozrKG', 'The Racquet Warriors Captain', 'team', 1),
(3, 'team2', '$2b$10$WwXQg9A6lRLaGUJ0N/tmcOx.69i7o9fZ23bpIpykJL6gMXE09GO6q', 'Ace Storm Manager', 'team', 2),
(4, 'team3', '$2b$10$WIkkZ7jqDdCGWRSFu3FYkeCfoNrpd5J.78gDu7ZTigHsEwhM/xMiW', 'Thunder Bolts Owner', 'team', 3),
(5, 'team4', '$2b$10$n3RRDZtFdiVU4P41bAtGkexdhTP3urxLj6or2ytU1eyj7tOyuqrNu', 'Fire Servers Head Coach', 'team', 4);

-- ----------------------------------------------------------
-- 4. Seed Players
-- ----------------------------------------------------------
INSERT INTO `players` (`id`, `player_number`, `name`, `age`, `country`, `country_flag`, `category`, `playing_hand`, `world_ranking`, `wins`, `aces`, `matches`, `win_percentage`, `base_price`, `image_url`, `status`, `display_order`) VALUES
(1, 'PLAYER #07', 'Arjun Mehta', 22, 'India', '🇮🇳', 'Singles', 'Right Hand', 148, 32, 87, 47, 68, 10000.00, '/images/players/arjun-mehta.jpg', 'live', 1),
(2, 'PLAYER #12', 'Rohan Iyer', 24, 'India', '🇮🇳', 'Singles', 'Right Hand', 176, 28, 64, 42, 66, 8000.00, '/images/players/rohan-iyer.jpg', 'upcoming', 2),
(3, 'PLAYER #04', 'Liam Carter', 21, 'Australia', '🇦🇺', 'Singles', 'Right Hand', 112, 45, 115, 60, 75, 12000.00, '/images/players/liam-carter.jpg', 'upcoming', 3),
(4, 'PLAYER #09', 'Sana Kapoor', 23, 'India', '🇮🇳', 'Singles', 'Right Hand', 89, 52, 94, 68, 76, 15000.00, '/images/players/sana-kapoor.jpg', 'upcoming', 4),
(5, 'PLAYER #15', 'Vikram Desai', 25, 'India', '🇮🇳', 'Singles', 'Left Hand', 160, 38, 72, 54, 70, 18000.00, '/images/players/vikram-desai.jpg', 'upcoming', 5),
(6, 'PLAYER #18', 'Elena Rostova', 20, 'Spain', '🇪🇸', 'Singles', 'Right Hand', 74, 58, 130, 72, 80, 20000.00, '/images/players/elena-rostova.jpg', 'upcoming', 6),
(7, 'PLAYER #22', 'Mateo Silva', 26, 'Argentina', '🇦🇷', 'All-Rounder', 'Left Hand', 134, 40, 88, 59, 67, 14000.00, '/images/players/mateo-silva.jpg', 'upcoming', 7),
(8, 'PLAYER #27', 'Kenji Tanaka', 22, 'Japan', '🇯🇵', 'Singles', 'Right Hand', 98, 49, 104, 65, 75, 16000.00, '/images/players/kenji-tanaka.jpg', 'upcoming', 8),
-- Pre-sold players
(9, 'PLAYER #01', 'Rohan Iyer (Sr.)', 26, 'India', '🇮🇳', 'Singles', 'Right Hand', 148, 48, 45, 12, 75, 15000.00, '/images/players/rohan-iyer.jpg', 'sold', 9),
(10, 'PLAYER #02', 'Sana Kapoor (Sr.)', 22, 'India', '🇮🇳', 'Singles', 'Right Hand', 132, 34, 32, 10, 70, 10000.00, '/images/players/sana-kapoor.jpg', 'sold', 10),
(11, 'PLAYER #03', 'Arjun Mehta (Sr.)', 24, 'India', '🇮🇳', 'Singles', 'Right Hand', 140, 39, 40, 14, 68, 12000.00, '/images/players/arjun-mehta.jpg', 'sold', 11),
(12, 'PLAYER #05', 'Naveen Reddy', 24, 'India', '🇮🇳', 'Singles', 'Left Hand', 155, 30, 60, 44, 68, 11000.00, '/images/players/devansh-verma.jpg', 'sold', 12),
(13, 'PLAYER #06', 'Lucas Meyer', 23, 'Germany', '🇩🇪', 'All-Rounder', 'Right Hand', 105, 46, 96, 62, 74, 16000.00, '/images/players/lucas-meyer.jpg', 'sold', 13),
(14, 'PLAYER #08', 'Tanvi Joshi', 21, 'India', '🇮🇳', 'Doubles', 'Right Hand', 130, 32, 54, 45, 71, 9000.00, '/images/players/tanvi-joshi.jpg', 'sold', 14),
(15, 'PLAYER #10', 'Marcus Vance', 25, 'USA', '🇺🇸', 'Singles', 'Right Hand', 95, 54, 118, 70, 77, 18000.00, '/images/players/liam-carter.jpg', 'sold', 15),
(16, 'PLAYER #11', 'Priya Nair', 23, 'India', '🇮🇳', 'Singles', 'Right Hand', 142, 33, 62, 48, 68, 12000.00, '/images/players/elena-rostova.jpg', 'sold', 16),
(17, 'PLAYER #14', 'Zack Taylor', 24, 'UK', '🇬🇧', 'All-Rounder', 'Right Hand', 118, 41, 85, 56, 73, 15000.00, '/images/players/vikram-desai.jpg', 'sold', 17);

-- ----------------------------------------------------------
-- 5. Seed Sold Players per Team
-- ----------------------------------------------------------
INSERT INTO `team_players` (`team_id`, `player_id`, `purchase_price`) VALUES
(1, 9, 28000.00),
(1, 10, 25000.00),
(1, 11, 22000.00),
(2, 12, 44000.00),
(2, 13, 48000.00),
(3, 14, 26000.00),
(3, 15, 32000.00),
(4, 16, 50000.00),
(4, 17, 54000.00);

-- ----------------------------------------------------------
-- 6. Seed Initial Live Auction State
-- ----------------------------------------------------------
INSERT INTO `auctions` (`id`, `title`, `status`, `current_player_id`, `current_bid`, `highest_bidder_team_id`, `bid_increment`, `timer_seconds`, `timer_remaining`, `timer_running`) VALUES
(1, 'Tennis Premier League - Player Auction 2026', 'live', 1, 42000.00, 2, 2000.00, 15, 15, TRUE);

-- ----------------------------------------------------------
-- 7. Seed Recent Bids
-- ----------------------------------------------------------
INSERT INTO `bids` (`auction_id`, `player_id`, `team_id`, `amount`) VALUES
(1, 1, 1, 36000.00),
(1, 1, 3, 38000.00),
(1, 1, 4, 40000.00),
(1, 1, 2, 42000.00);
