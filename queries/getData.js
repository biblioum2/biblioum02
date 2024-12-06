const { getRandomValues } = require("crypto");
const pool = require("../config/database");
const { parseCIDR } = require("ipaddr.js");
const { log } = require("console");
const { get } = require("http");

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

    const data = JSON.stringify(res.rows);

    res.rows;
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};
const getLastBook = async () => {
  const query = `
SELECT *
FROM books
ORDER BY id DESC
LIMIT 1;
  `;
  try {
    const res = await pool.query(query);

    const data = JSON.stringify(res.rows);

    res.rows;
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};
// getLastBook();
// console.log( getBooks(100, 281));

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
    const res = await pool.query(query, [numerico]);
    return res.rows[0]; // Devuelve el primer (y único) resultado, ya que el ID es único
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
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
    const pagination =
      res.rows[0].total === 0 ? 1 : Math.round(res.rows[0].total / 20);
    return { pagination: pagination, totalBooks: res.rows[0].total };
  } catch (error) {
    console.log("Error al obtener los libros", error);
  }
};

// getBooksTotal()

// FUNCION EXITOSA
const getBooksTotalFilter = async (filters) => {
  const { category, author, year, limit, offset } = filters;
  const values = [limit, offset];
  let index = 3; // Starting index for the dynamic values

  let query = `
      SELECT 
          *
      FROM 
          books b
      LEFT JOIN 
          book_categories bc ON b.id = bc.book_id
      LEFT JOIN 
          categories c ON bc.category_id = c.id
      WHERE 
          1=1
  `;

  if (category) {
    query += ` AND c.name = $${index}`;
    values.push(category);
    index++;
  }

  if (author) {
    query += ` AND b.author ILIKE $${index}`;
    values.push(`%${author}%`);
    index++;
  }

  if (year) {
    query += ` AND EXTRACT(YEAR FROM b.publication_year) = $${index}`;
    values.push(year);
    index++;
  }

  query += ` LIMIT $1 OFFSET $2`;

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener libros", error);
    throw error;
  }
};

const getBooksCount = async (filters) => {
  const { category, author, year } = filters; // Removemos limit y offset ya que no se usan para contar
  const values = [];
  let index = 1; // Starting index for the dynamic values

  let query = `
      SELECT 
          COUNT(*)
      FROM 
          books b
      LEFT JOIN 
          book_categories bc ON b.id = bc.book_id
      LEFT JOIN 
          categories c ON bc.category_id = c.id
      WHERE 
          1=1
  `;

  if (category !== "") {
    query += ` AND c.name = $${index}`;
    values.push(category);
    index++;
  }

  if (author !== "") {
    query += ` AND b.author ILIKE $${index}`;
    values.push(`%${author}%`);
    index++;
  }

  if (year !== "") {
    query += ` AND EXTRACT(YEAR FROM b.publication_year) = $${index}`;
    values.push(year);
    index++;
  }

  try {
    const result = await pool.query(query, values);

    return result.rows[0].count; // Devolvemos el total de registros
  } catch (error) {
    console.error("Error al obtener el total de libros", error);
    throw error;
  }
};

// getBooksCount({ category: null, title: 'eloq', author: null, year: null});

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

    return res.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
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
    console.error("Error fetching book", err);
  }
}

const getUsers = async (offset) => {
  const query = `
  SELECT *
  FROM users
  ORDER BY user_id
  ASC
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

const getUser = async (name, user_id) => {
  console.log("El get user usuario es: ", name, user_id);

  const values = [];
  let index = 1;
  let query = `
        SELECT * FROM users
        WHERE
        1=1
    `;

  if (name !== undefined) {
    query += ` AND username = $${index}`;
    values.push(name);
    index++;
  }
  if (user_id !== undefined) {
    query += ` AND user_id = $${index}`;
    values.push(user_id);
    index++;
  }

  try {
    const res = await pool.query(query, values);

    return res.rows;
  } catch (error) {
    console.log("Error al consultar usuario", error);
    throw error;
  }
};

const getTotalUsers = async () => {
  const query = `
        SELECT COUNT(*) FROM users;
    `;
  try {
    pool.query("BEGIN");
    const res = await pool.query(query);
    pool.query("COMMIT");
    return res.rows[0].count;
  } catch (error) {
    pool.query("ROLLBACK");
    return error;
  }
};

const getUserLiveSearch = async (name) => {
  const query = `
        SELECT * FROM users WHERE username ILIKE '%' || $1 || '%';
    `;
  const value = [name];
  try {
    const res = await pool.query(query, value);

    return res.rows;
  } catch (error) {
    console.log("Error al consultar usuario", error);
    throw error;
  }
};

const getBookLiveSearch = async (name) => {
  const query = `
        SELECT DISTINCT ON (title) * FROM books WHERE title ILIKE '%' || $1 || '%' LIMIT 10;
    `;
  const value = [name];
  try {
    const res = await pool.query(query, value);

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

    return res.rows;
  } catch (err) {
    console.error("Error fetching categories", err);
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
  } catch (err) {
    console.error("Error fetching categories", err);
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
    console.error("Error fetching category", err);
  }
}
// CREAR
async function getAuthors() {
  const query = `
      SELECT DISTINCT ON (author) author FROM books;
  `;
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error("Error fetching category", err);
  }
}

async function getYears() {
  const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM publication_year) AS year
      FROM books
      ORDER BY year;
  `;
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error("Error fetching category", err);
  }
}
//utilizado en el apartado admin/orders para mostrar ordenes por ser aceptadas

