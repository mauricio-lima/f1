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
/*Table structure for table `tb_circuito` */

DROP TABLE IF EXISTS `tb_circuito`;

CREATE TABLE `tb_circuito` (
  `ID_CIRCUITO` bigint(20) NOT NULL COMMENT 'Circuito - Chave primária',
  `NM_CIRCUITO` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Nome do circuito',
  `NR_EXTENSAO` float DEFAULT NULL COMMENT 'Extensão do circuito',
  `ID_PAIS` bigint(20) DEFAULT NULL COMMENT 'País - chave estrangeira - país onde o circuito se localiza',
  PRIMARY KEY (`ID_CIRCUITO`),
  KEY `FK_PAIS_CIRCUITO` (`ID_PAIS`),
  CONSTRAINT `FK_PAIS_CIRCUITO` FOREIGN KEY (`ID_PAIS`) REFERENCES `tb_pais` (`ID_PAIS`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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

/*Table structure for table `tb_piloto` */

DROP TABLE IF EXISTS `tb_piloto`;

CREATE TABLE `tb_piloto` (
  `ID_PILOTO` bigint(20) NOT NULL COMMENT 'Piloto - Chave primária',
  `NM_PILOTO` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Nome do piloto',
  `DT_NASCIMENTO` date DEFAULT NULL COMMENT 'Data de nascimento do piloto',
  `ID_PAIS` bigint(20) DEFAULT NULL COMMENT 'País - chave estrangeira',
  `ID_EQUIPE` bigint(20) DEFAULT NULL COMMENT 'Equipe - chave estrangeira',
  PRIMARY KEY (`ID_PILOTO`),
  KEY `FK_PILOTO_PAIS` (`ID_PAIS`),
  KEY `FK_PILOTO_EQUIPE` (`ID_EQUIPE`),
  CONSTRAINT `FK_PILOTO_EQUIPE` FOREIGN KEY (`ID_EQUIPE`) REFERENCES `tb_equipe` (`ID_EQUIPE`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_PILOTO_PAIS` FOREIGN KEY (`ID_PAIS`) REFERENCES `tb_pais` (`ID_PAIS`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Table structure for table `tb_prova` */

DROP TABLE IF EXISTS `tb_prova`;

CREATE TABLE `tb_prova` (
  `ID_PROVA` bigint(20) NOT NULL COMMENT 'Prova - Chave primária',
  `DT_PROVA` date DEFAULT NULL COMMENT 'Data de realização da prova',
  `NM_SITUACAO` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ID_CIRCUITO` bigint(20) DEFAULT NULL COMMENT 'Circuito da prova - chave estrangeira',
  PRIMARY KEY (`ID_PROVA`),
  KEY `FK_PROVA_CIRCUITO` (`ID_CIRCUITO`),
  CONSTRAINT `FK_PROVA_CIRCUITO` FOREIGN KEY (`ID_CIRCUITO`) REFERENCES `tb_circuito` (`ID_CIRCUITO`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Table structure for table `tb_resultado` */

DROP TABLE IF EXISTS `tb_resultado`;

CREATE TABLE `tb_resultado` (
  `ID_PROVA` bigint(20) NOT NULL COMMENT 'prova - chave estrangeira - referência a item na tabela de provas',
  `ID_PILOTO` bigint(20) NOT NULL COMMENT 'piloto - chave estrangeira - referência a item na tabela de pilotos',
  `NR_TEMPO_PROVA` float DEFAULT NULL COMMENT 'tempo de prova do piloto referenciado',
  `NR_COLOC_FINAL` smallint(6) DEFAULT NULL COMMENT 'colocação final do piloto referenciado',
  `NR_POSICAO_GRID` smallint(6) DEFAULT NULL COMMENT 'posição no grid de largada do piloto referenciado',
  `NR_MELHOR_VOLTA` int(11) DEFAULT NULL COMMENT 'número da melhor volta do piloto referenciado na prova referenciada',
  KEY `FK_RESULTADO_PROVA` (`ID_PROVA`),
  KEY `FK_RESULTADO_PILOTO` (`ID_PILOTO`),
  CONSTRAINT `FK_RESULTADO_PILOTO` FOREIGN KEY (`ID_PILOTO`) REFERENCES `tb_piloto` (`ID_PILOTO`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_RESULTADO_PROVA` FOREIGN KEY (`ID_PROVA`) REFERENCES `tb_prova` (`ID_PROVA`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
