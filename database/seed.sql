-- ==========================================================
-- Tennis League Player Auction Initial Seed Data
-- ==========================================================

USE `tennis_auction`;

-- ----------------------------------------------------------
-- 1. Seed Sponsors
-- ----------------------------------------------------------
INSERT INTO `sponsors` (`id`, `category`, `name`, `logo_icon`, `website`) VALUES
(1, 'POWERED BY', 'SportWave', 'sportwave', 'https://sportwave.example.com'),
(2, 'CO-SPONSOR', 'ApexHealth', 'apexhealth', 'https://apexhealth.example.com'),
(3, 'ASSOCIATE SPONSOR', 'NovaTech', 'novatech', 'https://novatech.example.com'),
(4, 'OFFICIAL PARTNER', 'GrandVista', 'grandvista', 'https://grandvista.example.com'),
(5, 'OFFICIAL SPONSOR', 'The Raymond Shop', 'raymond-shop', 'https://www.raymond.in'),
(6, 'OFFICIAL SPONSOR', 'BO Smart Wash', 'smart-wash', 'https://smartwash.example.com'),
(7, 'OFFICIAL SPONSOR', 'Smart Automation', 'smart-automation', 'https://smartautomation.example.com'),
(8, 'OFFICIAL SPONSOR', 'NutriDelight', 'nutridelight', 'https://nutridelight.example.com');

-- ----------------------------------------------------------
-- 2. Seed 4 Teams
-- ----------------------------------------------------------
INSERT INTO `teams` (`id`, `team_number`, `name`, `owner`, `total_purse`, `purse_remaining`, `max_players`, `max_group_a`, `max_group_b`, `logo_url`, `primary_color`, `accent_color`, `glow_color`, `bg_gradient`) VALUES
(1, 1, '7 Aces', 'Kabir Malhotra', 500000.00, 500000.00, 12, 4, 8, '/images/teams/7aces-logo.png', '#374151', '#4b5563', 'rgba(55, 65, 81, 0.45)', 'from-gray-950/40 to-slate-950/80'),
(2, 2, 'Royal Tigers', 'Vikramaditya Roy', 500000.00, 500000.00, 12, 4, 8, '/images/teams/royal-tigers-logo.png', '#012202', '#22c55e', 'rgba(1, 34, 2, 0.45)', 'from-emerald-950/40 to-slate-950/80'),
(3, 3, 'Mighty Dragons', 'Maya Sengupta', 500000.00, 500000.00, 12, 4, 8, '/images/teams/mighty-dragons-logo.png', '#072f58', '#3b82f6', 'rgba(7, 47, 88, 0.45)', 'from-blue-950/40 to-slate-950/80'),
(4, 4, 'Golden Eagles', 'Rohan Iyer', 500000.00, 500000.00, 12, 4, 8, '/images/teams/golden-eagles-logo.png', '#eb0201', '#ef4444', 'rgba(235, 2, 1, 0.45)', 'from-red-950/40 to-slate-950/80');

