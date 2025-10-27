CREATE DATABASE IF NOT EXISTS core_db;
USE core_db;

CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON products(status);
CREATE INDEX idx_updated_at ON products(updated_at);

CREATE USER 'debezium'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'dbzpassword';
GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'debezium'@'%';
FLUSH PRIVILEGES;

INSERT INTO products (name, description, price, stock, category, status) VALUES
('Laptop', 'A powerful laptop', 1200.50, 50, 'Electronics', 'ACTIVE'),
('Keyboard', 'A mechanical keyboard', 150.75, 100, 'Electronics', 'ACTIVE'),
('Mouse', 'A wireless mouse', 75.00, 150, 'Electronics', 'INACTIVE');

CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_updated_at_customers ON customers(updated_at);

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_id ON orders(customer_id);
CREATE INDEX idx_status_orders ON orders(status);
CREATE INDEX idx_updated_at_orders ON orders(updated_at);

INSERT INTO customers (name, email, phone) VALUES
('John Doe', 'john.doe@example.com', '+1234567890'),
('Jane Smith', 'jane.smith@example.com', '+1234567891'),
('Bob Johnson', 'bob.johnson@example.com', '+1234567892');

INSERT INTO orders (customer_id, total, status) VALUES
(1, 1500.00, 'COMPLETED'),
(2, 250.50, 'PENDING'),
(1, 75.00, 'COMPLETED');