const getFilteredOrders = async (filters) => {
  // Base query
  let query = `
        SELECT o.id, o.user_id, u.username, o.book_id, b.title, TO_CHAR(o.loan_date, 'DD/MM/YYYY') AS loan_date, TO_CHAR(o.return_date, 'DD/MM/YYYY') AS return_date, s.status
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN books b ON o.book_id = b.id
        JOIN order_status s ON o.id = s.order_id
        WHERE 1=1
    `;

  let values = [];

  if (filters.user_id) {
    query += ` AND o.user_id = $${values.length + 1}`;
    values.push(filters.user_id);
  }

  if (filters.book_id) {
    query += ` AND o.book_id = $${values.length + 1}`;
    values.push(filters.book_id);
  }

  if (filters.loan_date) {
    query += ` AND o.loan_date = $${values.length + 1}`;
    values.push(filters.loan_date);
  }

  if (filters.return_date) {
    query += ` AND o.return_date = $${values.length + 1}`;
    values.push(filters.return_date);
  }

  if (filters.status) {
    query += ` AND s.status = $${values.length + 1}`;
    values.push(filters.status);
  }
  query += ` ORDER BY o.id ASC`;

  try {
    const result = await pool.query(query, values);

    return result.rows;
  } catch (error) {
    console.error("Error al consultar órdenes con filtros:", error);
    throw error;
  }
};

/**
 * Obtiene los libros con su calificación promedio.
 *
 * @param {string|null} categoryName - El nombre de la categoría para filtrar los libros.
 * Si es null, se obtendrán todos los libros.
 * @returns {Promise<Array>} - Una promesa que resuelve un array de libros.
 */
const getTopRatedBooksByCategory = async (categoryName = null) => {
  // Comienza la consulta base
  let query = `
      SELECT DISTINCT
          b.id AS book_id,
          b.title,
          b.author,
          b.cover,
          COALESCE(ROUND(AVG(r.score)), 0) AS average_rating,
          STRING_AGG(c.name, ', ') AS categories  -- Concatenar categorías
      FROM 
          books b
      LEFT JOIN 
          book_categories bc ON b.id = bc.book_id
      LEFT JOIN 
          categories c ON bc.category_id = c.id
      LEFT JOIN 
          ratings r ON b.id = r.book_id
  `;

  // Condición para el filtro de categoría
  if (categoryName) {
    query += `
          WHERE c.name = $1
      `;
  }

  // Agrupación y ordenamiento
  query += `
      GROUP BY 
          b.id
      ORDER BY 
          average_rating DESC
      LIMIT 10;
  `;

  try {
    const params = categoryName ? [categoryName] : []; // Establece los parámetros de la consulta
    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error("Error al obtener los libros:", error);
    throw error;
  }
};
// Uso de la función
// getTopRatedBooks().then(books => console.log(books)).catch(err => console.error(err));

const getRatingByUserAndBook = async (userId, bookId) => {
  const query = `
      SELECT score 
      FROM ratings 
      WHERE user_id = $1 AND book_id = $2;
  `;

  try {
    const result = await pool.query(query, [userId, bookId]);
    if (result.rows.length > 0) {
      return result.rows[0].score; // Retorna el score si se encuentra
    } else {
      console.log(
        `No se encontró puntuación para el libro ${bookId} del usuario ${userId}.`
      );
      return null; // Si no se encontró, retorna null
    }
  } catch (error) {
    console.error("Error al obtener la puntuación del libro:", error);
    return null; // En caso de error, también retorna null
  }
};

const checkFavoriteBook = async (userId, bookId) => {
  const query = `SELECT 1
  FROM favorites
  WHERE user_id = $1 AND book_id = $2
  LIMIT 1;
  `;
  const values = [userId, bookId];

  try {
    const result = await pool.query(query, values);
    return result.rowCount;
  } catch (error) {
    console.log(error);
  }
};

const getFavoriteBooks = async (userId) => {
  const query = `
        SELECT books.id, books.title, books.author, books.edition, books.isbn, books.summary, 
               books.available, books.publication_year, books.available_copies, books.cover, 
               books.lib, books.languaje
        FROM favorites
        JOIN books ON favorites.book_id = books.id
        WHERE favorites.user_id = $1;
    `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows; // Devuelve los libros favoritos
  } catch (error) {
    console.error("Error al obtener los libros favoritos:", error);
    throw error;
  }
};

module.exports = {
  getBooksCount,
  getAuthors,
  getYears,
  getBooks,
  getUser,
  getUsers,
  getTotalUsers,
  getUserLiveSearch,
  getAllCategories,
  getBooksByCategory,
  getBookDetailsById,
  getBookLiveSearch,
  getBooksTotal,
  getBooksTotalFilter,
  getFilteredOrders,
  getRatingByUserAndBook,
  getTopRatedBooksByCategory,
  getCategoryById,
  checkFavoriteBook,
  getFavoriteBooks,
};
