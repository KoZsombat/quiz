-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Sze 16. 20:22
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `quiz`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `active`
--

CREATE TABLE `active` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `q_code` varchar(255) NOT NULL,
  `q_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isPublic` tinyint(1) NOT NULL,
  `question` varchar(255) NOT NULL,
  `options` varchar(255) NOT NULL,
  `answer` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quizzes`
--

INSERT INTO `quizzes` (`code`, `author`, `isPublic`, `question`, `options`, `answer`) VALUES
('asd', '', 0, '1', '[\"1\",\"2\"]', '1'),
('asd', '', 0, '2', '[\"2\",\"3\"]', '2'),
('1', '', 0, '1,2,3', '[\"3\"]', '3'),
('11', '', 0, '1', '[\"11\"]', '11'),
('123uj', '\"asd\"', 1, 'asd', '[\"asd\",\"asdasd\"]', 'asd'),
('123ujj', '\"asd\"', 0, 'asd', '[\"asd\",\"asdasd\"]', 'asd'),
('asdasd', '\"asd\"', 1, 'asd', '[\"asd\",\"asdasd\"]', 'asd'),
('asdasd', '\"asd\"', 1, '1', '[\"1\",\"2\"]', '1');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`username`, `email`, `password`) VALUES
('asd', 'asd@asd.asd', '$2b$10$1WLhLbV5srBMmKJW4gBpnuFdnyrf/iW/lvD/Q..73VI1zwMyUXGXy');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
