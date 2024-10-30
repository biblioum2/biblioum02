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
    // console.log("Usuario insertado:", res.rows);
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
// INSERTA CATEGORIAS A LIBROS
function insertarVarios(totalElements) {
  const categories = 9;
  let category = 1;
  
  for (let index = 1; index < totalElements; index++) {
    insertBookCategory(index, category);
    category++;
    if (category > categories) {
      category = 1;
    }
  }
}

// insertarVarios(500);
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
const books = [
  {
    "title": "Eloquent Javascript",
    "author": "Marijn Haverbeke",
    "edition": "4ª",
    "isbn": "970-17-0108-9",
    "summary": "Eloquent JavaScript A Modern Introduction to Programming es un libro esencial para cualquier desarrollador que quiera dominar \
     JavaScript. Escrito por Marijn Haverbeke, este libro proporciona una introducción exhaustiva y accesible al lenguaje de programación \
     JavaScript, combinando los fundamentos con principios avanzados. A través de ejemplos prácticos y ejercicios desafiantes, los lectores aprenderán \
     desde conceptos básicos como variables y funciones hasta temas avanzados como la programación asíncrona y el manejo del DOM. Perfecto tanto para\
     principiantes como para desarrolladores experimentados, Eloquent JavaScript es una guía completa para convertirte en un experto en JavaScript.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 1,
    "cover": "https://i.imgur.com/prwImiQ.png",
    "languaje": "Español"
  },
  {
    "title": "Javascript the Good Parts",
    "author": "Douglas Crockford",
    "edition": "1ª",
    "isbn": "978-0-596-51774-8",
    "summary": "JavaScript: The Good Parts es una obra fundamental escrita por Douglas Crockford, que se centra en las características más robustas\
     y efectivas del lenguaje JavaScript. Este libro destila el lenguaje hasta sus elementos más esenciales y útiles, dejando de lado las\
     características problemáticas. A través de una exploración profunda de las buenas partes de JavaScript, Crockford ofrece una guía clara y\
      concisa que ayuda a los desarrolladores a escribir código más limpio, eficiente y mantenible. Ideal para desarrolladores que desean mejorar\
      su comprensión y habilidades en JavaScript, JavaScript: The Good Parts es un recurso invaluable para aprovechar al máximo este lenguaje\
       versátil y poderoso.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 3,
    "cover": "https://i.imgur.com/vxJt2vG.png",
    "languaje": "Español"
  },
  {
    "title": "Javascript Designs Patterns",
    "author": "Addy Osmany",
    "edition": "1ª",
    "isbn": "978-0-596-51774-8",
    "summary": "JavaScript Design Patterns es un libro de Stoyan Stefanov que ofrece una profunda comprensión de los patrones de diseño aplicados al \
    lenguaje JavaScript. Este libro explora cómo utilizar patrones de diseño comunes para resolver problemas recurrentes en el desarrollo de \
    software y mejorar la estructura y la mantenibilidad del código. A través de ejemplos prácticos y explicaciones claras, Stefanov guía a los \
    desarrolladores en la implementación de patrones como el Singleton, el Módulo y el Observador. Ideal para quienes buscan optimizar sus \
    habilidades en diseño de software y aplicar soluciones probadas en sus proyectos JavaScript, JavaScript Design Patterns es una lectura esencial \
    para mejorar la calidad y la eficiencia del código.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 2,
    "cover": "https://i.imgur.com/w23n6BK.png",
    "languaje": "Español"
  },
  {
    "title": "Codigo limpio",
    "author": "Robert Cecil ",
    "edition": "1ª",
    "isbn": "978-84-415-3210-6",
    "summary": "\"Código Limpio\" de Robert C. Martin ofrece una guía esencial para escribir código que sea claro y fácil de mantener. El libro \
    proporciona principios y prácticas para mejorar la calidad del código, enfocándose en la simplicidad, la legibilidad y la consistencia. Martin \
    cubre temas como la organización del código, la elección de nombres descriptivos, y la estructura de funciones y clases. Ideal para desarrolladores \
    que desean producir software de alta calidad y mejorar la mantenibilidad de sus proyectos, el libro es una referencia clave para cualquier \
    profesional del desarrollo de software.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 2,
    "cover": "https://i.imgur.com/LHM7ujw.png",
    "languaje": "Español"
  },
  {
    "title": "Calculo de una variable",
    "author": "Claudio Pita Ruiz",
    "edition": "1ª",
    "isbn": "970-17-0108-9",
    "summary": "\"Cálculo de una Variable\" de James Stewart es un libro fundamental para aprender cálculo diferencial e integral de funciones de" +
    "una sola variable. El texto cubre conceptos clave como límites, derivadas, integrales y sus aplicaciones. Con numerosos ejemplos y ejercicios" +
    "prácticos, el libro ayuda a comprender y aplicar técnicas y teoremas importantes en cálculo. Es una excelente referencia tanto para estudiantes"+
    "que comienzan en cálculo como para aquellos que buscan reforzar sus conocimientos en el tema. En este libro se tratan los temas que normalmente"+
    "constituyen un primer curso de cálculo (Diferencial e Integral de funciones de una variable Real, o bien, simplemente Calculo de una Variable),"+
    "como el que se imparte en el último año de la preparatoria o en los primeros semestres de una licenciatura.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 1,
    "cover": "https://i.imgur.com/iEYQP4u.png",
    "languaje": "Español"
  },
  {
    "title": "El lenguaje de programacion C",
    "author": "Brian W. Kernighan",
    "edition": "2ª",
    "isbn": "968-880-205-0",
    "summary": "\"El Lenguaje de Programación C\" de Brian W. Kernighan y Dennis M. Ritchie es una obra clave para aprender el lenguaje de \
    programación C. El libro ofrece una introducción clara al lenguaje, cubriendo desde los conceptos básicos hasta temas avanzados. Con ejemplos\
     prácticos y explicaciones detalladas, los autores abordan la sintaxis del lenguaje, estructuras de datos, control de flujo y gestión de memoria\
     . Es una referencia esencial para desarrolladores que desean entender a fondo C y aplicar sus principios en programación de sistemas y \
     aplicaciones.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 2,
    "cover": "https://i.imgur.com/J9bntsu.png",
    "languaje": "Español"
  },
  {
    "title": "Linux Basics for Hackers",
    "author": "OccupyTheWeb",
    "edition": "1ª",
    "isbn": "1­-593-27­-855­-1",
    "summary": "**\"Linux Basics for Hackers\"** es una guía que cubre los fundamentos de Linux desde la perspectiva de la seguridad informática. \
    El libro aborda la instalación y configuración de Linux, el uso de comandos básicos, la gestión de archivos y usuarios, y la configuración de \
    redes y servicios. También explora herramientas de hacking, técnicas de seguridad y scripting para automatizar tareas. Es una introducción útil\
     para quienes desean aprender Linux con un enfoque en ciberseguridad y hacking ético.",
    "available": "yes",
    "publication_year": "2024-08-10",
    "available_copies": 3,
    "cover": "https://i.imgur.com/jixA03i.png",
    "languaje": "Español"
  }
];

