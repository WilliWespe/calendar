-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 02. Sep 2026 um 18:28
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
-- Tabellenstruktur für Tabelle `events`
--

CREATE TABLE `events` (
  `event_id` char(36) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `type` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL,
  `include_in_mail` tinyint(1) NOT NULL DEFAULT 1,
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

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

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
-- Constraints der exportierten Tabellen
--

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