-- ----------------------------------------------------------
-- 3. Seed Players (44 Players: IDs 2..48 skipping 1, 3, 5, 6)
-- ----------------------------------------------------------
INSERT INTO `players` (`id`, `player_number`, `name`, `age`, `country`, `country_flag`, `category`, `group`, `playing_hand`, `backhand_style`, `jersey_name`, `jersey_number`, `base_price`, `image_url`, `status`, `display_order`) VALUES
(2, 'PLAYER #02', 'Dr Kiran', 39, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Single handed', 'Kiran', '6', 10000, '/images/players2/Dr%20kiran.png', 'live', 1),
(4, 'PLAYER #04', 'I Prakash', 42, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Double handed', 'Prakash', '77', 10000, '/images/players2/I%20Prakash.png', 'upcoming', 2),
(7, 'PLAYER #07', 'K Satyanarayana Raju', 39, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'One handed', 'K S N Raju', '39', 10000, '/images/players2/K%20Satyanarayana%20raju.png', 'upcoming', 3),
(8, 'PLAYER #08', 'Mantena Atchyuth varma', 25, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Double handed', 'Atchyuth', '63', 10000, '/images/players2/Mantena%20Atchyuth%20varma.png', 'upcoming', 4),
(9, 'PLAYER #09', 'M Vamsi krishna', 44, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Double handed', 'Vamsi krishna', '7', 10000, '/images/players2/M%20Vamsi%20krishna.png', 'upcoming', 5),
(10, 'PLAYER #10', 'M V Siva Kumar Raju', 53, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'One handed', 'Siva', '11', 10000, '/images/players2/M%20V%20Shiva%20Kumar%20raju.png', 'upcoming', 6),
(11, 'PLAYER #11', 'P Muralidhar', 40, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Two handed', 'Murali', '7', 10000, '/images/players2/P%20Murali.png', 'upcoming', 7),
(12, 'PLAYER #12', 'P Subash', 47, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'One handed', 'Subash', '9', 10000, '/images/players2/P%20Subash.png', 'upcoming', 8),
(13, 'PLAYER #13', 'Rama Krishna vadlamudi', 46, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'One handed', 'VRK', '9', 10000, '/images/players2/Rama%20Krishna%20vadlamudi.png', 'upcoming', 9),
(14, 'PLAYER #14', 'Royal K', 28, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'One handed', 'Royal', '57', 10000, '/images/players2/Royal%20K.png', 'upcoming', 10),
(15, 'PLAYER #15', 'Sajeev sahay T', 35, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Two handed', 'Sajeev', '7', 10000, '/images/players2/Sajeev%20sahay%20T.png', 'upcoming', 11),
(16, 'PLAYER #16', 'Uday Varma', 41, 'India', '🇮🇳', 'Group A', 'A', 'Right hand', 'Single handed', 'Uday', '5', 10000, '/images/players2/Uday%20Varma.png', 'upcoming', 12),
(17, 'PLAYER #17', 'Abhishek varma Kothapalli', 30, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'Abhishek', '18', 10000, '/images/players2/Abhishek.png', 'upcoming', 13),
(18, 'PLAYER #18', 'Appala raju', 52, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'Appala raju', '9', 10000, '/images/players2/Appala%20raju.png', 'upcoming', 14),
(19, 'PLAYER #19', 'CH Bangar raju', 30, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'CH Bangar raju', '1', 10000, '/images/players2/Bangar%20raju.png', 'upcoming', 15),
(20, 'PLAYER #20', 'BH Gajapathi Raju', 50, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'GP', '63', 10000, '/images/players2/Gajapathi.png', 'upcoming', 16),
(21, 'PLAYER #21', 'Bh. Karthikeya Varma', 30, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'Karthik', '12', 10000, '/images/players2/Karthikeya.png', 'upcoming', 17),
(22, 'PLAYER #22', 'Chandra Sekhar K', 39, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'One handed', 'CHANDU', '6', 10000, '/images/players2/Chandra%20sekhar.png', 'upcoming', 18),
(23, 'PLAYER #23', 'V Bangar raju', 54, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'V Bangar raju', '11', 10000, '/images/players2/V%20Bangar%20raju.png', 'upcoming', 19),
(24, 'PLAYER #24', 'Datta varma', 23, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'Datta', '12', 10000, '/images/players2/Datta%20varma.png', 'upcoming', 20),
(25, 'PLAYER #25', 'Dr G V PAVAN KUMAR', 44, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Not specified', '', '99', 10000, '/images/players2/Pavan.png', 'upcoming', 21),
(26, 'PLAYER #26', 'Dr Shravan', 31, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'Shravan', '3', 10000, '/images/players2/Dr%20Shravan.png', 'upcoming', 22),
(27, 'PLAYER #27', 'Dr Suresh Mudunuri', 45, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Not specified', '', '10', 10000, '/images/players2/Dr%20Suresh%20Mudunuri.png', 'upcoming', 23),
(28, 'PLAYER #28', 'G Subhash', 40, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'G Subhash', '86', 10000, '/images/players2/G%20Subhash.png', 'upcoming', 24),
(29, 'PLAYER #29', 'G V Kiran Kumar raju', 30, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Singh handed', '', '', 10000, '/images/players2/G%20V%20Kiran%20Kumar%20Raju.png', 'upcoming', 25),
(30, 'PLAYER #30', 'G.Gopala krishnam Raju', 48, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Gopi', '7', 10000, '/images/players2/G.Gopala%20krishnam%20Raju.png', 'upcoming', 26),
(31, 'PLAYER #31', 'Grandhi Suresh', 55, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Suresh Grandhi', '72', 10000, '/images/players2/Grandhi%20Suresh.png', 'upcoming', 27),
(32, 'PLAYER #32', 'Jagapati', 53, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', '10', 'Jaggu', 10000, '/images/players2/Jagapathi.png', 'upcoming', 28),
(33, 'PLAYER #33', 'K Srinivasaraju', 61, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Srinu', '99', 10000, '/images/players2/K%20Srinavasraju.png', 'upcoming', 29),
(34, 'PLAYER #34', 'Kalidindi Srinivasavarma', 56, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'Blue', '457', 10000, '/images/players2/Kalidindi%20Srinivasavarma.png', 'upcoming', 30),
(35, 'PLAYER #35', 'Kopparthi ravi babu', 50, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'Ravi', 'O9', 10000, '/images/players2/Kopparthi%20ravi%20babu.png', 'upcoming', 31),
(36, 'PLAYER #36', 'M Rajbabu', 47, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Rajbabu', '1', 10000, '/images/players2/M%20Rajbabu.png', 'upcoming', 32),
(37, 'PLAYER #37', 'M Viswanadha Raju', 51, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Vissu', '62', 10000, '/images/players2/M%20Viswanadha%20Raju.png', 'upcoming', 33),
(38, 'PLAYER #38', 'Naga Firoz Babu', 51, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Firoz', '6', 10000, '/images/players2/Naga%20Firoz%20Babu.png', 'upcoming', 34),
(39, 'PLAYER #39', 'Neerajh Varma', 23, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'Neerajh', '9', 10000, '/images/players2/Neerajh%20Varma.png', 'upcoming', 35),
(40, 'PLAYER #40', 'Nehanth varma', 23, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Double handed', 'Nehanth', '12', 10000, '/images/players2/Nehanth%20varma.png', 'upcoming', 36),
(41, 'PLAYER #41', 'P Subbaraju', 41, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'One handed', 'RF', '444', 10000, '/images/players2/P%20Subbaraju.png', 'upcoming', 37),
(42, 'PLAYER #42', 'Ramu', 53, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'Ramu', '24', 10000, '/images/players2/Ramu.png', 'upcoming', 38),
(43, 'PLAYER #43', 'Ranjith Varma', 38, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Single handed', 'RV', '69 or 6', 10000, '/images/players2/Ranjith%20Varma.png', 'upcoming', 39),
(44, 'PLAYER #44', 'Ravi Varma', 28, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Not specified', '', '7', 10000, '/images/players2/Ravi%20Varma.png', 'upcoming', 40),
(45, 'PLAYER #45', 'Rudraraju sahul varma', 25, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'SAHUL', '15', 10000, '/images/players2/Rudraraju%20sahul%20varma.png', 'upcoming', 41),
(46, 'PLAYER #46', 'Srikanth Penmetsa', 44, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'One handed', 'Srikanth', '1', 10000, '/images/players2/Srikanth%20Penmetsa%20-%20Uniform.png', 'upcoming', 42),
(47, 'PLAYER #47', 'TATAVARTY RAJU', 56, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'TATAVARTY RAJU', '9', 10000, '/images/players2/TATAVARTY%20RAJU.png', 'upcoming', 43),
(48, 'PLAYER #48', 'Vijay kumar Raju', 46, 'India', '🇮🇳', 'Group B', 'B', 'Right hand', 'Two handed', 'VIJAY', '1', 10000, '/images/players2/Vijay%20kumar%20Raju.png', 'upcoming', 44);

-- ----------------------------------------------------------
-- 4. Seed Initial Live Auction State
-- ----------------------------------------------------------
INSERT INTO `auctions` (`id`, `title`, `status`, `current_player_id`, `current_bid`, `highest_bidder_team_id`, `bid_increment`, `timer_seconds`, `timer_remaining`, `timer_running`) VALUES
(1, 'Grand Circuit Tennis Player Auction 2026', 'live', 2, 0.00, NULL, 2000.00, 15, 15, FALSE);
