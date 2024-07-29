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

const getBooksForCategory = async (name, limit, offset) => {
  const query = `
SELECT b.id, b.title, b.author, b.isbn, b.publication_year, b.available_copies
FROM books b
JOIN book_categories bc ON b.id = bc.book_id
JOIN categories c ON bc.category_id = c.id
WHERE c.name = $1
ORDER BY b.id
LIMIT $2 OFFSET $3;

    `;
  const values = [name, limit, offset];
  try {
    const res = await pool.query(query, values);
    console.log(`LIBROS POR CATEGORIA: ${res.rows}`);
    return res.rows;
  } catch (error) {
    console.log("Error al obtener los datos", error);
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
};
