SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `auth_tokens` (
  `userId` int(11) NOT NULL,
  `selector` char(36) NOT NULL,
  `validator` char(60) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Authentication tokens for saved logins';

CREATE TABLE `bans` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `issued` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `moderatorId` int(11) DEFAULT NULL,
  `message` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User ban records';

CREATE TABLE `buddies` (
  `userId` int(11) NOT NULL,
  `buddyId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User buddies';

CREATE TABLE `cards` (
  `userId` int(11) NOT NULL,
  `cardId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `memberQuantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned Card-Jitsu cards';

CREATE TABLE `furnitures` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `furnitureId` int(11) NOT NULL,
  `x` smallint(6) NOT NULL DEFAULT 0,
  `y` smallint(6) NOT NULL DEFAULT 0,
  `rotation` smallint(6) NOT NULL DEFAULT 1,
  `frame` smallint(6) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Furniture placed inside igloos';

CREATE TABLE `furniture_inventories` (
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned furniture';

CREATE TABLE `igloos` (
  `userId` int(11) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 1,
  `flooring` int(11) NOT NULL DEFAULT 0,
  `music` int(11) NOT NULL DEFAULT 0,
  `location` int(11) NOT NULL DEFAULT 1,
  `locked` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User igloo settings';

CREATE TABLE `igloo_inventories` (
  `userId` int(11) NOT NULL,
  `iglooId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned igloos';

CREATE TABLE `ignores` (
  `userId` int(11) NOT NULL,
  `ignoreId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User ignores';

CREATE TABLE `inventories` (
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User owned clothing';

CREATE TABLE `pets` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `name` varchar(12) NOT NULL,
  `adoptionDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `energy` tinyint(3) NOT NULL DEFAULT 100,
  `health` tinyint(3) NOT NULL DEFAULT 100,
  `rest` tinyint(3) NOT NULL DEFAULT 100,
  `feedPostcardId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='User pets';

CREATE TABLE `postcards` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `senderId` int(11) DEFAULT NULL,
  `postcardId` int(11) NOT NULL,
  `sendDate` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `details` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `hasRead` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User postcards';

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(12) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `password` char(60) NOT NULL,
  `loginKey` text DEFAULT NULL,
  `rank` tinyint(1) NOT NULL DEFAULT 1,
  `permaBan` tinyint(1) NOT NULL DEFAULT 0,
  `joinTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLogin` timestamp NULL DEFAULT NULL,
  `coins` int(11) NOT NULL DEFAULT 500,
  `head` int(11) NOT NULL DEFAULT 0,
  `face` int(11) NOT NULL DEFAULT 0,
  `neck` int(11) NOT NULL DEFAULT 0,
  `body` int(11) NOT NULL DEFAULT 0,
  `hand` int(11) NOT NULL DEFAULT 0,
  `feet` int(11) NOT NULL DEFAULT 0,
  `color` int(11) NOT NULL DEFAULT 1,
  `photo` int(11) NOT NULL DEFAULT 0,
  `flag` int(11) NOT NULL DEFAULT 0,
  `ninjaRank` tinyint(1) NOT NULL DEFAULT 0,
  `ninjaProgress` tinyint(3) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Users';
DELIMITER $$
CREATE TRIGGER `trigger_users_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO igloos (userId) VALUES (NEW.id);
    INSERT INTO inventories (userId, itemId) VALUES (NEW.id, NEW.color);
    INSERT INTO postcards (userId, postcardId) VALUES (NEW.id, 125);
END
$$
DELIMITER ;

CREATE TABLE `worlds` (
  `id` varchar(100) NOT NULL,
  `population` smallint(3) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Server populations';

INSERT INTO `worlds` (`id`, `population`) VALUES
('Blizzard', 0);


ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`userId`,`selector`) USING BTREE;

ALTER TABLE `bans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `moderatorId` (`moderatorId`);

ALTER TABLE `buddies`
  ADD PRIMARY KEY (`userId`,`buddyId`) USING BTREE,
  ADD KEY `buddies_ibfk_2` (`buddyId`);

ALTER TABLE `cards`
  ADD PRIMARY KEY (`userId`,`cardId`);

ALTER TABLE `furnitures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`) USING BTREE;

ALTER TABLE `furniture_inventories`
  ADD PRIMARY KEY (`userId`,`itemId`) USING BTREE;

ALTER TABLE `igloos`
  ADD PRIMARY KEY (`userId`);

ALTER TABLE `igloo_inventories`
  ADD PRIMARY KEY (`userId`,`iglooId`) USING BTREE;

ALTER TABLE `ignores`
  ADD PRIMARY KEY (`userId`,`ignoreId`) USING BTREE,
  ADD KEY `ignores_ibfk_2` (`ignoreId`);

ALTER TABLE `inventories`
  ADD PRIMARY KEY (`userId`,`itemId`) USING BTREE;

ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `feedPostcardId` (`feedPostcardId`) USING BTREE;

ALTER TABLE `postcards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `senderId` (`senderId`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`) USING BTREE;

ALTER TABLE `worlds`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `bans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `furnitures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `postcards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bans`
  ADD CONSTRAINT `bans_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bans_ibfk_2` FOREIGN KEY (`moderatorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

ALTER TABLE `buddies`
  ADD CONSTRAINT `buddies_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `buddies_ibfk_2` FOREIGN KEY (`buddyId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cards`
  ADD CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `furnitures`
  ADD CONSTRAINT `furnitures_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `furniture_inventories`
  ADD CONSTRAINT `furniture_inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `igloos`
  ADD CONSTRAINT `igloos_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `igloo_inventories`
  ADD CONSTRAINT `igloo_inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ignores`
  ADD CONSTRAINT `ignores_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ignores_ibfk_2` FOREIGN KEY (`ignoreId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pets`
  ADD CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pets_ibfk_2` FOREIGN KEY (`feedPostcardId`) REFERENCES `postcards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `postcards`
  ADD CONSTRAINT `postcards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `postcards_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
