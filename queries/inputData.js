const pool = require("../config/database");

// FUNCION PARA CREAR USUARIO
const insertUser = async (username, passwordHash, email, role) => {
  const query = `
    INSERT INTO users (username, password_hash, email, role) 
    VALUES ($1, $2, $3, $4)
  `;
  const values = [username, passwordHash, email, role];

  try {
    const res = await pool.query(query, values);
    console.log("Usuario insertado:", res.rows);
    return res.rows[0]; // Opcional: devolver el usuario insertado
  } catch (error) {
    console.error("Error al insertar usuario:", error);
    throw error; // Propagar el error para manejarlo en un nivel superior
  }
};

// QUERIES PARA TABLA CATEGORIAS

async function insertCategory(name) {
  const query = `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *;
  `;
  const values = [name];
  try {
    const res = await pool.query(query, values);
    console.log(`Categoría "${name}" insertada con éxito.`);
    return res.rows[0];
  } catch (err) {
    console.error("Error al crear la categoría", err);
  }
}

// Función para insertar múltiples categorías
async function insertMultipleCategories(categories) {
  for (const category of categories) {
    await insertCategory(category);
  }
  console.log('Todas las categorías han sido insertadas.');
}

// Lista de categorías a insertar
const categories = [
  "Ficción",
  "No Ficción",
  "Ciencia",
  "Historia",
  "Biografía",
  "Fantasía",
  "Misterio",
  "Romance",
  "Tecnología",
  "Educación"
];

// Insertar las categorías
// insertMultipleCategories(categories);

async function deleteCategory(id) {
  const query = `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *;
  `;
  const values = [id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting category", err);
  }
}

// QUERIES PARA TALBA BOOKS

async function insertBook({
    title,
    author,
    edition,
    isbn,
    summary,
    available,
    publication_year,
    available_copies,
    cover
}) {
    const query = `
        INSERT INTO books (
            title, 
            author, 
            edition, 
            isbn, 
            summary, 
            available, 
            publication_year, 
            available_copies, 
            cover
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING id;
    `;
    
    const values = [
        title,
        author,
        edition,
        isbn,
        summary,
        available,
        publication_year,
        available_copies,
        cover
    ];
    
    try {
        const res = await pool.query(query, values);
        console.log('Book inserted successfully');
        return res.rows[0].id;
    } catch (err) {
        console.error('Error inserting book:', err);
    }
}





//  QUERIES PARA LA TABLA FAVORITES

async function insertFavorite(user_id, book_id) {
  const query = `
      INSERT INTO favorites (user_id, book_id)
      VALUES ($1, $2)
      RETURNING *;
  `;
  const values = [user_id, book_id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error creating favorite", err);
  }
}

async function getAllFavoritesByUser(user_id) {
  const query = `
      SELECT * FROM favorites WHERE user_id = $1;
  `;
  const values = [user_id];
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error fetching favorites", err);
  }
}

async function getAllUsersByFavoriteBook(book_id) {
  const query = `
      SELECT * FROM favorites WHERE book_id = $1;
  `;
  const values = [book_id];
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error fetching favorite users", err);
  }
}

async function deleteFavorite(user_id, book_id) {
  const query = `
      DELETE FROM favorites
      WHERE user_id = $1 AND book_id = $2
      RETURNING *;
  `;
  const values = [user_id, book_id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting favorite", err);
  }
}

// QUERIES PARA LAS ORDERS

async function insertOrder(user_id, book_id, loan_date, return_date) {
  const query = `
      INSERT INTO orders (user_id, book_id, loan_date, return_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
  `;
  const values = [user_id, book_id, loan_date, return_date];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error creating order", err);
  }
}

async function getAllOrders() {
  const query = `
      SELECT * FROM orders;
  `;
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error("Error fetching orders", err);
  }
}

async function getOrderById(id) {
  const query = `
      SELECT * FROM orders WHERE id = $1;
  `;
  const values = [id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error fetching order", err);
  }
}

async function updateOrder(id, user_id, book_id, loan_date, return_date) {
  const query = `
      UPDATE orders
      SET user_id = $1, book_id = $2, loan_date = $3, return_date = $4
      WHERE id = $5
      RETURNING *;
  `;
  const values = [user_id, book_id, loan_date, return_date, id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error updating order", err);
  }
}

async function deleteOrder(id) {
  const query = `
      DELETE FROM orders
      WHERE id = $1
      RETURNING *;
  `;
  const values = [id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting order", err);
  }
}

// QUERIES PARA LA TABLA BOOKS CATEGORIES

async function insertBookCategory(book_id, category_id) {
  const query = `
      INSERT INTO book_categories (book_id, category_id)
      VALUES ($1, $2)
      RETURNING *;
  `;
  const values = [book_id, category_id];
  try {
    const res = await pool.query(query, values);
    console.log('categoria asignada a libro con exito');
  } catch (err) {
    console.error("Error creating book-category relationship", err);
  }
}

async function getBooksByCategoryId(category_id) {
  const query = `
      SELECT * FROM book_categories WHERE category_id = $1;
  `;
  const values = [category_id];
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error fetching books for category", err);
  }
}

async function deleteBookCategory(book_id, category_id) {
  const query = `
      DELETE FROM book_categories
      WHERE book_id = $1 AND category_id = $2
      RETURNING *;
  `;
  const values = [book_id, category_id];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting book-category relationship", err);
  }
}
async function insertcolumn() {
  const query = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'books';
    `;
  try {
    const res = await pool.query(query);
    console.log(`Resultado: ${JSON.stringify(res.rows)}`);
    return res.rows; // Devuelve todas las filas
  } catch (err) {
    console.error("Error al obtener columnas", err);
  }
}

// insertcolumn();

// Ejemplos de uso
// const ins = async () => {
//   await insertUser('severo', 'password', 'enrrimarq2000@gmail.com', 'admin');
//   // await insertAuthor('Autor 1', 'Biografía del autor 1');
//   // await insertCategory('Tecnologia');
//   // await insertBook('Libro 1', 1, 1, '2023-01-01', '1234567890123', 'Resumen del libro 1', 'eloquent.jpeg');
//   // await insertFavorite(1, 1);

//   // Cierra la conexión después de insertar los datos
//   await pool.end();
// };

// insertUser('severo', 'password', 'enrrimarq2000@gmail.com', 'admin');
module.exports = {
  insertUser: insertUser,
  insertBook: insertBook,
  // insertCategory: insertCategory,
  // insertFavorite: insertFavorite,
  // insertOrder: insertOrder,
  insertBookCategory: insertBookCategory,
  // insertActivityLog: insertActivityLog,
};
