const pool = require('../config/database');

const createTableUsers = `
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(34) NOT NULL,
    email VARCHAR(90) NOT NULL,
    password_hash VARCHAR(14) NOT NULL,
    phone VARCHAR(10),
    role VARCHAR(7) NOT NULL CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTableCategories = `
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
`;

const createTableBooks = `
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    publication_year INT,
    available_copies INT DEFAULT 1
);
`;

const createTableFavorites = `
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    book_id INT,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);
`;

const createTableOrders = `
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    book_id INT,
    loan_date DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);
`;
const createTableBooksCategories = `
CREATE TABLE IF NOT EXISTS book_categories (
    book_id INT,
    category_id INT,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
`;

const createTableActivityLog = `
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
`;
    



const createTables = async () => {
    try {
        await pool.query(createTableUsers);
        console.log('Tabla usuarios creada');
        await pool.query(createTableCategories);
        console.log('Tabla de categorias creada');
        await pool.query(createTableBooks);
        console.log('Tabla de libros creada');
        await pool.query(createTableBooksCategories);
        console.log('Tabla de catlibros creada');
        await pool.query(createTableFavorites);
        console.log('Tabla de favoritos creada');
        await pool.query(createTableOrders);
        console.log('Tabla de ordenes creada');
        await pool.query(createTableActivityLog);
        console.log('Tabla de log creada');
    } catch (error) {
        console.log(`Error al crear tablas.`, error);
    } finally {
        pool.end();
    }
};

// createTables();
// module.exports = {
//     createTableUsers,
//     createTableCategories,
//     createTableBooks,
//     createTableFavorites
// };