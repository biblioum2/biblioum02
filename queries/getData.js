const { getRandomValues } = require("crypto");
const pool = require("../config/database");

// OBTENCION DE LIBROS GENERAL

const getBooks = async () => {
  const query = `
SELECT *
FROM books

  `;
  try {
    const res = await pool.query(query);
    console.log(`LIBROS: ${res.rows}`);
    const data= JSON.stringify(res.rows);
    console.log(data);
    return res.rows;
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};
getBooks();
// OBTENCION DE LIBROS POR CATEGORIA

const getBooksByCategory = async (categoryId) => {
  const query = `
      SELECT b.id, b.title, b.author, b.edition, b.isbn, b.summary, b.available, b.publication_year, b.available_copies, b.cover
      FROM books b
      JOIN book_categories bc ON b.id = bc.book_id
      JOIN categories c ON bc.category_id = c.id
      WHERE c.id = $1;
  `;

  try {
      const res = await pool.query(query, [categoryId]);
      return res.rows;
  } catch (err) {
      console.error('Error executing query', err.stack);
      throw err;
  }
};

// Funcion para obtener libros por id con el objetivo de mostrarlos en su single page
async function getBookById(id) {
  const query = `
      SELECT * FROM books WHERE id = $1;
  `;
  const values = [id];
  try {
      const res = await pool.query(query, values);
      return res.rows[0];
  } catch (err) {
      console.error('Error fetching book', err);
  }
}

const getUsers = async (offset) => {
  const query = `
  SELECT *
  FROM users
  LIMIT 10 OFFSET $1
  `;
    const values = [offset];
    try {
      const res = await pool.query(query, values);
      return res.rows;
    } catch (error) {
      console.log("Error al consultar usuario", error);
      throw error;
    }
  };
  
  // OBTENER EL USUARIO PARA VALIDAR INICIO

const getUser = async (name) => {
  const query = `
        SELECT * FROM users
        WHERE username = $1;
    `;
  const value = [name];
  try {
    const res = await pool.query(query, value);
    console.log("El get user usuario es: ", res.rows[0]);
    return res.rows;
  } catch (error) {
    console.log("Error al consultar usuario", error);
    throw error;
  }
};


const getUserLiveSearch = async (name) => {
  const query = `
        SELECT * FROM users WHERE username ILIKE '%' || $1 || '%';
    `;
  const value = [name];
  try {
    const res = await pool.query(query, value);
    console.log("El get user usuario live es: ", res.rows[0]);
    return res.rows;
  } catch (error) {
    console.log("Error al consultar usuario", error);
    throw error;
  }
};

// CATEGORIAS
async function getAllCategories() {
  const query = `
      SELECT * FROM categories;
  `;
  try {
      const res = await pool.query(query);
      return res.rows;
  } catch (err) {
      console.error('Error fetching categories', err);
  }
}

async function getCategoryById(id) {
  const query = `
      SELECT * FROM categories WHERE id = $1;
  `;
  const values = [id];
  try {
      const res = await pool.query(query, values);
      return res.rows[0];
  } catch (err) {
      console.error('Error fetching category', err);
  }
}
// CREAR

  

module.exports = {
  getBooks,
  getUser,
  getUsers,
  getUserLiveSearch,
  getAllCategories,
  getBooksByCategory,
};
