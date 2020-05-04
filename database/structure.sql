/*
SQLyog Community
MySQL - 10.1.33-MariaDB : Database - unicsul_f1
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `tb_equipe` */

DROP TABLE IF EXISTS `tb_equipe`;

CREATE TABLE `tb_equipe` (
  `ID_EQUIPE` bigint(20) NOT NULL COMMENT 'Equipe - Chave primária',
  `NM_EQUIPE` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Nome da equipe',
  `ID_PAIS` bigint(20) DEFAULT NULL COMMENT 'País - chave estrangeira',
  PRIMARY KEY (`ID_EQUIPE`),
  KEY `FK_PAIS` (`ID_PAIS`),
  CONSTRAINT `FK_PAIS` FOREIGN KEY (`ID_PAIS`) REFERENCES `tb_pais` (`ID_PAIS`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Table structure for table `tb_pais` */

DROP TABLE IF EXISTS `tb_pais`;

CREATE TABLE `tb_pais` (
  `ID_PAIS` bigint(20) NOT NULL COMMENT 'país - chave primária',
  `NM_PAIS` varchar(70) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Nome do país',
  `NR_POPULACAO` bigint(20) DEFAULT NULL COMMENT 'População do país',
  PRIMARY KEY (`ID_PAIS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
