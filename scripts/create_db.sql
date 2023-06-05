CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(255) NOT NULL , 
  `courseName` VARCHAR(255) NOT NULL, 
  `startDate` DATETIME, 
  `endDate` DATETIME, 
  `logo` VARCHAR(255), 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  PRIMARY KEY (`id`)
)

