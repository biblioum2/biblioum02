const { getRandomValues } = require("crypto");
const pool = require("../config/database");
const { parseCIDR } = require("ipaddr.js");

// OBTENCION DE LIBROS GENERAL

const getBooks = async (limit, offset) => {
  const query = `
SELECT *
FROM books
LIMIT $1 OFFSET $2;
  `;
  const values = [limit, offset];
  try {
    const res = await pool.query(query, values);
    // console.log(`LIBROS: ${res.rows}`);
    const data= JSON.stringify(res.rows);
    // console.log(data);
    return res.rows;
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};
// getBooks();

//OBTENCION DE LIBRO PARA PAGINA INDIVIDUAL
const getBookDetailsById = async (bookId) => {
  const numerico = parseInt(bookId);
  const query = `
      SELECT 
          books.*,
          STRING_AGG(categories.name, ', ') AS categories
      FROM 
          books
      JOIN 
          book_categories ON books.id = book_categories.book_id
      JOIN 
          categories ON book_categories.category_id = categories.id
      WHERE 
          books.id = $1
      GROUP BY 
          books.id;
  `;

  try {
    console.log('se ejecuta la query de libro por id');
    
      const res = await pool.query(query, [numerico]);
      return res.rows[0]; // Devuelve el primer (y único) resultado, ya que el ID es único
  } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;
  }
};
// OBTENER NUMERO DE LIBROS TOTALES - USADO EN PAGINA DE INICIO

const getBooksTotal = async (category) => {
  let query = `
    SELECT COUNT(*) AS total
    FROM books
  `;
  const queryParams = [];

  if (category) {
    query += `
      LEFT JOIN book_categories ON books.id = book_categories.book_id
      LEFT JOIN categories ON categories.id = book_categories.category_id
      WHERE categories.name = $1
    `;
    queryParams.push(category);
  }

  try {
    const res = await pool.query(query, queryParams);
    return res.rows[0].total;
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};

// getBooksTotal()


// OBTENCION DE LIBROS POR CATEGORIA

const getBooksByCategory = async (categoryId) => {
  const query = `
      SELECT b.*
      FROM books b
      JOIN book_categories bc ON b.id = bc.book_id
      WHERE bc.category_id = $1;


  `;

  try {
      const res = await pool.query(query, [categoryId]);
      console.log(`esto es lo obtenido`,res.rows);
      
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
    // console.log("El get user usuario es: ", res.rows);
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

const getBookLiveSearch = async (name) => {
  const query = `
        SELECT * FROM books WHERE title ILIKE '%' || $1 || '%' LIMIT 10;
    `;
  const value = [name];
  try {
    const res = await pool.query(query, value);
    console.log("El get book live es: ", res.rows[0]);
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
      const data = JSON.stringify(res.rows);
      // console.log("ESTO ES: ", data);
      return res.rows;
  } catch (err) {
      console.error('Error fetching categories', err);
  }
}
// getAllCategories()
async function getAllCategoriesForBooks() {
  const query = `
      SELECT * FROM book_categories;
  `;
  try {
      const res = await pool.query(query);
      const data = JSON.stringify(res.rows);
      // console.log("ESTO ES: ", data);
  } catch (err) {
      console.error('Error fetching categories', err);
  }
}
// getAllCategoriesForBooks();

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
  getBookDetailsById,
  getBookLiveSearch,
  getBooksTotal,
};


