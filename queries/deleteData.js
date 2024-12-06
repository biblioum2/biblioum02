const pool = require('../config/database');

// BORRAR TABLAs

const deleteTableUsers = async () => {
    const query = `
        DROP TABLE users
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla users eliminada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};

const deleteTableAuthors = async () => {
    const query = `
        DROP TABLE authors
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla authors eliminada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};
const deleteTableCategories = async () => {
    const query = `
        DROP TABLE categories
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla categorias eliminada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};
const deleteTableBooks = async () => {
    const query = `
        DROP TABLE books
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla libros eliminada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};

async function deleteBook(id) {
    const query = `
        DELETE FROM books
        WHERE id = $1
        RETURNING *;
    `;
    const values = [id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error("Error deleting book", err);
    }
  }

const deleteBooks = async () => {
    const query = `
        DELETE FROM books
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Lbros eliminada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};
// deleteBooks();
const deleteTableOrders = async () => {
    const query = `
        DROP TABLE orders
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla orders borrada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};
const deleteTableFavorites = async () => {
    const query = `
        DROP TABLE favorites
    `;

    try {
        const res = await pool.query(query);
        return console.log(`Tabla favoritos borrada`);
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }
};

const deleteUser = async (userId) => {
    const query = `
        DELETE FROM users WHERE user_id = $1;
    `;
    try {
        const result = await pool.query(query, [userId]);
        return result; // Devuelve el objeto completo result
    } catch (err) {
        console.error('Error al eliminar el usuario', err);
    }
}

const deleteOrder = async (orderId) => {
    const query = `
        DELETE FROM orders WHERE id = $1;
    `;
    const values = [orderId];
    try {
        const result = await pool.query(query, values);
        return result; // Devuelve el objeto completo result
    } catch (err) {
        console.error('Error al eliminar el usuario', err);
    }
}

const removeRating = async (userId, bookId) => {
    const query = `
        DELETE FROM ratings 
        WHERE user_id = $1 AND book_id = $2;
    `;

    try {
        const result = await pool.query(query, [userId, bookId]);
        if (result.rowCount > 0) {
            console.log(`Puntuación para el libro ${bookId} del usuario ${userId} eliminada.`);
        } else {
            console.log(`No se encontró puntuación para el libro ${bookId} del usuario ${userId}.`);
        }
    } catch (error) {
        console.error('Error al eliminar la puntuación:', error);
    }
};

const removeBookFromFavorites = async (userId, bookId) => {
    const query = `
        DELETE FROM favorites
        WHERE user_id = $1 AND book_id = $2;
    `;

    try {
        const result = await pool.query(query, [userId, bookId]);
       
        if (result.rowCount > 0) {
            console.log('Libro eliminado de favoritos');
            return true; 
        } else {
            console.log('El libro no estaba en favoritos');
            return false; 
        }
    } catch (error) {
        console.error('Error al eliminar el libro de favoritos:', error);
        throw error;
    }
};

module.exports = {
    deleteUser,
    deleteOrder,
    removeBookFromFavorites,
};

// deleteTableFavorites();
// deleteTableOrders();
// deleteTableBooks();
// deleteTableCategories();
// deleteTableUsers();

