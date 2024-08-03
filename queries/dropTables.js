const pool = require('../config/database');

const dropTableActivityLog = `DROP TABLE IF EXISTS activity_log CASCADE;`;
const dropTableBooksCategories = `DROP TABLE IF EXISTS book_categories CASCADE;`;
const dropTableOrders = `DROP TABLE IF EXISTS orders CASCADE;`;
const dropTableFavorites = `DROP TABLE IF EXISTS favorites CASCADE;`;
const dropTableBooks = `DROP TABLE IF EXISTS books CASCADE;`;
const dropTableCategories = `DROP TABLE IF EXISTS categories CASCADE;`;
const dropTableUsers = `DROP TABLE IF EXISTS users CASCADE;`;

const dropTables = async () => {
    try {
        await pool.query(dropTableActivityLog);
        console.log('Tabla de registros de actividad eliminada');
        await pool.query(dropTableBooksCategories);
        console.log('Tabla de categorías de libros eliminada');
        await pool.query(dropTableOrders);
        console.log('Tabla de órdenes eliminada');
        await pool.query(dropTableFavorites);
        console.log('Tabla de favoritos eliminada');
        await pool.query(dropTableBooks);
        console.log('Tabla de libros eliminada');
        await pool.query(dropTableCategories);
        console.log('Tabla de categorías eliminada');
        await pool.query(dropTableUsers);
        console.log('Tabla de usuarios eliminada');
    } catch (error) {
        console.log(`Error al eliminar tablas.`, error);
    } finally {
        pool.end();
    }
};

// Llama a la función para eliminar todas las tablas
// dropTables();

module.exports = {
    dropTableActivityLog,
    dropTableBooksCategories,
    dropTableOrders,
    dropTableFavorites,
    dropTableBooks,
    dropTableCategories,
    dropTableUsers
};
