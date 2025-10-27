CREATE DATABASE IF NOT EXISTS cms_db;
USE cms_db;

CREATE TABLE cms_products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  core_product_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  status VARCHAR(50),
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_core_product_id ON cms_products(core_product_id);

CREATE TABLE processed_events (
  event_id VARCHAR(100) PRIMARY KEY,
  table_name VARCHAR(50),
  record_id BIGINT,
  operation VARCHAR(20),
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dlq_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(100),
  table_name VARCHAR(50),
  operation VARCHAR(20),
  payload JSON,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  status ENUM('PENDING', 'RETRYING', 'FAILED', 'SUCCESS') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_retry_at TIMESTAMP NULL
);

CREATE TABLE cms_customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  core_customer_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_core_customer_id ON cms_customers(core_customer_id);
CREATE INDEX idx_email_cms ON cms_customers(email);

CREATE TABLE cms_orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  core_order_id BIGINT NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50),
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES cms_customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_core_order_id ON cms_orders(core_order_id);
CREATE INDEX idx_customer_id_cms ON cms_orders(customer_id);
CREATE INDEX idx_status_cms ON cms_orders(status);
