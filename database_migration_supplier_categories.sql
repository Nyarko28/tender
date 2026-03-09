-- Migration: Create supplier_categories table
-- This table stores the many-to-many relationship between suppliers and categories

CREATE TABLE IF NOT EXISTS supplier_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_supplier_category (supplier_id, category_id),
    FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tender_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
