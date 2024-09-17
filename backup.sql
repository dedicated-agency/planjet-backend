-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: task_manager
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Group`
--

DROP TABLE IF EXISTS `Group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Group` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Group`
--

LOCK TABLES `Group` WRITE;
/*!40000 ALTER TABLE `Group` DISABLE KEYS */;
INSERT INTO `Group` VALUES ('1711516664','Developer ThreeBridge'),('1783342213','sbsa'),('1958325225','Markt v2'),('2124515037','Catalog Notifications'),('2169977839','Кеш Апп');
/*!40000 ALTER TABLE `Group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `GroupUser`
--

DROP TABLE IF EXISTS `GroupUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GroupUser` (
  `group_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `GroupUser_group_id_user_id_key` (`group_id`,`user_id`),
  KEY `GroupUser_user_id_fkey` (`user_id`),
  CONSTRAINT `GroupUser_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `GroupUser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`telegram_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GroupUser`
--

LOCK TABLES `GroupUser` WRITE;
/*!40000 ALTER TABLE `GroupUser` DISABLE KEYS */;
INSERT INTO `GroupUser` VALUES ('1783342213','104000893'),('2124515037','104000893'),('2169977839','104000893'),('1711516664','1117463350'),('1783342213','111852317'),('1711516664','1321635491'),('1783342213','1448242182'),('1958325225','1448242182'),('2124515037','1448242182'),('1783342213','1464649098'),('2124515037','1464649098'),('2169977839','1464649098'),('2169977839','1598032007'),('1711516664','1613300547'),('1711516664','1670563502'),('1711516664','1719320782'),('1711516664','1915495444'),('1711516664','1936404380'),('1711516664','5112656882'),('1711516664','5146941748'),('1711516664','5173030747'),('1711516664','5211670666'),('1711516664','5673577167'),('1783342213','5673577167'),('1711516664','5685164063'),('1711516664','5762487572'),('1711516664','5880856970'),('1783342213','600818046'),('2124515037','600818046'),('1711516664','6392979719'),('1711516664','6608517457'),('1711516664','7157783385'),('1711516664','7330920954'),('2169977839','866652128'),('1711516664','965494451'),('2124515037','965494451');
/*!40000 ALTER TABLE `GroupUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Project`
--

DROP TABLE IF EXISTS `Project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `add_permission` tinyint(1) NOT NULL DEFAULT '0',
  `edit_permission` tinyint(1) NOT NULL DEFAULT '0',
  `status_permission` tinyint(1) NOT NULL DEFAULT '0',
  `archive_permission` tinyint(1) NOT NULL DEFAULT '0',
  `delete_permission` tinyint(1) NOT NULL DEFAULT '0',
  `comment_permission` tinyint(1) NOT NULL DEFAULT '0',
  `notification_lang` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  PRIMARY KEY (`id`),
  KEY `Project_group_id_fkey` (`group_id`),
  CONSTRAINT `Project_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Project`
--

LOCK TABLES `Project` WRITE;
/*!40000 ALTER TABLE `Project` DISABLE KEYS */;
INSERT INTO `Project` VALUES (2,'1958325225','285','Users',1,0,0,0,0,0,'en'),(3,'2124515037','555','olma',0,0,0,0,0,0,'en'),(4,'2124515037','1','General',1,0,1,0,0,0,'en'),(5,'2124515037','1181','car',0,0,0,0,0,0,'en'),(6,'1783342213','1','General',1,0,1,0,0,0,'en'),(7,'1783342213','3481','Manit',1,0,0,0,0,0,'en'),(8,'1711516664','1','General',1,0,0,0,0,0,'en'),(9,'1783342213','4272','task manager',0,0,0,0,0,0,'en'),(10,'2169977839','1','General',1,0,0,0,0,0,'en'),(11,'2124515037','618','Tester',0,0,0,0,0,0,'en'),(12,'2124515037','1327','Test',0,0,0,0,0,0,'en'),(13,'1783342213','4565','brusnika (kontur)',0,0,0,0,0,0,'en');
/*!40000 ALTER TABLE `Project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Status`
--

DROP TABLE IF EXISTS `Status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Status_project_id_fkey` (`project_id`),
  CONSTRAINT `Status_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Status`
--

LOCK TABLES `Status` WRITE;
/*!40000 ALTER TABLE `Status` DISABLE KEYS */;
INSERT INTO `Status` VALUES (5,2,'To do',1),(6,2,'In Progress',2),(7,2,'Testing',3),(8,2,'Completed',4),(9,5,'To do',1),(10,5,'In Progress',2),(11,5,'Testing',3),(12,5,'Completed',4),(13,4,'To do',1),(14,4,'In Progress',2),(15,4,'Testing',3),(17,7,'To do',1),(18,7,'In Progress',2),(19,7,'Testing',3),(20,7,'Completed',4),(21,8,'To do',1),(22,8,'In Progress',2),(23,8,'Testing',3),(24,8,'Completed',4),(25,11,'To do',1),(26,11,'In Progress',2),(27,11,'Testing',3),(28,11,'Completed',4),(29,4,'Completed',4),(30,12,'To do',1),(31,12,'In Progress',2),(32,12,'Testing',3),(33,12,'Completed',4);
/*!40000 ALTER TABLE `Status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Task`
--

DROP TABLE IF EXISTS `Task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_id` int NOT NULL,
  `project_id` int NOT NULL,
  `message_id` int DEFAULT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participants` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `deadline` datetime(3) DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `is_archive` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '2',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `point` int DEFAULT NULL,
  `point_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Task_project_id_fkey` (`project_id`),
  KEY `Task_status_id_fkey` (`status_id`),
  KEY `Task_user_id_fkey` (`user_id`),
  CONSTRAINT `Task_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Task_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `Status` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Task_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`telegram_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Task`
--

LOCK TABLES `Task` WRITE;
/*!40000 ALTER TABLE `Task` DISABLE KEYS */;
INSERT INTO `Task` VALUES (2,5,2,303,'1448242182','1448242182','olma',NULL,NULL,0,0,2,'2024-08-15 07:11:59.195','2024-08-15 07:11:59.195',NULL,NULL),(3,5,2,309,'1448242182','1448242182','bum bum bum bum bum',NULL,NULL,0,0,2,'2024-08-15 10:22:02.389','2024-08-15 10:22:02.389',NULL,NULL),(4,9,5,1548,'1448242182','1448242182','olmani',NULL,NULL,0,0,2,'2024-08-15 12:16:50.012','2024-08-15 12:16:50.012',NULL,NULL),(5,13,4,1539,'1448242182','1448242182','made in chine',NULL,NULL,0,0,2,'2024-08-15 12:21:07.831','2024-08-15 12:21:07.831',NULL,NULL),(6,13,4,1559,'1448242182','1448242182','olma',NULL,NULL,0,0,2,'2024-08-15 12:24:25.520','2024-08-15 12:24:25.520',NULL,NULL),(7,13,4,1567,'1448242182','1448242182','yangi general tekshiruv',NULL,NULL,0,0,2,'2024-08-15 12:30:03.202','2024-08-15 12:30:03.202',NULL,NULL),(8,13,4,1578,'1448242182','1448242182','qoshildi',NULL,NULL,0,0,2,'2024-08-15 13:28:28.813','2024-08-15 13:28:28.813',NULL,NULL),(9,13,4,1584,'1448242182','1448242182','сизга органганига битта таск бор. gitlab/github га охшаган платформ озимизни серверда запуск килишимиз керак. опен сорс канака вариантлар бор экан. 1-2 та си ни озиз кориб, яхшисини айтинг',NULL,NULL,0,0,2,'2024-08-16 06:13:03.348','2024-08-16 06:13:03.348',NULL,NULL),(10,13,4,1588,'1448242182','1448242182','olma',NULL,NULL,0,0,2,'2024-08-16 07:16:49.426','2024-08-16 07:16:49.426',NULL,NULL),(11,13,4,1592,'1448242182','1448242182','olma',NULL,NULL,0,0,2,'2024-08-16 07:18:19.067','2024-08-16 07:18:19.067',NULL,NULL),(12,13,4,4430,'1448242182','1448242182','сизга органганига битта таск бор. gitlab/github га охшаган платформ озимизни серверда запуск килишимиз керак. опен сорс канака вариантлар бор экан. 1-2 та си ни озиз кориб, яхшисини айтинг',NULL,NULL,0,0,2,'2024-08-16 07:19:43.842','2024-08-16 07:19:43.842',NULL,NULL),(13,13,4,4455,'1448242182','1448242182','new task mande',NULL,NULL,0,0,2,'2024-08-16 08:59:54.972','2024-08-16 08:59:54.972',NULL,NULL),(14,13,4,4460,'1448242182','1448242182','new test',NULL,NULL,0,0,2,'2024-08-16 09:02:26.846','2024-08-16 09:02:26.846',NULL,NULL),(15,13,4,1620,'965494451','965494451','new task',NULL,NULL,0,0,2,'2024-08-16 13:17:48.004','2024-08-16 13:17:48.004',NULL,NULL),(16,13,4,1624,'965494451','965494451','nima qilish kerak',NULL,NULL,0,0,2,'2024-08-16 13:34:03.190','2024-08-16 13:34:03.190',NULL,NULL),(17,13,4,1627,'965494451','965494451','nima qilish kerak ahdhdh',NULL,NULL,0,0,2,'2024-08-16 13:35:57.643','2024-08-16 13:35:57.643',NULL,NULL),(18,17,7,4507,'1448242182','1448242182','1) Промокод на главной странице Яндекса есть, а в ...','1) Промокод на главной странице Яндекса есть, а в папке промокод его нет, только Грузовичкоф.  \n\n2) На карте открываются точки которых в бекенде нет. Мы их удалили. Видимо может они в ручную их добавляли .',NULL,0,0,2,'2024-08-20 09:16:32.445','2024-08-20 09:16:32.445',NULL,NULL),(19,21,8,18067,'965494451','965494451','Islomjon laravelda ishlab tashlang va tugating','',NULL,0,0,2,'2024-08-20 11:07:15.404','2024-08-20 11:07:15.404',NULL,NULL),(20,21,8,18079,'965494451','965494451','ha hoz wu yozganizdi add taskga yozib beradimi','',NULL,0,0,2,'2024-08-20 11:09:07.032','2024-08-20 11:09:07.032',NULL,NULL),(21,21,8,18074,'7330920954','7330920954','qaysini tugatib tawley ?','',NULL,0,0,2,'2024-08-20 11:09:44.289','2024-08-20 11:09:44.289',NULL,NULL),(22,28,11,1660,'965494451','965494451','New test','',NULL,1,0,2,'2024-08-20 13:27:02.017','2024-08-20 13:27:02.017',NULL,NULL),(23,25,11,1660,'1448242182','1448242182','New test','',NULL,0,0,2,'2024-08-20 13:32:42.291','2024-08-20 13:32:42.291',NULL,NULL),(24,13,4,1681,'1448242182','1448242182','emoji test','',NULL,0,0,2,'2024-08-20 14:11:36.836','2024-08-20 14:11:36.836',NULL,NULL),(25,21,8,18137,'965494451','965494451','olmani yenglar','',NULL,0,0,2,'2024-08-21 06:01:07.538','2024-08-21 06:01:07.538',NULL,NULL),(26,13,4,1714,'1448242182','1448242182','reaction test','',NULL,0,0,2,'2024-08-21 06:24:14.581','2024-08-21 06:24:14.581',NULL,NULL),(27,13,4,1718,'1448242182','1448242182','new reaction test','',NULL,0,0,2,'2024-08-21 06:33:02.925','2024-08-21 06:33:02.925',NULL,NULL),(28,13,4,1722,'1448242182','1448242182','new reactiontest message','',NULL,0,0,2,'2024-08-21 06:36:02.803','2024-08-21 06:36:02.803',NULL,NULL),(29,13,4,1727,'1448242182','1448242182','talk and about','',NULL,0,0,2,'2024-08-21 07:01:46.170','2024-08-21 07:01:46.170',NULL,NULL),(30,13,4,1730,'1448242182','1448242182','talk','',NULL,0,0,2,'2024-08-21 07:04:12.322','2024-08-21 07:04:12.322',NULL,NULL),(31,25,11,1732,'1448242182','1448242182','task','',NULL,0,0,2,'2024-08-21 07:05:24.622','2024-08-21 07:05:24.622',NULL,NULL),(32,13,4,1734,'1448242182','1448242182','olma','',NULL,0,0,2,'2024-08-21 07:07:59.386','2024-08-21 07:07:59.386',NULL,NULL),(33,29,4,1738,'1448242182','1448242182','olmalar','',NULL,1,0,2,'2024-08-21 07:12:13.621','2024-08-21 07:12:13.621',NULL,NULL),(34,28,11,1756,'1448242182','1448242182','new emoji test','',NULL,1,0,2,'2024-08-21 09:12:53.414','2024-08-21 09:12:53.414',NULL,NULL),(35,13,4,1759,'1448242182','1448242182','olma .uz site','',NULL,0,0,2,'2024-08-21 09:48:36.520','2024-08-21 09:48:36.520',NULL,NULL),(36,29,4,1763,'1448242182','1448242182','new emoticon test message','',NULL,1,0,2,'2024-08-21 09:56:59.205','2024-08-21 09:56:59.205',NULL,NULL),(37,25,11,1769,'1448242182','1448242182','new test comment task','',NULL,0,0,2,'2024-08-21 10:33:55.870','2024-08-21 10:33:55.870',NULL,NULL),(38,30,12,1800,'1448242182','1448242182','new test comment task on server','',NULL,0,0,2,'2024-08-21 10:47:06.878','2024-08-21 10:47:06.878',NULL,NULL),(39,5,2,316,'1448242182','1448242182','olma nima','',NULL,0,0,2,'2024-08-22 06:39:54.338','2024-08-22 06:39:54.338',NULL,NULL);
/*!40000 ALTER TABLE `Task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskChange`
--

DROP TABLE IF EXISTS `TaskChange`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaskChange` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'status',
  `old_value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaskChange_task_id_fkey` (`task_id`),
  KEY `TaskChange_user_id_fkey` (`user_id`),
  CONSTRAINT `TaskChange_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TaskChange_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`telegram_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskChange`
--

LOCK TABLES `TaskChange` WRITE;
/*!40000 ALTER TABLE `TaskChange` DISABLE KEYS */;
INSERT INTO `TaskChange` VALUES (2,2,'1448242182','created','created','created','2024-08-15 07:11:59.714'),(3,3,'1448242182','created','created','created','2024-08-15 10:22:02.967'),(4,4,'1448242182','created','created','created','2024-08-15 12:16:50.916'),(5,5,'1448242182','created','created','created','2024-08-15 12:21:08.354'),(6,6,'1448242182','created','created','created','2024-08-15 12:24:26.049'),(7,6,'1448242182','created','created','created','2024-08-15 12:25:54.777'),(8,6,'1448242182','created','created','created','2024-08-15 12:27:28.203'),(9,7,'1448242182','created','created','created','2024-08-15 12:30:03.927'),(10,5,'1448242182','created','created','created','2024-08-15 13:13:08.576'),(11,8,'1448242182','created','created','created','2024-08-15 13:28:29.588'),(12,9,'1448242182','created','created','created','2024-08-16 06:13:03.885'),(13,10,'1448242182','created','created','created','2024-08-16 07:16:49.954'),(14,11,'1448242182','created','created','created','2024-08-16 07:18:19.577'),(15,12,'1448242182','created','created','created','2024-08-16 07:19:44.353'),(16,12,'1448242182','created','created','created','2024-08-16 07:21:19.553'),(17,12,'1448242182','created','created','created','2024-08-16 08:50:59.722'),(18,13,'1448242182','created','created','created','2024-08-16 08:59:55.581'),(19,14,'1448242182','created','created','created','2024-08-16 09:02:27.540'),(20,14,'1448242182','created','created','created','2024-08-16 09:08:42.798'),(21,15,'965494451','created','created','created','2024-08-16 13:17:48.796'),(22,15,'965494451','created','created','created','2024-08-16 13:32:00.622'),(23,16,'965494451','created','created','created','2024-08-16 13:34:03.207'),(24,17,'965494451','created','created','created','2024-08-16 13:35:57.697'),(25,18,'1448242182','created','created','created','2024-08-20 09:16:32.473'),(26,19,'965494451','created','created','created','2024-08-20 11:07:15.420'),(27,20,'965494451','created','created','created','2024-08-20 11:09:07.046'),(28,21,'7330920954','created','created','created','2024-08-20 11:09:44.302'),(29,22,'965494451','created','created','created','2024-08-20 13:27:02.039'),(30,23,'1448242182','created','created','created','2024-08-20 13:32:42.307'),(31,22,'965494451','status','To do','Completed','2024-08-20 13:35:14.691'),(32,22,'1448242182','status','Completed','Completed','2024-08-20 13:38:39.505'),(33,23,'1448242182','created','created','created','2024-08-20 13:39:11.984'),(34,22,'1448242182','status','Completed','Completed','2024-08-20 13:39:47.931'),(35,22,'1448242182','status','Completed','Completed','2024-08-20 13:41:43.652'),(36,22,'1448242182','status','Completed','Completed','2024-08-20 13:43:53.948'),(37,22,'1448242182','status','Completed','Completed','2024-08-20 13:44:53.812'),(38,22,'1448242182','status','Completed','Completed','2024-08-20 14:04:02.271'),(39,24,'1448242182','created','created','created','2024-08-20 14:11:36.854'),(40,25,'965494451','created','created','created','2024-08-21 06:01:07.586'),(41,26,'1448242182','created','created','created','2024-08-21 06:24:14.606'),(42,27,'1448242182','created','created','created','2024-08-21 06:33:02.969'),(43,27,'1448242182','created','created','created','2024-08-21 06:34:38.721'),(44,28,'1448242182','created','created','created','2024-08-21 06:36:02.847'),(45,28,'1448242182','created','created','created','2024-08-21 06:53:22.242'),(46,29,'1448242182','created','created','created','2024-08-21 07:01:46.205'),(47,29,'1448242182','created','created','created','2024-08-21 07:02:25.809'),(48,30,'1448242182','created','created','created','2024-08-21 07:04:12.339'),(49,31,'1448242182','created','created','created','2024-08-21 07:05:24.643'),(50,32,'1448242182','created','created','created','2024-08-21 07:07:59.403'),(51,29,'1448242182','created','created','created','2024-08-21 07:09:38.921'),(52,33,'1448242182','created','created','created','2024-08-21 07:12:13.641'),(53,33,'1448242182','status','To do','Completed','2024-08-21 08:56:40.277'),(54,33,'1448242182','status','Completed','Completed','2024-08-21 09:02:57.572'),(55,34,'1448242182','created','created','created','2024-08-21 09:12:53.426'),(56,34,'1448242182','status','To do','Completed','2024-08-21 09:13:01.968'),(57,35,'1448242182','created','created','created','2024-08-21 09:48:36.560'),(58,36,'1448242182','created','created','created','2024-08-21 09:56:59.218'),(59,36,'1448242182','status','To do','Completed','2024-08-21 09:57:04.963'),(60,37,'1448242182','created','created','created','2024-08-21 10:33:55.893'),(61,37,'1448242182','status','comment','yaxshi ishlayaptimi','2024-08-21 10:34:15.999'),(62,38,'1448242182','created','created','created','2024-08-21 10:47:06.890'),(63,38,'1448242182','status','comment','yaxshimi','2024-08-21 10:47:15.486'),(64,3,'1448242182','status','comment','o\'xshadi shekili','2024-08-21 10:47:25.021'),(65,39,'1448242182','created','created','created','2024-08-22 06:39:54.352'),(66,39,'1448242182','comment','comment','qanday bu','2024-08-22 06:40:19.686');
/*!40000 ALTER TABLE `TaskChange` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskComment`
--

DROP TABLE IF EXISTS `TaskComment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaskComment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `message_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `TaskComment_task_id_fkey` (`task_id`),
  KEY `TaskComment_user_id_fkey` (`user_id`),
  CONSTRAINT `TaskComment_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TaskComment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`telegram_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskComment`
--

LOCK TABLES `TaskComment` WRITE;
/*!40000 ALTER TABLE `TaskComment` DISABLE KEYS */;
INSERT INTO `TaskComment` VALUES (1,37,'1448242182','yaxshi ishlayaptimi','2024-08-21 10:34:15.985','1771'),(2,37,'1448242182','ha zo\'r','2024-08-21 10:34:40.108','1772'),(3,38,'1448242182','yaxshimi','2024-08-21 10:47:15.471','1802'),(4,38,'1448242182','o\'xshadi shekili','2024-08-21 10:47:25.004','1803'),(5,39,'1448242182','qanday bu','2024-08-22 06:40:19.674','319');
/*!40000 ALTER TABLE `TaskComment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskUser`
--

DROP TABLE IF EXISTS `TaskUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaskUser` (
  `task_id` int NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `TaskUser_task_id_user_id_key` (`task_id`,`user_id`),
  KEY `TaskUser_user_id_fkey` (`user_id`),
  CONSTRAINT `TaskUser_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TaskUser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`telegram_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskUser`
--

LOCK TABLES `TaskUser` WRITE;
/*!40000 ALTER TABLE `TaskUser` DISABLE KEYS */;
INSERT INTO `TaskUser` VALUES (9,'1448242182'),(12,'1448242182'),(12,'1464649098'),(19,'7330920954');
/*!40000 ALTER TABLE `TaskUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `telegram_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  PRIMARY KEY (`telegram_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('104000893','hokim','hokim',NULL,'en'),('1117463350','+998 91 *** ** 16','DEVELOPER_0414',NULL,'en'),('111852317','Назаров','Nazarov_97',NULL,'ru'),('1321635491','Ismoilxon_AKT👨‍💻','Ismoilxonoff_30_03',NULL,'en'),('1448242182','Munir','SMART_DIE',NULL,'en'),('1464649098','zafarali','username200434',NULL,'ru'),('1598032007','Mahdiy','mahdiy_dev',NULL,'en'),('1613300547','• ᴛʜᴇ ʀɪᴄʜ •','mamadaliyev_ab',NULL,'en'),('1670563502','•_•','Nothing_g_g_g',NULL,'en'),('1719320782','Arabjon 🇵🇸','Arabjon_nishonov',NULL,'en'),('1915495444','Muhammad Ali','Alone_BlvcK',NULL,'en'),('1936404380','Mahdi',NULL,NULL,'en'),('5112656882','...','DEVELOPER_04_14',NULL,'en'),('5146941748','DarkByte','peakyfury',NULL,'en'),('5173030747','Azamov','azamov7787',NULL,'en'),('5211670666','Zikrillo','zikrillo_azamov',NULL,'en'),('5673577167','Muhammad','dayless_nights',NULL,'en'),('5685164063','Azizbek','Azizxan_o9_o9',NULL,'en'),('5762487572','ads','ads_Soliyev',NULL,'en'),('5880856970','Deadshoot 65','Deadshoot65',NULL,'en'),('600818046','amir','amirstmv',NULL,'ru'),('6392979719','⚜ THE RICH ⚜','The_Richfx',NULL,'en'),('6608517457','乂〰️乂','RiCH_1422',NULL,'en'),('7157783385','Azizbek','peaky_furyme',NULL,'en'),('7330920954','Nomonov','Nomonov_Islomjon',NULL,'en'),('866652128','Kholturaev','Kholturaev_A',NULL,'en'),('965494451','Bekzod','DRACULA131313',NULL,'en');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('6f09a037-a5df-40f3-a961-57114b259484','b32a11f14cdac141d20c6e24ad302cbd13c6f6add5a17106ec15c197cf35975a','2024-08-15 06:12:06.353','20240815061204_comment_uniq',NULL,NULL,'2024-08-15 06:12:04.953',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-16 18:44:53
