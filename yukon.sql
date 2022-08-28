-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 28, 2022 at 02:18 PM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `yukon`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `userId` int(11) NOT NULL,
  `selector` char(36) NOT NULL,
  `validator` char(60) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Authentication tokens for saved logins';

--
-- RELATIONSHIPS FOR TABLE `auth_tokens`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `bans`
--

CREATE TABLE `bans` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `issued` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `moderatorId` int(11) DEFAULT NULL,
  `message` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User ban records';

--
-- RELATIONSHIPS FOR TABLE `bans`:
--   `userId`
--       `users` -> `id`
--   `moderatorId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `buddies`
--

CREATE TABLE `buddies` (
  `userId` int(11) NOT NULL,
  `buddyId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User buddies';

--
-- RELATIONSHIPS FOR TABLE `buddies`:
--   `userId`
--       `users` -> `id`
--   `buddyId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `furnitures`
--

CREATE TABLE `furnitures` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `furnitureId` int(11) NOT NULL,
  `x` smallint(6) NOT NULL DEFAULT 0,
  `y` smallint(6) NOT NULL DEFAULT 0,
  `rotation` smallint(6) NOT NULL DEFAULT 1,
  `frame` smallint(6) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Furniture placed inside igloos';

--
-- RELATIONSHIPS FOR TABLE `furnitures`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `furniture_inventories`
--

CREATE TABLE `furniture_inventories` (
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned furniture';

--
-- RELATIONSHIPS FOR TABLE `furniture_inventories`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `igloos`
--

CREATE TABLE `igloos` (
  `userId` int(11) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 1,
  `flooring` int(11) NOT NULL DEFAULT 0,
  `music` int(11) NOT NULL DEFAULT 0,
  `location` int(11) NOT NULL DEFAULT 1,
  `locked` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User igloo settings';

--
-- RELATIONSHIPS FOR TABLE `igloos`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `igloo_inventories`
--

CREATE TABLE `igloo_inventories` (
  `userId` int(11) NOT NULL,
  `iglooId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned igloos';

--
-- RELATIONSHIPS FOR TABLE `igloo_inventories`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `ignores`
--

CREATE TABLE `ignores` (
  `userId` int(11) NOT NULL,
  `ignoreId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User ignores';

--
-- RELATIONSHIPS FOR TABLE `ignores`:
--   `userId`
--       `users` -> `id`
--   `ignoreId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned clothing';

--
-- RELATIONSHIPS FOR TABLE `inventories`:
--   `userId`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(12) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `password` char(60) NOT NULL,
  `loginKey` text DEFAULT NULL,
  `rank` tinyint(1) NOT NULL DEFAULT 1,
  `permaBan` tinyint(1) NOT NULL DEFAULT 0,
  `joinTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `coins` int(11) NOT NULL DEFAULT 500,
  `head` int(11) NOT NULL DEFAULT 0,
  `face` int(11) NOT NULL DEFAULT 0,
  `neck` int(11) NOT NULL DEFAULT 0,
  `body` int(11) NOT NULL DEFAULT 0,
  `hand` int(11) NOT NULL DEFAULT 0,
  `feet` int(11) NOT NULL DEFAULT 0,
  `color` int(11) NOT NULL DEFAULT 1,
  `photo` int(11) NOT NULL DEFAULT 0,
  `flag` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Users';

--
-- RELATIONSHIPS FOR TABLE `users`:
--

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `trigger_users_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO igloos (userId) VALUES (NEW.id);
    INSERT INTO inventories (userId, itemId) VALUES (NEW.id, NEW.color);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `worlds`
--

CREATE TABLE `worlds` (
  `id` varchar(100) NOT NULL,
  `population` smallint(3) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Server populations';

--
-- RELATIONSHIPS FOR TABLE `worlds`:
--

--
-- Dumping data for table `worlds`
--

INSERT INTO `worlds` (`id`, `population`) VALUES
('Blizzard', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`userId`,`selector`) USING BTREE;

--
-- Indexes for table `bans`
--
ALTER TABLE `bans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `moderatorId` (`moderatorId`);

--
-- Indexes for table `buddies`
--
ALTER TABLE `buddies`
  ADD PRIMARY KEY (`userId`,`buddyId`) USING BTREE,
  ADD KEY `buddies_ibfk_2` (`buddyId`);

--
-- Indexes for table `furnitures`
--
ALTER TABLE `furnitures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`) USING BTREE;

--
-- Indexes for table `furniture_inventories`
--
ALTER TABLE `furniture_inventories`
  ADD PRIMARY KEY (`userId`,`itemId`) USING BTREE;

--
-- Indexes for table `igloos`
--
ALTER TABLE `igloos`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `igloo_inventories`
--
ALTER TABLE `igloo_inventories`
  ADD PRIMARY KEY (`userId`,`iglooId`) USING BTREE;

--
-- Indexes for table `ignores`
--
ALTER TABLE `ignores`
  ADD PRIMARY KEY (`userId`,`ignoreId`) USING BTREE,
  ADD KEY `ignores_ibfk_2` (`ignoreId`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`userId`,`itemId`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`) USING BTREE;

--
-- Indexes for table `worlds`
--
ALTER TABLE `worlds`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bans`
--
ALTER TABLE `bans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `furnitures`
--
ALTER TABLE `furnitures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bans`
--
ALTER TABLE `bans`
  ADD CONSTRAINT `bans_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bans_ibfk_2` FOREIGN KEY (`moderatorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Constraints for table `buddies`
--
ALTER TABLE `buddies`
  ADD CONSTRAINT `buddies_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `buddies_ibfk_2` FOREIGN KEY (`buddyId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `furnitures`
--
ALTER TABLE `furnitures`
  ADD CONSTRAINT `furnitures_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `furniture_inventories`
--
ALTER TABLE `furniture_inventories`
  ADD CONSTRAINT `furniture_inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `igloos`
--
ALTER TABLE `igloos`
  ADD CONSTRAINT `igloos_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `igloo_inventories`
--
ALTER TABLE `igloo_inventories`
  ADD CONSTRAINT `igloo_inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ignores`
--
ALTER TABLE `ignores`
  ADD CONSTRAINT `ignores_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ignores_ibfk_2` FOREIGN KEY (`ignoreId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
