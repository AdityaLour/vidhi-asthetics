USE vidhi_asthetics;


CREATE TABLE categories(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    discount_percentage TINYINT UNSIGNED DEFAULT 0,
    price INT UNSIGNED NOT NULL,
    stock INT UNSIGNED NOT NULL,
    low_stock_threshold INT UNSIGNED NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    display_order INT  UNSIGNED DEFAULT 0,
    status ENUM('inactive', 'active', 'out_of_stock') DEFAULT 'inactive',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_categories(
    product_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE     
);

CREATE TABLE product_images(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(500)  NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    display_order INT UNSIGNED NOT NULL  DEFAULT 1,
    created_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE(product_id, display_order)
);

CREATE TABLE wishlists(
    id INT UNSIGNED AUTO_INCREMENT  PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    user_id INT  NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);