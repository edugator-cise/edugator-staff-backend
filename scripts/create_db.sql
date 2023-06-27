CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(255) NOT NULL,
  `courseName` VARCHAR(255) NOT NULL, 
  `startDate` DATETIME, 
  `endDate` DATETIME, 
  `logo` VARCHAR(255), 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Organization` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(255) NOT NULL,
  `courseName` VARCHAR(255) NOT NULL,
  `startDate` DATETIME, `endDate` DATETIME,
  `logo` VARCHAR(255),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `organizationId` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Module` (
  `id` VARCHAR(255) NOT NULL,
  `moduleName` VARCHAR(255) NOT NULL,
  `orderNumber` TINYINT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `courseId` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Problem` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `statement` TEXT NOT NULL,
  `hidden` TINYINT(1) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `dueDate` VARCHAR(255) NOT NULL,
  `codeHeader` TEXT NOT NULL,
  `codeBody` TEXT NOT NULL,
  `codeFooter` TEXT NOT NULL,
  `templatePackage` VARCHAR(255) NOT NULL,
  `timeLimit` SMALLINT NOT NULL,
  `memoryLimit` SMALLINT NOT NULL,
  `buildCommand` VARCHAR(255) NOT NULL,
  `languages` VARCHAR(255) NOT NULL,
  `orderNumber` TINYINT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `moduleId` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `TestCase` (
  `id` VARCHAR(255) NOT NULL,
  `testType` VARCHAR(255) NOT NULL,
  `input` TEXT NOT NULL,
  `expectedOutput` TEXT NOT NULL,
  `hint` TEXT,
  `visibility` TINYINT NOT NULL,
  `feedback` TEXT NOT NULL,
  `orderNumber` SMALLINT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `problemId` VARCHAR(255),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Lesson` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `hidden` TINYINT(1) NOT NULL,
  `orderNumber` TINYINT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `moduleId` VARCHAR(255),
  PRIMARY KEY (`id`)
);
