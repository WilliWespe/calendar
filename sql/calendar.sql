-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 25. Okt 2026 um 16:21
-- Server-Version: 10.4.28-MariaDB
-- PHP-Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `calendar`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `dictionary`
--

CREATE TABLE `dictionary` (
  `en` varchar(255) NOT NULL,
  `de` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `dictionary`
--

INSERT INTO `dictionary` (`en`, `de`) VALUES
('april', 'april'),
('august', 'august'),
('birthday', 'geburtstag'),
('calendar', 'kalender'),
('december', 'dezember'),
('february', 'februar'),
('free', 'frei'),
('friday', 'freitag'),
('january', 'januar'),
('july', 'juli'),
('june', 'juni'),
('march', 'märz'),
('may', 'mai'),
('monday', 'montag'),
('november', 'november'),
('october', 'oktober'),
('saturday', 'samstag'),
('september', 'september'),
('stuff', 'sonstiges'),
('sunday', 'sonntag'),
('thursday', 'donnerstag'),
('tuesday', 'dienstag'),
('wednesday', 'mittwoch');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `events`
--

CREATE TABLE `events` (
  `event_id` char(36) NOT NULL,
  `event_description` varchar(2000) NOT NULL,
  `event_type` char(36) NOT NULL,
  `event_dot_color` varchar(6) DEFAULT NULL,
  `include_event_in_mail` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_date_ranges`
--

CREATE TABLE `event_date_ranges` (
  `range_id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_ordering`
--

CREATE TABLE `event_ordering` (
  `ordering_id` char(36) NOT NULL,
  `event_id` char(36) NOT NULL,
  `month` tinyint(4) NOT NULL,
  `day` tinyint(4) NOT NULL,
  `position` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_types`
--

CREATE TABLE `event_types` (
  `event_type_id` char(36) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `event_type_background_color` varchar(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `event_types`
--

INSERT INTO `event_types` (`event_type_id`, `event_type`, `event_type_background_color`) VALUES
('9a1fb941-c8c2-11f1-bf3b-4c796e9137c8', 'birthday', 'ffcc02'),
('a19d7430-c8c2-11f1-bf3b-4c796e9137c8', 'stuff', NULL),
('b13a1901-c8c2-11f1-bf3b-4c796e9137c8', 'free', 'e4ff00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `language`
--

CREATE TABLE `language` (
  `user_language` varchar(3) NOT NULL DEFAULT 'de',
  `selected` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `language`
--

INSERT INTO `language` (`user_language`, `selected`) VALUES
('de', 1),
('en', 0);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `dictionary`
--
ALTER TABLE `dictionary`
  ADD PRIMARY KEY (`en`);

--
-- Indizes für die Tabelle `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `fk_events_type` (`event_type`);

--
-- Indizes für die Tabelle `event_date_ranges`
--
ALTER TABLE `event_date_ranges`
  ADD PRIMARY KEY (`range_id`),
  ADD KEY `idx_event` (`event_id`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`);

--
-- Indizes für die Tabelle `event_ordering`
--
ALTER TABLE `event_ordering`
  ADD PRIMARY KEY (`ordering_id`),
  ADD UNIQUE KEY `uk_month_day_position` (`month`,`day`,`position`),
  ADD UNIQUE KEY `uk_event_month_day` (`event_id`,`month`,`day`);

--
-- Indizes für die Tabelle `event_types`
--
ALTER TABLE `event_types`
  ADD PRIMARY KEY (`event_type_id`),
  ADD UNIQUE KEY `uk_event_type` (`event_type`);

--
-- Indizes für die Tabelle `language`
--
ALTER TABLE `language`
  ADD PRIMARY KEY (`user_language`);

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_type` FOREIGN KEY (`event_type`) REFERENCES `event_types` (`event_type_id`);

--
-- Constraints der Tabelle `event_date_ranges`
--
ALTER TABLE `event_date_ranges`
  ADD CONSTRAINT `event_date_ranges_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `event_ordering`
--
ALTER TABLE `event_ordering`
  ADD CONSTRAINT `event_ordering_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