//LIBROS
const insertBooks = async () => {
  // await pool.connect();

  for (const book of books) {
    const query = `
      INSERT INTO books (title, author, edition, isbn, summary, available, publication_year, available_copies, cover, languaje)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      book.title,
      book.author,
      book.edition,
      book.isbn,
      book.summary,
      book.available,
      book.publication_year,
      book.available_copies,
      book.cover,
      book.languaje
    ];

    try {
      await pool.query(query, values);
      console.log(`Libro con ID ${book.title} insertado correctamente.`);
    } catch (err) {
      console.error(`Error insertando el libro con ID ${book.title}:`, err);
    }
  }
return console.log('exito');

  // await pool.end();
};

async function insertarLibrosCiclo () {
  for (let index = 0; index < 30; index++) {
    await insertBooks();
  }
}

// insertarLibrosCiclo();


const createOrder = async (userId, bookId, loanDate, returnDate) => {
  try {
      await pool.query('BEGIN');

      // Insertar la orden
      const insertOrderText = `
          INSERT INTO orders (user_id, book_id, loan_date, return_date)
          VALUES ($1, $2, $3, $4) RETURNING id;
      `;
      console.log('Valores insertados por el usuario: ', userId, bookId, loanDate, returnDate);
      
      const insertOrderValues = [userId, bookId, loanDate, returnDate];
      const orderResult = await pool.query(insertOrderText, insertOrderValues);
      const orderId = orderResult.rows[0].id;

      // Insertar el estado de la orden
      const insertOrderStatusText = `
          INSERT INTO order_status (order_id, status)
          VALUES ($1, 'Pendiente');
      `;
      const insertOrderStatusValues = [orderId];
      await pool.query(insertOrderStatusText, insertOrderStatusValues);

      await pool.query('COMMIT');
      return orderId;
  } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
  }
};


const incrementBookViews = async (bookId) => {
  const query = `
      UPDATE books
      SET views = views + 1
      WHERE id = $1;
  `;

  try {
      await pool.query(query, [bookId]);
  } catch (error) {
      console.error('Error al incrementar las vistas del libro:', error);
      return error;  // Lanzar el error para manejarlo en otro lugar
  }
};

const addOrUpdateRating = async (userId, bookId, score) => {
  const query = `
      INSERT INTO ratings (user_id, book_id, score)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET score = $3;
  `;

  try {
      await pool.query(query, [userId, bookId, score]);
      console.log(`Puntuación de ${score} para el libro ${bookId} del usuario ${userId} agregada o actualizada.`);
  } catch (error) {
      console.error('Error al agregar o actualizar la puntuación:', error);
  }
};

// insertUser('severo', 'password', 'enrrimarq2000@gmail.com', 'admin');
// insertUser('cristian', 'password', 'adaksjdjkasdkja@gmail.com', 'admin');
// insertUser('varela', 'password', 'adaksjdja@gmail.com', 'admin');

module.exports = {
  insertUser: insertUser,
  insertBook: insertBook,
  createOrder,
  // insertCategory: insertCategory,
  // insertFavorite: insertFavorite,
  // insertOrder: insertOrder,
  insertBookCategory: insertBookCategory,
  // insertActivityLog: insertActivityLog,
  incrementBookViews,
  addOrUpdateRating,
};
