-- Crear base de datos
CREATE DATABASE ClickerEmpireDB;
USE ClickerEmpireDB;

-- Crear tabla USERS
CREATE TABLE USERS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'player') NOT NULL DEFAULT 'player',  -- 'admin' o 'player'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla PLAYERS
CREATE TABLE PLAYERS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(100) UNIQUE NOT NULL,
  store_name VARCHAR(100),
  olives_count BIGINT,
  olives_count_total BIGINT,
  olives_count_clicked BIGINT,
  products_owned TEXT,  -- JSON o string para representar productos y cantidades
  upgrades_owned TEXT,  -- JSON con las mejoras que el jugador tiene
  achievements_count INT DEFAULT 0,
  achievements_obtained TEXT,  -- JSON con los logros desbloqueados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USERS(id)
);

-- Crear tabla PRODUCTS
CREATE TABLE PRODUCTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  image VARCHAR(255),  -- URL de la imagen
  price DECIMAL(65, 0),  -- El coste de la mejora
  bonus FLOAT  -- Aumento en el rendimiento de producción o cualquier otro bono
);

-- Crear tabla UPGRADES
CREATE TABLE UPGRADES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idForProduct INT,
  name VARCHAR(100),
  description TEXT,
  image VARCHAR(255),
  price DECIMAL(65, 0),  -- El coste de la mejora
  bonus BIGINT,  -- Aumento en el rendimiento de producción o cualquier otro bono
  type ENUM('clickDuplicate', 'clickPercent', 'production', 'opsPercent')  -- Tipo de mejora
);

-- Crear tabla OILS
CREATE TABLE OILS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  image VARCHAR(255),  -- URL de la imagen
  achievements_required INT   -- Número de logros que un jugador debe tener completados para desbloquear el aceite
);

-- Crear tabla QUOTES
CREATE TABLE QUOTES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote TEXT,
  olives_count BIGINT  -- El número de aceitunas asociadas a la cita
);

-- Crear tabla ACHIEVEMENTS
CREATE TABLE ACHIEVEMENTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idForProduct INT,
  name VARCHAR(100),
  description TEXT,
  value DECIMAL(65, 0),  -- Valor asociado al logro
  type ENUM('harvest', 'harvestPerSecond', 'harvestClick', 'productionAmount', 'unique')  -- Tipo de logro
);

-- Crear tabla CATEGORIES
CREATE TABLE CATEGORIES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL  -- Nombre de la categoría: "Opiniones", "Incidencias"
);

-- Crear tabla COMMENTS
CREATE TABLE COMMENTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  content TEXT,  -- El contenido del comentario
  category_id INT,  -- El tipo de categoría del comentario
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USERS(id),
  FOREIGN KEY (category_id) REFERENCES CATEGORIES(id)
);
