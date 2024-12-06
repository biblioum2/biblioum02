const { get } = require("http");
const pool = require("../config/database");
const { parse, format } = require("date-fns");
const bcrypt = require("bcrypt");
// FUNCION PARA CREAR USUARIO
const insertUser = async (username, password, email, role) => {
  const query = `
    INSERT INTO users (username, password_hash, email, role) 
    VALUES ($1, $2, $3, $4)
  `;
  if (!role) {
    role = "student";
  }
  const values = [username, password, email, role];

  try {
    pool.query("BEGIN");
    const res = await pool.query(query, values);
    pool.query("COMMIT");
    return res.rows[0];
  } catch (error) {
    pool.query("ROLLBACK");
    throw error;
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
}

// Lista de categorías a insertar
const categories = [
  "Administración de Empresas",
  "Arquitectura",
  "Comercio Internacional",
  "Contador Público Auditor",
  "Derecho",
  "Diseño Integral",
  "Energías Renovables",
  "Ingenieria Civil",
];
// "Relaciones Internacionales",
// "Mercadotécnia",
//   "Psicología",
//   "Turismo",
//   "Comunicación y Gestión Digital de Medios",
//   "Educación Inicial",
//   "Petrolero",
//   "TIC'S",
//   "MecaTrónica",
//   "Electrónica",

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
  cover,
  lib,
  languaje,
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
            cover,
            lib,
            languaje
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
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
    cover,
    lib,
    languaje,
  ];

  const parsedDate = parse(publication_year, "dd/MM/yyyy", new Date());
  const formattedDate = format(parsedDate, "yyyy-MM-dd");
  values[6] = formattedDate;
  try {
    const res = await pool.query(query, values);
    return res.rows[0].id;
  } catch (err) {
    return err;
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
const booksIntegral = [
  {
    title: "Cradle to Cradle - Remaking the Way We Make Things",
    author: "William McDonough, Michael Braungart",
    edition: "1ª",
    isbn: "0-865-47-587-3",
    summary:
      '**"Cradle to Cradle: Remaking the Way We Make Things"** es un libro innovador que plantea un enfoque radicalmente nuevo sobre la manera en que diseñamos y fabricamos productos. Los autores abogan por un modelo de producción industrial que imita a los sistemas naturales, donde los desechos de un proceso se convierten en los nutrientes de otro. El libro propone un sistema de reciclaje continuo y sostenible que beneficie tanto a la economía como al medio ambiente.',
    available: "yes",
    publication_year: "2002-04-22",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848132/cradle_to_cradle_ub2tgi.webp",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848134/cradle_to_cradle-1-50_k8r63e.pdf",
    languaje: "Inglés",
  },
  {
    title: "Design Form and Chaos",
    author: "György Kepes",
    edition: "1ª",
    isbn: "0-226-29549-9",
    summary:
      '**"Design, Form, and Chaos"** explora la interrelación entre el diseño, la forma y el caos en el arte y la ciencia. A través de una mirada crítica, György Kepes examina cómo las formas visuales influyen en la percepción humana y cómo el caos, tanto natural como conceptual, puede ser un motor para el diseño innovador. El libro destaca la importancia de la integración de las ciencias y las artes para la creación de soluciones estéticamente impactantes y funcionalmente efectivas.',
    available: "yes",
    publication_year: "1965-01-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848135/design_form_and_chaos_nzrvyp.webp",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848134/cradle_to_cradle-1-50_k8r63e.pdf",
    languaje: "Inglés",
  },
  {
    title: "Interior Design Illustrated",
    author: "Francis D.K. Ching",
    edition: "1ª",
    isbn: "1-118-01581-2",
    summary:
      '**"Interior Design Illustrated"** es una obra de referencia que descompone los principios fundamentales del diseño de interiores a través de ilustraciones claras y detalladas. Francis D.K. Ching, reconocido por su habilidad para comunicar conceptos complejos de manera visual, guía al lector a través de los aspectos esenciales del diseño de interiores, incluyendo la planificación espacial, la luz, el color, los materiales y la ergonomía. El libro es tanto una introducción accesible como un recurso valioso para diseñadores en todas las etapas de su carrera.',
    available: "yes",
    publication_year: "2015-07-27",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848141/diseno_de_interiores_bj1nmo.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848153/diseno_de_interiores-1-50_l0bj6l.pdf",
    languaje: "Inglés",
  },
  {
    title: "Pensar con Tipos",
    author: "Ellen Lupton",
    edition: "1ª",
    isbn: "978-607-16-1181-3",
    summary:
      '**"Pensar con Tipos"** es un libro fundamental para entender el diseño tipográfico en la comunicación visual. Ellen Lupton explora el uso de las tipografías en diversos contextos, desde el diseño gráfico hasta el web design, y cómo las elecciones tipográficas afectan la legibilidad, el tono y la percepción del mensaje. A través de ejemplos prácticos y análisis de diferentes tipos de letra, el libro ofrece una mirada profunda sobre la importancia del diseño tipográfico en la cultura visual contemporánea.',
    available: "yes",
    publication_year: "2015-03-15",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848144/pensar_con_tipos_qeozcu.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848157/pensar_con_tipos-1-50_z5o3l7.pdf",
    languaje: "Español",
  },
  {
    title: "Sketching - Drawing Techniques for Product Designers",
    author: "Koos Eissen, Roselien Steur",
    edition: "1ª",
    isbn: "1-569-90373-3",
    summary:
      '**"Sketching: Drawing Techniques for Product Designers"** es una guía esencial para diseñadores de productos que desean mejorar sus habilidades de dibujo y comunicación visual. Los autores Koos Eissen y Roselien Steur enseñan diversas técnicas de dibujo utilizadas en el diseño de productos, desde bocetos rápidos hasta representaciones detalladas, con el fin de transmitir ideas de forma efectiva. El libro cubre aspectos prácticos y conceptuales, proporcionando ejemplos y ejercicios que ayudan a los diseñadores a expresar sus ideas de manera más clara y precisa.',
    available: "yes",
    publication_year: "2008-03-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848146/sketching_vme2ve.webp",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848227/sketching_drawing_techniques_for_product_designers-1-20_tgvljv.pdf",
    languaje: "Inglés",
  },
  {
    title: "The Design of Everyday Things",
    author: "Don Norman",
    edition: "1ª",
    isbn: "0-465-06710-7",
    summary:
      '**"The Design of Everyday Things"** es una obra clave en el campo del diseño de productos y la interacción humana. Don Norman explora cómo los objetos cotidianos pueden ser diseñados para ser más funcionales, fáciles de usar y más accesibles para las personas. A través de ejemplos y análisis de productos reales, el libro examina los principios del diseño centrado en el usuario, destacando la importancia de la intuición en la experiencia de uso y cómo un buen diseño puede mejorar la vida diaria.',
    available: "yes",
    publication_year: "2013-11-05",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848147/the_desing_of_everyday_things-1-50_sermbh.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848149/the_desing_of_everyday_things-1-50_dcubjn.pdf",
    languaje: "Inglés",
  },
  {
    title: "Elementos del Estilo Tipográfico",
    author: "Robert Bringhurst",
    edition: "1ª",
    isbn: "978-607-16-0271-2",
    summary:
      '**"Elementos del Estilo Tipográfico"** es una obra fundamental para cualquier diseñador o tipógrafo interesado en los principios de la tipografía. Robert Bringhurst ofrece una profunda exploración de los aspectos técnicos y estéticos de la tipografía, combinando historia, teoría y práctica. El libro cubre temas como la anatomía de las letras, la composición tipográfica, las reglas de jerarquía y el uso adecuado de fuentes, convirtiéndose en una referencia esencial para crear diseños tipográficos efectivos y bellos.',
    available: "yes",
    publication_year: "2004-01-01",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848151/the_elements_of_typographic_style_qkjfpo.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848155/the_elements_of_typographic_style-1-50_fmndxi.pdf",
    languaje: "Español",
  },
];
const booksAdmin = [
  {
    title:
      "Competitive Strategy - Techniques for Analyzing Industries and Competitors",
    author: "Michael E. Porter",
    edition: "1ª",
    isbn: "0-02-925360-4",
    summary: `
    *Competitive Strategy: Techniques for Analyzing Industries and Competitors*, escrito por Michael E. Porter, es una obra fundamental en el campo de la administración empresarial que proporciona un marco teórico y práctico para comprender la competencia dentro de las industrias. Publicado por primera vez en 1980, el libro presenta conceptos clave que transformaron la manera en que las empresas analizan su entorno competitivo y toman decisiones estratégicas.
    
    En su obra, Porter introduce el concepto de las "cinco fuerzas" competitivas, que se utilizan para evaluar la intensidad de la competencia dentro de una industria. Estas fuerzas incluyen la amenaza de nuevos competidores, el poder de negociación de los proveedores y los compradores, la amenaza de productos sustitutivos y la rivalidad entre los competidores existentes. Además, Porter profundiza en las estrategias competitivas que las empresas pueden emplear para posicionarse de manera efectiva en su mercado, incluyendo la diferenciación, el liderazgo en costos y la focalización.
    
    Porter también explica cómo las empresas pueden analizar y entender su estructura competitiva a través de herramientas como el análisis de las fuerzas del mercado y la cadena de valor, lo que les permite identificar áreas donde pueden generar ventajas competitivas sostenibles. El autor argumenta que una estrategia exitosa debe centrarse en la creación de valor de una manera que no sea fácilmente replicable por los competidores.
    
    En resumen, *Competitive Strategy* ofrece una guía comprensiva para los gerentes y ejecutivos que buscan comprender los elementos que influyen en la competencia de su industria y cómo utilizar esa comprensión para desarrollar estrategias que maximicen su ventaja competitiva. Con su enfoque analítico y detallado, el libro se ha mantenido como una referencia esencial en el estudio de la estrategia empresarial.
  `,
    available: "yes",
    publication_year: "1980-09-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847650/competitive_strategy_lzx61b.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/d4a79fe8a141cadfe87e54697bc68721",
    languaje: "Inglés",
  },
  {
    title: "Marketing Management",
    author: "Philip Kotler, Kevin Lane Keller",
    edition: "15ª",
    isbn: "0-13-385646-1",
    summary: `
    *Marketing Management* de Philip Kotler es uno de los textos más influyentes y completos sobre marketing, ampliamente utilizado en estudios académicos y en la práctica empresarial. La obra, que se encuentra en varias ediciones desde su publicación original, ha sido una referencia esencial para comprender las estrategias de marketing en un contexto empresarial dinámico y globalizado.
    
    En este libro, Kotler aborda de manera integral el proceso de gestión del marketing, ofreciendo un enfoque detallado de cómo las empresas deben planificar, ejecutar y evaluar sus estrategias de marketing para satisfacer las necesidades de sus clientes y obtener ventajas competitivas. A lo largo de la obra, Kotler subraya la importancia de entender el comportamiento del consumidor, las dinámicas del mercado y las tendencias sociales y tecnológicas para construir campañas efectivas.
    
    El autor introduce un marco conceptual para la toma de decisiones en marketing, que abarca temas como la segmentación de mercados, el posicionamiento de productos, el desarrollo de nuevos productos, la fijación de precios, la distribución y la promoción. Además, Kotler examina el impacto de las tecnologías digitales en el marketing, destacando el papel del marketing en línea, la publicidad digital y las redes sociales como herramientas cruciales para las empresas modernas.
    
    Uno de los puntos clave de *Marketing Management* es la idea de que el marketing no se limita solo a la venta de productos, sino que es un proceso continuo de creación de valor para los consumidores y la empresa. Kotler enfatiza que las estrategias de marketing deben ser flexibles y adaptarse rápidamente a los cambios del mercado para mantener la competitividad.
    
    En resumen, *Marketing Management* proporciona un enfoque exhaustivo y estratégico sobre cómo las empresas pueden maximizar el impacto de sus esfuerzos de marketing. Es un manual esencial para estudiantes, profesionales y ejecutivos que buscan profundizar en el análisis y la implementación de estrategias efectivas de marketing en un entorno competitivo y en constante cambio.
  `,
    available: "yes",
    publication_year: "2015-01-01",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847652/direccion_de_marketing_zef5nk.webp",
    lib: "https://asset.cloudinary.com/dnjel6mas/262f14a53aab5e67a8f3af0f2794f2fb",
    languaje: "Inglés",
  },
  {
    title:
      "Good to Great - Why Some Companies Make the Leap... and Others Don't",
    author: "Jim Collins",
    edition: "1ª",
    isbn: "0-06-662099-6",
    summary: `
    *Good to Great: Why Some Companies Make the Leap... and Others Don't* de Jim Collins es un estudio exhaustivo que analiza las características comunes de las empresas que han logrado una transición exitosa de ser buenas a ser grandes y, lo que es aún más importante, cómo estas empresas han mantenido su éxito a largo plazo. Publicado en 2001, el libro se basa en un extenso análisis de datos y casos de estudio de 1,435 empresas que fueron evaluadas durante un periodo de 40 años para identificar qué las hizo sobresalir entre sus competidores.

    Collins explora varios factores clave que distinguen a las empresas que dan el salto de "bueno a grande". Uno de los conceptos centrales que se presenta en el libro es el de la "Liderazgo Nivel 5", un tipo de liderazgo que combina una feroz determinación con humildad personal, una característica común en los líderes de las empresas más exitosas. Además, Collins destaca la importancia de tener las personas adecuadas en el lugar adecuado, enfatizando que las empresas que logran un éxito sostenido son aquellas que priorizan a las personas antes que la estrategia o la tecnología.

    Otro concepto clave es el "Hedgehog Concept", que sostiene que las empresas deben enfocarse en lo que hacen mejor en el mundo, en lo que pueden ser las mejores, y en lo que les proporciona la mayor fuente de ganancias. Las compañías exitosas descubren su núcleo de valor y se concentran en él, eliminando las distracciones y asegurando que sus esfuerzos estén alineados con esa visión central.

    Collins también introduce la idea del "Flywheel Effect" (Efecto Flywheel), que describe cómo el éxito sostenido se construye con el tiempo, a través de esfuerzos consistentes y acumulativos. A diferencia de las soluciones rápidas, el Flywheel se basa en la persistencia, la disciplina y la inversión a largo plazo, lo que genera un impulso imparable una vez que la empresa ha alcanzado un nivel de excelencia.

    En resumen, *Good to Great* ofrece una visión profunda de los principios y las prácticas que separan a las empresas excepcionales de las mediocres. A través de su investigación y análisis detallado, Collins proporciona un marco para que las empresas busquen el crecimiento sostenible, la excelencia operativa y el liderazgo visionario, con el objetivo de lograr la transición de ser una buena empresa a convertirse en una gran empresa.
  `,
    available: "yes",
    publication_year: "2001-10-16",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847654/good_to_great_why_some_companies_make_the_leap_and_others_dont_vzsmli.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/cd571e5a94cf52fecf4c0ff54b0792d3",
    languaje: "Inglés",
  },
  {
    title: "Leaders Eat Last - Why Some Teams Pull Together and Others Don't",
    author: "Simon Sinek",
    edition: "1ª",
    isbn: "1-59184-801-6",
    summary: `
    *Leaders Eat Last: Why Some Teams Pull Together and Others Don't* de Simon Sinek es un libro que explora el impacto del liderazgo en la cultura de las organizaciones y cómo los líderes efectivos pueden inspirar a sus equipos a trabajar de manera unida y con propósito. Publicado en 2014, el libro continúa con la idea central de Sinek, presentada en su anterior obra *Start with Why*, enfocándose en cómo los líderes pueden crear un entorno en el que las personas se sientan seguras, valoradas y motivadas para colaborar de manera efectiva.

    Sinek utiliza el concepto de "círculos de seguridad" para ilustrar cómo los líderes deben proteger a sus equipos de amenazas externas e internas, de modo que los miembros del equipo puedan concentrarse en su trabajo sin temor. El autor argumenta que cuando los líderes priorizan el bienestar de sus empleados y fomentan una cultura de confianza y respeto, las personas están más dispuestas a sacrificarse por el bien del equipo y de la organización.

    Un tema recurrente en el libro es la importancia de los lazos sociales y emocionales en el trabajo. Sinek explica cómo las neurociencias, particularmente la liberación de sustancias químicas como la oxitocina, están involucradas en las relaciones humanas y cómo los líderes pueden aprovechar estos principios para crear una cultura en la que las personas se cuiden mutuamente, especialmente en tiempos de crisis. Los líderes que se ocupan de las necesidades emocionales de sus equipos pueden fomentar un sentido de propósito y pertenencia que impulsa el compromiso y el rendimiento.

    Además, Sinek aborda las malas prácticas de liderazgo y cómo algunas organizaciones priorizan las ganancias a corto plazo sobre el bienestar de sus empleados, lo que puede llevar a la desconfianza, el agotamiento y el deterioro de la moral. Contrariamente, los líderes que "comen al final", es decir, que ponen las necesidades de su equipo antes que las suyas propias, son los que generan resultados sostenibles y una cultura organizacional sólida.

    En resumen, *Leaders Eat Last* proporciona una visión profunda sobre cómo los grandes líderes fomentan la cooperación, la lealtad y el éxito a largo plazo dentro de sus equipos, creando un entorno seguro, inclusivo y de apoyo. A través de ejemplos de la vida real y principios basados en la neurociencia, Sinek ofrece un enfoque humanista sobre el liderazgo que inspira a los lectores a reimaginar cómo pueden liderar y hacer crecer sus propias organizaciones.
  `,
    available: "yes",
    publication_year: "2014-01-07",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847656/leaders_eat_last_ifdnuo.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/7f054d58e7a0d46b7becf97c64716777",
    languaje: "Inglés",
  },
  {
    title: "Principles of Corporate Finance",
    author: "Richard A. Brealey, Stewart C. Myers, Franklin Allen",
    edition: "12ª",
    isbn: "978-1259862433",
    summary: `
    *Principles of Corporate Finance* es una obra esencial en el campo de las finanzas corporativas que proporciona un enfoque integral sobre los conceptos, principios y técnicas utilizadas en la toma de decisiones financieras dentro de las empresas. Publicado por primera vez en 1978, el libro ha sido actualizado y revisado en varias ediciones, y sigue siendo una de las referencias más importantes en el estudio de las finanzas empresariales.

    Los autores comienzan con una introducción a los principios fundamentales de las finanzas, como la maximización del valor para los accionistas y la gestión del riesgo. A lo largo del libro, se exploran diversos temas clave, incluyendo la evaluación de proyectos de inversión, el análisis de riesgos, la estructura de capital, las políticas de dividendos, la valoración de activos financieros y el uso de instrumentos financieros para financiar las operaciones de la empresa.

    Una de las ideas centrales del libro es el concepto de **valor presente neto (VPN)**, que se utiliza para tomar decisiones sobre la viabilidad de proyectos de inversión. Los autores enfatizan que las empresas deben tomar decisiones que maximicen el valor de sus flujos de efectivo futuros, descontados a su valor presente, utilizando tasas de descuento adecuadas que reflejen el riesgo de esos flujos.

    Otro tema fundamental es la **estructura de capital**, que trata sobre cómo las empresas deben financiar sus actividades, ya sea mediante deuda o capital propio. El libro explica los beneficios y riesgos asociados con cada fuente de financiación, y cómo las decisiones sobre la estructura de capital afectan al valor de la empresa y a la gestión del riesgo.

    Además, *Principles of Corporate Finance* cubre el impacto de las decisiones financieras en el comportamiento de los mercados, analizando cómo los inversores reaccionan ante las decisiones corporativas, la importancia de la información financiera y cómo la teoría moderna de carteras y la eficiencia del mercado pueden ser aplicadas en las decisiones corporativas.

    En resumen, *Principles of Corporate Finance* ofrece un enfoque completo y accesible sobre las finanzas corporativas, proporcionando a los lectores una base sólida para comprender los aspectos clave de la toma de decisiones financieras dentro de las empresas. Es un texto clave para estudiantes de finanzas y profesionales que buscan profundizar en los principios y prácticas que guían las decisiones financieras en el entorno corporativo.
  `,
    available: "yes",
    publication_year: "2020-06-15",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847658/principios_de_finanzas_corporativas_ub45fg.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/4c3917b1b0403409fb0a07a8989941d1",
    languaje: "Inglés",
  },
  {
    title: "Influence - The Psychology of Persuasion",
    author: "Robert B. Cialdini",
    edition: "1ª",
    isbn: "0-06-124189-X",
    summary: `
    *Influence: The Psychology of Persuasion* de Robert B. Cialdini es un libro clave en el campo de la psicología del comportamiento y la persuasión, publicado por primera vez en 1984. Cialdini explora los principios fundamentales que subyacen en el proceso de persuasión, ayudando a los lectores a entender cómo las personas pueden ser influenciadas y cómo estas técnicas pueden ser utilizadas en diversos contextos, desde la publicidad hasta la negociación y la política.

    A lo largo del libro, Cialdini identifica seis principios universales de persuasión, que son fundamentales para comprender cómo los individuos toman decisiones y cómo las marcas, organizaciones y personas pueden influir en esas decisiones. Estos principios son:

    1. **Reciprocidad**: Las personas tienden a devolver los favores o gestos amables. Si alguien hace algo por nosotros, sentimos la necesidad de devolverlo.
    
    2. **Compromiso y coherencia**: Una vez que una persona se compromete con algo, es más probable que continúe en esa dirección para mantener la coherencia con su compromiso inicial.
    
    3. **Prueba social**: Las personas tienden a hacer lo que ven hacer a otros, especialmente si perciben que esas otras personas tienen autoridad o son similares a ellos.
    
    4. **Gusto**: Las personas están más dispuestas a ser influenciadas por aquellos que les gustan o con los que tienen una conexión emocional. La simpatía y la relación personal juegan un papel clave en la persuasión.
    
    5. **Autoridad**: Las personas tienden a seguir a figuras de autoridad o expertos en un tema, incluso si no entienden completamente los argumentos presentados.
    
    6. **Escasez**: Las personas valoran más las cosas que perciben como escasas o limitadas, lo que las lleva a tomar decisiones más rápidas e impulsivas por miedo a perder una oportunidad.

    Cialdini también describe cómo estos principios pueden ser usados de manera ética para influir en otros, así como cómo reconocer cuándo están siendo utilizados de manera manipulativa o coercitiva. El autor explica cómo la persuasión no es solo una herramienta de marketing, sino también una habilidad que se puede aplicar en la vida diaria, desde el entorno laboral hasta las relaciones personales.

    En resumen, *Influence* es una obra esencial para comprender los mecanismos psicológicos detrás de las decisiones humanas y cómo las personas y organizaciones pueden usar ese conocimiento para mejorar sus estrategias de persuasión y comunicación. A través de ejemplos prácticos y estudios de caso, Cialdini ofrece un enfoque accesible y profundo sobre cómo influir de manera efectiva en los demás, siempre consciente de las implicaciones éticas del poder de la persuasión.
  `,
    available: "yes",
    publication_year: "1984-09-01",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847660/the_sychology_of_ersuasion_xezrc6.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/9f24432a66a5d2a9a37dae44a6527075",
    languaje: "Inglés",
  },
  {
    title: "Zero to One - Notes on Startups or How to Build the Future",
    author: "Peter Thiel, Blake Masters",
    edition: "1ª",
    isbn: "978-0804139298",
    summary: `
    *Zero to One: Notes on Startups, or How to Build the Future* de Peter Thiel es un libro que ofrece una visión profunda sobre la creación de startups y la innovación tecnológica. Publicado en 2014, el libro se centra en la idea de que el verdadero progreso en los negocios y la tecnología no proviene de copiar lo que ya existe, sino de crear algo completamente nuevo. Thiel, un inversor y empresario de renombre, conocido por ser cofundador de PayPal y Palantir, comparte sus perspectivas sobre cómo las empresas pueden pasar de cero a uno, es decir, de no existir a crear algo completamente único y valioso.

    El concepto de *Zero to One* se refiere a la creación de monopolios en lugar de competir en mercados saturados. Thiel argumenta que la verdadera innovación ocurre cuando una empresa no intenta replicar lo que ya se hace, sino que inventa algo completamente nuevo que cambie las reglas del juego. En lugar de enfocarse en la competencia, las startups deben crear algo que sea tan único que no tenga competidores. Este tipo de innovación, según Thiel, es la que genera el mayor valor y tiene el mayor impacto.

    El libro cubre varios temas clave, como la importancia de la visión a largo plazo, el liderazgo y la construcción de equipos excepcionales, y la necesidad de buscar oportunidades de negocio que otros no están viendo. Thiel también discute la importancia de las barreras de entrada, como la tecnología propietaria y el control de la distribución, que permiten a las empresas mantenerse competitivas a lo largo del tiempo.

    Además, *Zero to One* desafía muchas de las ideas comunes sobre el éxito empresarial. Thiel critica la obsesión con la competencia y la imitación, y subraya la importancia de pensar de manera original y arriesgada. A lo largo del libro, ofrece consejos prácticos para emprendedores, como la importancia de enfocarse en el producto primero, la necesidad de tener una ventaja tecnológica, y cómo las empresas pueden construir un equipo que comparta una visión común.

    En resumen, *Zero to One* es un libro esencial para cualquier emprendedor o innovador que busque no solo crear una empresa exitosa, sino también generar un impacto real en el futuro. Thiel proporciona una guía sobre cómo pensar de manera diferente, construir monopolios tecnológicos y, lo más importante, cómo pasar de cero a uno, de la nada a algo verdaderamente revolucionario.
  `,
    available: "yes",
    publication_year: "2014-09-16",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847663/zero_to_one_notes_on_startups_or_how_to_build_the_future_cerqzg.jpg",
    lib: "https://asset.cloudinary.com/dnjel6mas/36452fb78f77e1e624d51d2ee45fb168",
    languaje: "Inglés",
  },
];
const booksInternational = [
  {
    title: "International Marketing",
    author: "Philip R. Cateora, John L. Graham, Mary C. Gilly",
    edition: "17ª",
    isbn: "978-1259738497",
    summary:
      '**"International Marketing"** es un texto clave en el campo del marketing global, que ofrece un enfoque integral para entender los mercados internacionales. Los autores, Philip R. Cateora, John L. Graham y Mary C. Gilly, exploran temas fundamentales como la adaptación de estrategias de marketing a diferentes culturas, la gestión de relaciones internacionales, la segmentación global de mercados y la entrada en mercados extranjeros. Este libro es una herramienta esencial para los estudiantes y profesionales interesados en el marketing internacional y la expansión global de las empresas.',
    available: "yes",
    publication_year: "2016-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847944/cateora_marketing_internacional_rw5zvp.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847946/cateora_marketing_internacional-1-20_lwjklh.pdf",
    languaje: "Inglés",
  },
  {
    title: "International Economics - Theory and Policy",
    author: "Paul R. Krugman, Maurice Obstfeld",
    edition: "10ª",
    isbn: "978-0133423643",
    summary:
      '**"International Economics: Theory and Policy"** es una obra fundamental en el estudio de la economía internacional. Paul R. Krugman y Maurice Obstfeld abordan de manera clara y accesible temas clave como el comercio internacional, la política comercial, las finanzas internacionales y los efectos de la globalización en las economías. El libro ofrece tanto un enfoque teórico como práctico, proporcionando un marco para comprender los complejos temas económicos que influyen en las decisiones políticas y comerciales a nivel global.',
    available: "yes",
    publication_year: "2014-01-01",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847947/economia_internacional_iwam9r.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847949/economia_internacional-1-50_msmlqe.pdf",
    languaje: "Inglés",
  },
  {
    title: "Globalization and Its Discontents",
    author: "Joseph E. Stiglitz",
    edition: "1ª",
    isbn: "0-393-32312-3",
    summary:
      '**"Globalization and Its Discontents"** es un análisis crítico sobre los efectos de la globalización en los países en desarrollo, escrito por el premio Nobel de Economía Joseph E. Stiglitz. Stiglitz examina cómo las políticas impulsadas por instituciones internacionales como el Fondo Monetario Internacional (FMI) y el Banco Mundial han afectado negativamente a las economías emergentes, imponiendo reformas que han exacerbado la pobreza y la desigualdad. A través de su experiencia personal en el ámbito de la economía global, el autor ofrece una perspectiva valiosa sobre los fallos del sistema económico global y las alternativas necesarias.',
    available: "yes",
    publication_year: "2002-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847950/globalization_and_its_discontents_gwg9ba.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847952/globalization_and_its_discontents-1-50_fxzfby.pdf",
    languaje: "Inglés",
  },
  {
    title: "International Business - Competing in the Global Marketplace",
    author: "Charles W. L. Hill",
    edition: "11ª",
    isbn: "978-1259912352",
    summary:
      '**"International Business: Competing in the Global Marketplace"** es una obra fundamental para entender los aspectos clave de la gestión empresarial en un entorno global. Charles W. L. Hill aborda temas como la estrategia de negocios internacionales, la globalización, la cultura empresarial, y la gestión de operaciones y recursos humanos en mercados internacionales. Este libro es una guía esencial para estudiantes y profesionales interesados en aprender cómo las empresas pueden competir eficazmente en el mercado global.',
    available: "yes",
    publication_year: "2019-12-23",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847953/international_business_ozajvn.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847955/international_business-1-50_uaedg2.pdf",
    languaje: "Inglés",
  },
  {
    title: "Marketing Internacional",
    author: "Philip R. Cateora, John L. Graham, Mary C. Gilly",
    edition: "17ª",
    isbn: "978-1259738497",
    summary:
      '**"International Marketing"** es un texto esencial en el campo del marketing global. Philip R. Cateora, John L. Graham y Mary C. Gilly exploran cómo las empresas pueden adaptar sus estrategias de marketing a los mercados internacionales. Abarca temas como la segmentación global de mercados, la adaptación cultural, las estrategias de entrada a mercados extranjeros, y los desafíos y oportunidades que surgen al operar en diferentes entornos culturales, legales y económicos. Este libro es ideal para estudiantes y profesionales interesados en el marketing internacional.',
    available: "yes",
    publication_year: "2016-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847956/marketing_internacional_mydy5y.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847959/marketing_internacional-1-50_bxzgqr.pdf",
    languaje: "Inglés",
  },
];
const booksAccounting = [
  {
    title:
      "Ethical Obligations and Decision Making in Accounting - Text and Cases",
    author: "Steven M. Mintz, Roselyn E. Morris",
    edition: "4ª",
    isbn: "978-0073379581",
    summary:
      '**"Ethical Obligations and Decision Making in Accounting: Text and Cases"** explora las cuestiones éticas que enfrentan los contadores en su práctica profesional. Steven M. Mintz y Roselyn E. Morris analizan situaciones éticas reales y ofrecen un marco para la toma de decisiones éticas en el contexto de la contabilidad. Este libro es esencial para estudiantes y profesionales que buscan comprender la importancia de la ética en la contabilidad y cómo manejar dilemas éticos de manera efectiva.',
    available: "yes",
    publication_year: "2017-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847982/ethical_obligations_decision_making_in_accounting-1-50_vwzvn9.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848037/ethical_obligations_decision_making_in_accounting-1-50_j6xstl.pdf",
    languaje: "Inglés",
  },
  {
    title: "Intermediate Accounting",
    author: "Donald E. Kieso, Jerry J. Weygandt, Terry D. Warfield",
    edition: "16ª",
    isbn: "978-1119472028",
    summary:
      '**"Intermediate Accounting"** es un texto fundamental que cubre los principios contables intermedios y su aplicación en el mundo real. Donald E. Kieso, Jerry J. Weygandt y Terry D. Warfield ofrecen un enfoque claro y estructurado, abarcando temas como la medición de activos y pasivos, la presentación de informes financieros y las normas contables. Este libro es ideal para estudiantes de contabilidad que buscan profundizar en sus conocimientos y habilidades contables.',
    available: "yes",
    publication_year: "2018-01-01",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848009/intermediate_accounting-1-50_txrosq.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848040/intermediate_accounting-1-50_bzdann.pdf",
    languaje: "Inglés",
  },
  {
    title: "Principles of Auditing and Other Assurance Services",
    author: "Ray Whittington, Kurt Pany",
    edition: "20ª",
    isbn: "978-1260045794",
    summary:
      '**"Principles of Auditing and Other Assurance Services"** ofrece una cobertura integral de los principios y prácticas de auditoría y servicios de aseguramiento. Ray Whittington y Kurt Pany abordan temas esenciales como la planificación de auditorías, la evaluación de riesgos, la obtención de evidencia y la elaboración de informes. Este libro es un recurso valioso para estudiantes y profesionales que desean comprender los fundamentos de la auditoría y cómo aplicarlos en el entorno financiero actual.',
    available: "yes",
    publication_year: "2019-01-01",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848010/whittington_pany_principles_of_auditing_flhhu8.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848032/whittington_pany_principles_of_auditing-1-50_iiqdhb.pdf",
    languaje: "Inglés",
  },
];
const booksLaws = [
  {
    title: "The Concept of Law",
    author: "H.L.A. Hart",
    edition: "3ª",
    isbn: "978-0199241444",
    summary:
      '**"The Concept of Law"** es una obra fundamental en la teoría del derecho, donde H.L.A. Hart examina la naturaleza del derecho y su relación con la moralidad y la autoridad. El libro presenta un análisis crítico de las teorías del derecho previas, estableciendo la diferencia entre las reglas de derecho y las reglas morales. Hart también introduce conceptos clave como la distinción entre normas primarias y secundarias, y la importancia del sistema jurídico en la sociedad. Es una lectura esencial para estudiantes y académicos de derecho y filosofía del derecho.',
    available: "yes",
    publication_year: "2012-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848059/el_concepto_de_derecho-1-50_wvwmwi.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848061/el_concepto_de_derecho-1-50_pba9rp.pdf",
    languaje: "Inglés",
  },
  {
    title: "International Law",
    author: "Malcolm N. Shaw",
    edition: "8ª",
    isbn: "978-1108457328",
    summary:
      '**"International Law"** es un texto exhaustivo que aborda los principios y la práctica del derecho internacional. Malcolm N. Shaw examina los aspectos fundamentales del derecho internacional, incluyendo el origen y desarrollo de las normas, la relación entre el derecho nacional e internacional, y la resolución de disputas. Este libro es esencial para estudiantes y profesionales interesados en comprender las complejidades del derecho internacional y su aplicación en el mundo actual.',
    available: "yes",
    publication_year: "2017-01-01",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848092/international_law_lwcqrk.png",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848094/international_law-1-50_kbyfe3.pdf",
    languaje: "Inglés",
  },
  {
    title: "Law's Empire",
    author: "Ronald Dworkin",
    edition: "1ª",
    isbn: "978-0674002787",
    summary:
      '**"Law\'s Empire"** es una obra fundamental en la filosofía del derecho donde Ronald Dworkin argumenta a favor de una interpretación constructiva del derecho. Dworkin critica el positivismo jurídico y presenta su teoría del derecho como una práctica interpretativa que busca la justicia y la igualdad. El libro explora la relación entre el derecho y la moral, ofreciendo una perspectiva profunda sobre cómo deben entenderse las leyes y su aplicación en la sociedad. Es esencial para cualquier estudiante o académico interesado en la teoría legal contemporánea.',
    available: "yes",
    publication_year: "1986-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848096/laws_empire_izpaa4.png",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848106/laws_empire-1-50_xeffjd.pdf",
    languaje: "Inglés",
  },
  {
    title: "The Federalist Papers",
    author: "Alexander Hamilton, James Madison, John Jay",
    edition: "1ª",
    isbn: "978-0451528810",
    summary:
      '**"The Federalist Papers"** es una colección de 85 ensayos escritos por Alexander Hamilton, James Madison y John Jay, con el objetivo de promover la ratificación de la Constitución de los Estados Unidos. Los autores abordan temas fundamentales sobre la estructura del gobierno, los derechos y la libertad individual, y la necesidad de un gobierno federal fuerte. Esta obra es un pilar en el estudio de la política estadounidense y la teoría constitucional, proporcionando una visión profunda de los principios que guían el sistema político de los EE. UU.',
    available: "yes",
    publication_year: "1986-01-01",
    available_copies: 5,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848098/the_federalist-1-50_usbnty.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848100/the_federalist-1-50_niabwm.pdf",
    languaje: "Inglés",
  },
  {
    title: "The Law of Armed Conflict - International Humanitarian Law in War",
    author: "Gary D. Solis",
    edition: "3ª",
    isbn: "978-1107006407",
    summary:
      '**"The Law of Armed Conflict: International Humanitarian Law in War"** es una obra exhaustiva que explora los principios, normas y prácticas del derecho internacional humanitario, que regula la conducta de los conflictos armados. Gary D. Solis analiza en profundidad las leyes que protegen a los combatientes y civiles, el uso de la fuerza, y las responsabilidades de los actores en guerra. Este libro es esencial para estudiantes y profesionales del derecho internacional, así como para aquellos interesados en comprender cómo las leyes buscan limitar los efectos de la guerra en la humanidad.',
    available: "yes",
    publication_year: "2016-03-28",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848102/the_law_of_armed_conflict_erndqz.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848104/the_law_of_armed_conflict-1-50_x8dcpy.pdf",
    languaje: "Inglés",
  },
];
const booksCivil = [
  {
    title: "Structural Analysis",
    author: "Russell C. Hibbeler",
    edition: "9ª",
    isbn: "978-0134382593",
    summary:
      '**"Structural Analysis"** es una obra ampliamente utilizada en la ingeniería civil que aborda los métodos fundamentales para analizar estructuras de edificios y otras construcciones. Russell C. Hibbeler cubre principios de la estática y la dinámica estructural, métodos de análisis como la rigidez, los diagramas de fuerzas internas y la determinación de desplazamientos. Este libro es una referencia esencial para estudiantes y profesionales que buscan comprender el comportamiento de las estructuras bajo diferentes cargas y condiciones.',
    available: "yes",
    publication_year: "2017-02-06",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848295/analisis_estructural_bmclxv.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848309/analisis_estructural-1-50_xo3jnt.pdf",
    languaje: "Inglés",
  },
  {
    title: "Concrete - Microstructure Properties and Materials",
    author: "P. Kumar Mehta, Paulo J.M. Monteiro",
    edition: "4ª",
    isbn: "978-0071762040",
    summary:
      '**"Concrete: Microstructure, Properties, and Materials"** es un libro integral que explora la estructura y propiedades del concreto desde una perspectiva técnica y científica. Los autores, P. Kumar Mehta y Paulo J.M. Monteiro, abordan los fundamentos del concreto, su comportamiento bajo diferentes condiciones y su durabilidad. Este texto es esencial para estudiantes y profesionales de la ingeniería civil, proporcionando una comprensión detallada sobre la ciencia detrás del concreto y su aplicación en la construcción.',
    available: "yes",
    publication_year: "2014-01-28",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848297/concrete_microstructure_properties_and_aterials_okkdy0.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848299/concrete_microstructure_properties_and_aterials-1-50_l5sg0m.pdf",
    languaje: "Inglés",
  },
  {
    title: "Design of Reinforced Concrete",
    author: "Jack C. McCormac, Russell H. Brown",
    edition: "9ª",
    isbn: "978-1118880542",
    summary:
      '**"Design of Reinforced Concrete"** es una obra clave en el estudio del diseño estructural de concreto reforzado. Jack C. McCormac y Russell H. Brown cubren los fundamentos del diseño de estructuras de concreto, incluidos los principios de flexión, torsión, corte y compresión, aplicando las normas más actuales del ACI (American Concrete Institute). Este texto es indispensable para estudiantes y profesionales de la ingeniería civil, brindando una comprensión detallada y práctica para el diseño de estructuras seguras y eficientes de concreto reforzado.',
    available: "yes",
    publication_year: "2015-02-02",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848300/design_of_reinforced_concrete_n1hypa.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848310/design_of_reinforced_concrete-1-50_ntrccr.pdf",
    languaje: "Inglés",
  },
  {
    title: "Materials for Civil and Construction Engineers",
    author: "Michael S. Mamlouk, John P. Zaniewski",
    edition: "3ª",
    isbn: "978-0134380223",
    summary:
      '**"Materials for Civil and Construction Engineers"** proporciona una comprensión profunda de los materiales utilizados en la ingeniería civil y de construcción. Michael S. Mamlouk y John P. Zaniewski cubren temas como propiedades de materiales, su comportamiento bajo cargas, y cómo seleccionar los materiales adecuados para diferentes aplicaciones estructurales y de construcción. Este libro es esencial tanto para estudiantes como para profesionales que buscan una base sólida en los materiales que dan soporte a las infraestructuras y construcciones modernas.',
    available: "yes",
    publication_year: "2017-01-26",
    available_copies: 4,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848302/materials_for_civil_and_construction_engineering_d84cxg.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848304/materials_for_civil_and_construction_engineering-1-50_ssrfvp.pdf",
    languaje: "Inglés",
  },
  {
    title: "Steel Design",
    author: "William T. Segui",
    edition: "5ª",
    isbn: "978-1133587103",
    summary:
      '**"Steel Design"** es un libro esencial para el diseño de estructuras de acero, escrito por William T. Segui. El texto aborda los principios fundamentales del diseño de estructuras de acero según las normas más actuales, como el AISC (American Institute of Steel Construction). Segui cubre aspectos clave como las tensiones, el diseño de miembros estructurales, las conexiones y las normativas que deben seguirse en la práctica profesional. Este libro es adecuado para estudiantes y profesionales de la ingeniería civil y estructural que deseen una comprensión detallada y práctica sobre el diseño de estructuras de acero.',
    available: "yes",
    publication_year: "2014-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848305/steel_design_fuuid1.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848307/steel_design-1-50_q1zqrp.pdf",
    languaje: "Inglés",
  },
];
const booksRenewableEnergy = [
  {
    title: "Geothermal Energy - Utilization and Technology",
    author: "M. P. D. Blackwell",
    edition: "1ª",
    isbn: "978-0412402306",
    summary:
      '**"Geothermal Energy: Utilization and Technology"** es un libro fundamental sobre la energía geotérmica, que cubre tanto los aspectos técnicos como las aplicaciones de esta fuente de energía renovable. M. P. D. Blackwell explora la geotermia desde su formación y evaluación hasta su uso en la generación de electricidad y calefacción. El libro es ideal para estudiantes y profesionales que buscan comprender cómo se aprovecha el calor terrestre para aplicaciones energéticas sostenibles, abordando los desafíos y oportunidades de la tecnología geotérmica.',
    available: "yes",
    publication_year: "1982-10-31",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848256/geothermal_energy_uwkc3q.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848258/geothermal_energy-1-50_exddur.pdf",
    languaje: "Inglés",
  },
  {
    title: "Design of Wind Turbines",
    author: "R. S. W. Wong, C. M. M. De Carvalho",
    edition: "1ª",
    isbn: "978-1849197365",
    summary:
      '**"Design of Wind Turbines"** es un libro técnico que aborda los principios y métodos para el diseño de turbinas eólicas. Los autores, R. S. W. Wong y C. M. M. De Carvalho, proporcionan una explicación detallada de la aerodinámica, la estructura y los componentes clave de las turbinas eólicas, así como las consideraciones técnicas para su optimización. Este texto es crucial para estudiantes, ingenieros y profesionales interesados en la energía renovable, específicamente en el diseño de sistemas de energía eólica eficientes y sostenibles.',
    available: "yes",
    publication_year: "2011-08-18",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848260/guidelines_for_design_of_wind_turbines-1-50_d42x4r.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848262/guidelines_for_design_of_wind_turbines-1-50_ad85jh.pdf",
    languaje: "Inglés",
  },
  {
    title: "Renewable Energy - A First Course",
    author: "Robert Ehrlich",
    edition: "1ª",
    isbn: "978-0471467314",
    summary:
      '**"Renewable Energy: A First Course"** es una introducción accesible a las tecnologías y principios fundamentales de las energías renovables. Robert Ehrlich cubre una variedad de fuentes de energía renovable, incluyendo la solar, eólica, hidroeléctrica, biomasa y geotérmica. Este libro es ideal para estudiantes de ingeniería, ciencias ambientales y aquellos interesados en comprender cómo funcionan las energías renovables y su papel en la lucha contra el cambio climático. Se presenta de manera clara y sencilla, permitiendo que los lectores comprendan tanto los conceptos científicos como los aspectos prácticos de cada tecnología.',
    available: "yes",
    publication_year: "2007-10-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848264/renewable_energy-1-50_i5b7hp.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848278/renewable_energy-1-50_jyzhr1.pdf",
    languaje: "Inglés",
  },
  {
    title: "Water Resources Engineering",
    author: "Larry W. Mays",
    edition: "2ª",
    isbn: "978-0133944433",
    summary:
      '**"Water Resources Engineering"** es un libro integral sobre el diseño y la gestión de recursos hídricos. Larry W. Mays aborda temas clave como la hidráulica, el manejo de cuencas hidrográficas, el control de inundaciones, la gestión del agua potable y la ingeniería de presas. Con un enfoque práctico y técnico, este libro es una herramienta valiosa para estudiantes y profesionales de la ingeniería civil, ambiental y de recursos hídricos que buscan una comprensión profunda de los sistemas de agua y su gestión sostenible.',
    available: "yes",
    publication_year: "2011-01-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848266/water_resources_engineering-1-50_vwafyw.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848269/water_resources_engineering-1-50_ligv0b.pdf",
    languaje: "Inglés",
  },
  {
    title: "Wind Energy Explained Theory Design and Application",
    author: "James F. Manwell, Jon G. McGowan",
    edition: "2ª",
    isbn: "978-1119992177",
    summary:
      '**"Wind Energy Explained: Theory, Design and Application"** es un texto completo sobre la energía eólica, cubriendo desde los principios básicos de la aerodinámica hasta el diseño y la aplicación práctica de los sistemas de energía eólica. James F. Manwell y Jon G. McGowan proporcionan una explicación detallada sobre el funcionamiento de las turbinas eólicas, su diseño y la integración de la energía eólica en sistemas de generación de energía. Este libro es adecuado tanto para estudiantes como para ingenieros que buscan una comprensión técnica y aplicada de la energía eólica como fuente de energía renovable.',
    available: "yes",
    publication_year: "2011-02-22",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848272/wind_energy_explained-1-50_aqemiw.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730848276/wind_energy_explained-1-50_f2rpvd.pdf",
    languaje: "Inglés",
  },
];
const booksArchitecture = [
  {
    title: "Los ojos de la piel - La arquitectura y los sentidos",
    author: "Juhani Pallasmaa",
    edition: "1ª",
    isbn: "978-8434317891",
    summary:
      '**"Los ojos de la piel: La arquitectura y los sentidos"** es un análisis filosófico y sensorial sobre la arquitectura desde la perspectiva de los sentidos humanos. Juhani Pallasmaa explora cómo los edificios y los espacios arquitectónicos afectan no solo nuestra vista, sino también nuestros otros sentidos, como el tacto, el oído y el olfato. El autor reflexiona sobre la experiencia espacial, el significado emocional de los espacios y la importancia de una arquitectura que despierte una respuesta sensorial más allá de la vista, invitando a una experiencia más rica y profunda con nuestro entorno construido.',
    available: "yes",
    publication_year: "1995-01-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847738/dokumen.pub_los-ojos-de-la-piel-la-arquitectura-y-los-sentidos-segunda-edicion-ampliada-9788425226274-8425226279-9788425227509-842522750x_mxgbqm.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847740/dokumen.pub_los-ojos-de-la-piel-la-arquitectura-y-los-sentidos-segunda-edicion-ampliada-9788425226274-8425226279-9788425227509-842522750x-1-50_mt0plt.pdf",
    languaje: "Español",
  },
  {
    title: "Hacia una arquitectura",
    author: "Le Corbusier",
    edition: "1ª",
    isbn: "978-8434310724",
    summary:
      '**"Hacia una arquitectura"** es una obra fundamental en la historia de la arquitectura moderna escrita por Le Corbusier. En este libro, el autor expone sus teorías sobre la arquitectura y el urbanismo, abogando por un enfoque funcional y racional en el diseño de edificios y ciudades. Le Corbusier defiende la utilización de la tecnología y los nuevos materiales en la creación de espacios habitables que respondan a las necesidades del ser humano moderno. A través de sus textos e ilustraciones, el autor muestra cómo la arquitectura debe reflejar la vida moderna y la evolución de la sociedad industrial.',
    available: "yes",
    publication_year: "1923-01-01",
    available_copies: 3,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847741/hacia_una_arquitectura_le_corbusier_ju6nqk.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847898/hacia_una_arquitectura_le_corbusier-1-50-1-20_gqdbcw.pdf",
    languaje: "Español",
  },
  {
    title: "Manual del arquitecto descalzo",
    author: "Johan Van Lengen",
    edition: "1ª",
    isbn: "978-6071601824",
    summary:
      '**"Manual del arquitecto descalzo"** es una obra que ofrece una visión alternativa y sostenible de la arquitectura, basada en el uso de materiales locales y técnicas de construcción tradicionales. Johan Van Lengen propone una forma de arquitectura accesible y ecológica, adecuada a las necesidades de las comunidades rurales y de bajos recursos. El libro aborda la importancia de la autoconstrucción, el diseño apropiado para el clima y el respeto por el entorno, con un enfoque en la simplicidad y la funcionalidad. Es una guía práctica y teórica para quienes buscan soluciones arquitectónicas más cercanas a la naturaleza.',
    available: "yes",
    publication_year: "2004-01-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847768/johan-van-lengen-manual-del-arquitecto-descalzo_deuan3.png",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847768/johan-van-lengen-manual-del-arquitecto-descalzo-1-20_wnc29i.pdf",
    languaje: "Español",
  },
  {
    title: "Delirious New York - A Retroactive Manifesto for Manhattan",
    author: "Rem Koolhaas",
    edition: "1ª",
    isbn: "978-1568981180",
    summary:
      '**"Delirious New York: A Retroactive Manifesto for Manhattan"** es una obra seminal del arquitecto Rem Koolhaas en la que reflexiona sobre la ciudad de Nueva York, en especial sobre Manhattan, a través de un análisis histórico y teórico. Koolhaas ofrece una visión provocadora y única sobre el crecimiento, la planificación urbana y la cultura que ha dado forma a esta metrópoli. El libro es un manifiesto retroactivo que examina el caos y el orden en la ciudad, así como las contradicciones y posibilidades que surgen en un entorno tan dinámico y heterogéneo como Manhattan. Es un texto fundamental para comprender el urbanismo moderno y la influencia de la ciudad de Nueva York en la arquitectura contemporánea.',
    available: "yes",
    publication_year: "1978-01-01",
    available_copies: 1,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847770/Koolhaas_Rem_Delirious_New_York_A_Retroactive_Manifesto_for_Manhattan_hsg3tv.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847772/Koolhaas_Rem_Delirious_New_York_A_Retroactive_Manifesto_for_Manhattan-1-20_mtfw81.pdf",
    languaje: "Inglés",
  },
  {
    title: "Historia de la arquitectura moderna",
    author: "Kenneth Frampton",
    edition: "1ª",
    isbn: "978-8474023469",
    summary:
      '**"Historia de la arquitectura moderna"** es una obra de Kenneth Frampton que examina el desarrollo de la arquitectura moderna desde sus inicios en el siglo XIX hasta el final del siglo XX. El libro ofrece un análisis detallado de los movimientos arquitectónicos, las figuras clave y las obras más representativas que han marcado la evolución del diseño arquitectónico moderno. Frampton examina temas como la relación entre la arquitectura y la industria, el impacto de las dos guerras mundiales y la influencia de la tecnología en la forma arquitectónica. A través de un enfoque crítico y reflexivo, el autor ofrece una visión comprensiva de los principales hitos de la arquitectura moderna.',
    available: "yes",
    publication_year: "1992-01-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847773/tclz_hiii_bibliotp1_frampton_ddixx1.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847775/tclz_hiii_bibliotp1_frampton-1-20_nekqrq.pdf",
    languaje: "Español",
  },
  {
    title: "La poética del espacio",
    author: "Gaston Bachelard",
    edition: "1ª",
    isbn: "978-8474236642",
    summary:
      '**"La poética del espacio"** es una reflexión filosófica sobre cómo los espacios interiores, como las casas, las habitaciones y otros lugares, influyen en la imaginación humana. Gaston Bachelard explora la relación entre los espacios físicos y las emociones humanas, destacando cómo los recuerdos, los sueños y las experiencias personales se entrelazan con los lugares que habitamos. Este libro es un análisis profundo de la importancia del espacio en la psicología y la poesía, y se ha convertido en una obra fundamental en los estudios de la filosofía del espacio y la estética.',
    available: "yes",
    publication_year: "1958-10-01",
    available_copies: 2,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847733/Bachelard_Gaston_La_poetica_del_espacio_cj1yr5.png",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847735/Bachelard_Gaston_La_poetica_del_espacio-1-50_oowbki.pdf",
    languaje: "Español",
  },
  {
    title: "Detalles constructivos de elementos a cielo abierto",
    author: "Luis García",
    edition: "1ª",
    isbn: "978-8476537883",
    summary:
      '**"Detalles constructivos de elementos a cielo abierto"** es un libro técnico que ofrece una visión detallada sobre los métodos y técnicas de construcción de elementos expuestos a las condiciones climáticas y ambientales. Este texto cubre aspectos fundamentales en la construcción de elementos como techos, cubiertas, muros y otros elementos estructurales a la intemperie, abordando tanto el diseño como la ejecución de estos detalles constructivos. Es una herramienta clave para arquitectos e ingenieros civiles interesados en la planificación y construcción de proyectos que deben resistir las inclemencias del tiempo.',
    available: "yes",
    publication_year: "2005-09-01",
    available_copies: 1,
    cover:
      "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847736/Detalles_constructivos_de_elementos_a_cielo_abierto_jcicug.jpg",
    lib: "https://res.cloudinary.com/dnjel6mas/image/upload/v1730847737/Detalles_constructivos_de_elementos_a_cielo_abierto-1-50_nhuzen.pdf",
    languaje: "Español",
  },
];
const books = [
  {
    title: "Eloquent Javascript",
    author: "Marijn Haverbeke",
    edition: "4ª",
    isbn: "970-17-0108-9",
    summary:
      "Eloquent JavaScript A Modern Introduction to Programming es un libro esencial para cualquier desarrollador que quiera dominar \
     JavaScript. Escrito por Marijn Haverbeke, este libro proporciona una introducción exhaustiva y accesible al lenguaje de programación \
     JavaScript, combinando los fundamentos con principios avanzados. A través de ejemplos prácticos y ejercicios desafiantes, los lectores aprenderán \
     desde conceptos básicos como variables y funciones hasta temas avanzados como la programación asíncrona y el manejo del DOM. Perfecto tanto para\
     principiantes como para desarrolladores experimentados, Eloquent JavaScript es una guía completa para convertirte en un experto en JavaScript.",
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 1,
    cover: "https://i.imgur.com/prwImiQ.png",
    languaje: "Español",
  },
  {
    title: "Javascript the Good Parts",
    author: "Douglas Crockford",
    edition: "1ª",
    isbn: "978-0-596-51774-8",
    summary:
      "JavaScript: The Good Parts es una obra fundamental escrita por Douglas Crockford, que se centra en las características más robustas\
     y efectivas del lenguaje JavaScript. Este libro destila el lenguaje hasta sus elementos más esenciales y útiles, dejando de lado las\
     características problemáticas. A través de una exploración profunda de las buenas partes de JavaScript, Crockford ofrece una guía clara y\
      concisa que ayuda a los desarrolladores a escribir código más limpio, eficiente y mantenible. Ideal para desarrolladores que desean mejorar\
      su comprensión y habilidades en JavaScript, JavaScript: The Good Parts es un recurso invaluable para aprovechar al máximo este lenguaje\
       versátil y poderoso.",
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 3,
    cover: "https://i.imgur.com/vxJt2vG.png",
    languaje: "Español",
  },
  {
    title: "Javascript Designs Patterns",
    author: "Addy Osmany",
    edition: "1ª",
    isbn: "978-0-596-51774-8",
    summary:
      "JavaScript Design Patterns es un libro de Stoyan Stefanov que ofrece una profunda comprensión de los patrones de diseño aplicados al \
    lenguaje JavaScript. Este libro explora cómo utilizar patrones de diseño comunes para resolver problemas recurrentes en el desarrollo de \
    software y mejorar la estructura y la mantenibilidad del código. A través de ejemplos prácticos y explicaciones claras, Stefanov guía a los \
    desarrolladores en la implementación de patrones como el Singleton, el Módulo y el Observador. Ideal para quienes buscan optimizar sus \
    habilidades en diseño de software y aplicar soluciones probadas en sus proyectos JavaScript, JavaScript Design Patterns es una lectura esencial \
    para mejorar la calidad y la eficiencia del código.",
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 2,
    cover: "https://i.imgur.com/w23n6BK.png",
    languaje: "Español",
  },
  {
    title: "Codigo limpio",
    author: "Robert Cecil ",
    edition: "1ª",
    isbn: "978-84-415-3210-6",
    summary:
      '"Código Limpio" de Robert C. Martin ofrece una guía esencial para escribir código que sea claro y fácil de mantener. El libro \
    proporciona principios y prácticas para mejorar la calidad del código, enfocándose en la simplicidad, la legibilidad y la consistencia. Martin \
    cubre temas como la organización del código, la elección de nombres descriptivos, y la estructura de funciones y clases. Ideal para desarrolladores \
    que desean producir software de alta calidad y mejorar la mantenibilidad de sus proyectos, el libro es una referencia clave para cualquier \
    profesional del desarrollo de software.',
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 2,
    cover: "https://i.imgur.com/LHM7ujw.png",
    languaje: "Español",
  },
  {
    title: "Calculo de una variable",
    author: "Claudio Pita Ruiz",
    edition: "1ª",
    isbn: "970-17-0108-9",
    summary:
      '"Cálculo de una Variable" de James Stewart es un libro fundamental para aprender cálculo diferencial e integral de funciones de' +
      "una sola variable. El texto cubre conceptos clave como límites, derivadas, integrales y sus aplicaciones. Con numerosos ejemplos y ejercicios" +
      "prácticos, el libro ayuda a comprender y aplicar técnicas y teoremas importantes en cálculo. Es una excelente referencia tanto para estudiantes" +
      "que comienzan en cálculo como para aquellos que buscan reforzar sus conocimientos en el tema. En este libro se tratan los temas que normalmente" +
      "constituyen un primer curso de cálculo (Diferencial e Integral de funciones de una variable Real, o bien, simplemente Calculo de una Variable)," +
      "como el que se imparte en el último año de la preparatoria o en los primeros semestres de una licenciatura.",
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 1,
    cover: "https://i.imgur.com/iEYQP4u.png",
    languaje: "Español",
  },
  {
    title: "El lenguaje de programacion C",
    author: "Brian W. Kernighan",
    edition: "2ª",
    isbn: "968-880-205-0",
    summary:
      '"El Lenguaje de Programación C" de Brian W. Kernighan y Dennis M. Ritchie es una obra clave para aprender el lenguaje de \
    programación C. El libro ofrece una introducción clara al lenguaje, cubriendo desde los conceptos básicos hasta temas avanzados. Con ejemplos\
     prácticos y explicaciones detalladas, los autores abordan la sintaxis del lenguaje, estructuras de datos, control de flujo y gestión de memoria\
     . Es una referencia esencial para desarrolladores que desean entender a fondo C y aplicar sus principios en programación de sistemas y \
     aplicaciones.',
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 2,
    cover: "https://i.imgur.com/J9bntsu.png",
    languaje: "Español",
  },
  {
    title: "Linux Basics for Hackers",
    author: "OccupyTheWeb",
    edition: "1ª",
    isbn: "1­-593-27­-855­-1",
    summary:
      '**"Linux Basics for Hackers"** es una guía que cubre los fundamentos de Linux desde la perspectiva de la seguridad informática. \
    El libro aborda la instalación y configuración de Linux, el uso de comandos básicos, la gestión de archivos y usuarios, y la configuración de \
    redes y servicios. También explora herramientas de hacking, técnicas de seguridad y scripting para automatizar tareas. Es una introducción útil\
     para quienes desean aprender Linux con un enfoque en ciberseguridad y hacking ético.',
    available: "yes",
    publication_year: "2024-08-10",
    available_copies: 3,
    cover: "https://i.imgur.com/jixA03i.png",
    languaje: "Español",
  },
  ,
  ,
];

//LIBROS
// const insertBooks = async () => {
//   await pool.connect();

//   for (const book of books) {
//     const query = `
//       INSERT INTO books (title, author, edition, isbn, summary, available, publication_year, available_copies, cover, languaje)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//     `;

//     const values = [
//       book.title,
//       book.author,
//       book.edition,
//       book.isbn,
//       book.summary,
//       book.available,
//       book.publication_year,
//       book.available_copies,
//       book.cover,
//       book.lib,
//       book.languaje
//     ];

//     try {
//       await pool.query(query, values);
//       console.log(`Libro con ID ${book.title} insertado correctamente.`);
//     } catch (err) {
//       console.error(`Error insertando el libro con ID ${book.title}:`, err);
//     }
//   }
// return console.log('exito');

//   await pool.end();
// };

const insertBookWithCategory = async (book, categoryId) => {
  try {
    await pool.query("BEGIN");

    const insertBookQuery = `
          INSERT INTO books (title, author, edition, isbn, summary, available, publication_year, available_copies, cover, lib, languaje)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id;
      `;
    const bookValues = [
      book.title,
      book.author,
      book.edition,
      book.isbn,
      book.summary,
      book.available,
      book.publication_year,
      book.available_copies,
      book.cover,
      book.lib,
      book.languaje,
    ];
    const res = await pool.query(insertBookQuery, bookValues);
    const bookId = res.rows[0].id;

    const insertCategoryQuery = `
          INSERT INTO book_categories (book_id, category_id)
          VALUES ($1, $2);
      `;
    await pool.query(insertCategoryQuery, [bookId, categoryId]);
    console.log(`Libro con ID ${bookId} insertado correctamente.`);    
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};
// booksArchitecture.forEach(book => insertBookWithCategory(book, 2));

function getcatecories() {
  const query = "SELECT * FROM categories";
  pool.query(query, (err, res) => {
    if (err) {
      console.error("Error al obtener las categorías:", err);
      return;
    }
    console.log("Categorías:", res.rows);
    
  });
}
// getcatecories();

// // async function insertarLibrosCiclo () {
//   for (let index = 0; index < 30; index++) {
//     await insertBooks();
//   }
// }

// insertarLibrosCiclo();

const createOrder = async (userId, bookId, loanDate, returnDate) => {
  try {
    await pool.query("BEGIN");

    // Insertar la orden
    const insertOrderText = `
          INSERT INTO orders (user_id, book_id, loan_date, return_date)
          VALUES ($1, $2, $3, $4) RETURNING id;
      `;
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

    await pool.query("COMMIT");
    return orderId;
  } catch (error) {
    await pool.query("ROLLBACK");
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
    console.error("Error al incrementar las vistas del libro:", error);
    return error; // Lanzar el error para manejarlo en otro lugar
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
  } catch (error) {}
};

const usersData = [
  [
    {
      username: "user1",
      email: "user1@example.com",
      password_hash: "hashedpassword1",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket1",
    },
    {
      username: "user2",
      email: "user2@example.com",
      password_hash: "hashedpassword2",
      phone: "1234567891",
      role: "student",
      socket_id: "socket2",
    },
    {
      username: "user3",
      email: "user3@example.com",
      password_hash: "hashedpassword3",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket3",
    },
    {
      username: "user4",
      email: "user4@example.com",
      password_hash: "hashedpassword4",
      phone: "1234567893",
      role: "student",
      socket_id: "socket4",
    },
    {
      username: "user5",
      email: "user5@example.com",
      password_hash: "hashedpassword5",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket5",
    },
    {
      username: "user6",
      email: "user6@example.com",
      password_hash: "hashedpassword6",
      phone: "1234567895",
      role: "student",
      socket_id: "socket6",
    },
    {
      username: "user7",
      email: "user7@example.com",
      password_hash: "hashedpassword7",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket7",
    },
    {
      username: "user8",
      email: "user8@example.com",
      password_hash: "hashedpassword8",
      phone: "1234567897",
      role: "student",
      socket_id: "socket8",
    },
    {
      username: "user9",
      email: "user9@example.com",
      password_hash: "hashedpassword9",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket9",
    },
    {
      username: "user10",
      email: "user10@example.com",
      password_hash: "hashedpassword10",
      phone: "1234567899",
      role: "student",
      socket_id: "socket10",
    },
    {
      username: "user11",
      email: "user11@example.com",
      password_hash: "hashedpassword11",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket11",
    },
    {
      username: "user12",
      email: "user12@example.com",
      password_hash: "hashedpassword12",
      phone: "1234567891",
      role: "student",
      socket_id: "socket12",
    },
    {
      username: "user13",
      email: "user13@example.com",
      password_hash: "hashedpassword13",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket13",
    },
    {
      username: "user14",
      email: "user14@example.com",
      password_hash: "hashedpassword14",
      phone: "1234567893",
      role: "student",
      socket_id: "socket14",
    },
    {
      username: "user15",
      email: "user15@example.com",
      password_hash: "hashedpassword15",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket15",
    },
    {
      username: "user16",
      email: "user16@example.com",
      password_hash: "hashedpassword16",
      phone: "1234567895",
      role: "student",
      socket_id: "socket16",
    },
    {
      username: "user17",
      email: "user17@example.com",
      password_hash: "hashedpassword17",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket17",
    },
    {
      username: "user18",
      email: "user18@example.com",
      password_hash: "hashedpassword18",
      phone: "1234567897",
      role: "student",
      socket_id: "socket18",
    },
    {
      username: "user19",
      email: "user19@example.com",
      password_hash: "hashedpassword19",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket19",
    },
    {
      username: "user20",
      email: "user20@example.com",
      password_hash: "hashedpassword20",
      phone: "1234567899",
      role: "student",
      socket_id: "socket20",
    },
    {
      username: "user21",
      email: "user21@example.com",
      password_hash: "hashedpassword21",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket21",
    },
    {
      username: "user22",
      email: "user22@example.com",
      password_hash: "hashedpassword22",
      phone: "1234567891",
      role: "student",
      socket_id: "socket22",
    },
    {
      username: "user23",
      email: "user23@example.com",
      password_hash: "hashedpassword23",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket23",
    },
    {
      username: "user24",
      email: "user24@example.com",
      password_hash: "hashedpassword24",
      phone: "1234567893",
      role: "student",
      socket_id: "socket24",
    },
    {
      username: "user25",
      email: "user25@example.com",
      password_hash: "hashedpassword25",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket25",
    },
    {
      username: "user26",
      email: "user26@example.com",
      password_hash: "hashedpassword26",
      phone: "1234567895",
      role: "student",
      socket_id: "socket26",
    },
    {
      username: "user27",
      email: "user27@example.com",
      password_hash: "hashedpassword27",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket27",
    },
    {
      username: "user28",
      email: "user28@example.com",
      password_hash: "hashedpassword28",
      phone: "1234567897",
      role: "student",
      socket_id: "socket28",
    },
    {
      username: "user29",
      email: "user29@example.com",
      password_hash: "hashedpassword29",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket29",
    },
    {
      username: "user30",
      email: "user30@example.com",
      password_hash: "hashedpassword30",
      phone: "1234567899",
      role: "student",
      socket_id: "socket30",
    },
    {
      username: "user31",
      email: "user31@example.com",
      password_hash: "hashedpassword31",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket31",
    },
    {
      username: "user32",
      email: "user32@example.com",
      password_hash: "hashedpassword32",
      phone: "1234567891",
      role: "student",
      socket_id: "socket32",
    },
    {
      username: "user33",
      email: "user33@example.com",
      password_hash: "hashedpassword33",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket33",
    },
    {
      username: "user34",
      email: "user34@example.com",
      password_hash: "hashedpassword34",
      phone: "1234567893",
      role: "student",
      socket_id: "socket34",
    },
    {
      username: "user35",
      email: "user35@example.com",
      password_hash: "hashedpassword35",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket35",
    },
    {
      username: "user36",
      email: "user36@example.com",
      password_hash: "hashedpassword36",
      phone: "1234567895",
      role: "student",
      socket_id: "socket36",
    },
    {
      username: "user37",
      email: "user37@example.com",
      password_hash: "hashedpassword37",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket37",
    },
    {
      username: "user38",
      email: "user38@example.com",
      password_hash: "hashedpassword38",
      phone: "1234567897",
      role: "student",
      socket_id: "socket38",
    },
    {
      username: "user39",
      email: "user39@example.com",
      password_hash: "hashedpassword39",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket39",
    },
    {
      username: "user40",
      email: "user40@example.com",
      password_hash: "hashedpassword40",
      phone: "1234567899",
      role: "student",
      socket_id: "socket40",
    },
    {
      username: "user41",
      email: "user41@example.com",
      password_hash: "hashedpassword41",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket41",
    },
    {
      username: "user42",
      email: "user42@example.com",
      password_hash: "hashedpassword42",
      phone: "1234567891",
      role: "student",
      socket_id: "socket42",
    },
    {
      username: "user43",
      email: "user43@example.com",
      password_hash: "hashedpassword43",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket43",
    },
    {
      username: "user44",
      email: "user44@example.com",
      password_hash: "hashedpassword44",
      phone: "1234567893",
      role: "student",
      socket_id: "socket44",
    },
    {
      username: "user45",
      email: "user45@example.com",
      password_hash: "hashedpassword45",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket45",
    },
    {
      username: "user46",
      email: "user46@example.com",
      password_hash: "hashedpassword46",
      phone: "1234567895",
      role: "student",
      socket_id: "socket46",
    },
    {
      username: "user47",
      email: "user47@example.com",
      password_hash: "hashedpassword47",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket47",
    },
    {
      username: "user48",
      email: "user48@example.com",
      password_hash: "hashedpassword48",
      phone: "1234567897",
      role: "student",
      socket_id: "socket48",
    },
    {
      username: "user49",
      email: "user49@example.com",
      password_hash: "hashedpassword49",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket49",
    },
    {
      username: "user50",
      email: "user50@example.com",
      password_hash: "hashedpassword50",
      phone: "1234567899",
      role: "student",
      socket_id: "socket50",
    },
    {
      username: "user51",
      email: "user51@example.com",
      password_hash: "hashedpassword51",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket51",
    },
    {
      username: "user52",
      email: "user52@example.com",
      password_hash: "hashedpassword52",
      phone: "1234567891",
      role: "student",
      socket_id: "socket52",
    },
    {
      username: "user53",
      email: "user53@example.com",
      password_hash: "hashedpassword53",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket53",
    },
    {
      username: "user54",
      email: "user54@example.com",
      password_hash: "hashedpassword54",
      phone: "1234567893",
      role: "student",
      socket_id: "socket54",
    },
    {
      username: "user55",
      email: "user55@example.com",
      password_hash: "hashedpassword55",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket55",
    },
    {
      username: "user56",
      email: "user56@example.com",
      password_hash: "hashedpassword56",
      phone: "1234567895",
      role: "student",
      socket_id: "socket56",
    },
    {
      username: "user57",
      email: "user57@example.com",
      password_hash: "hashedpassword57",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket57",
    },
    {
      username: "user58",
      email: "user58@example.com",
      password_hash: "hashedpassword58",
      phone: "1234567897",
      role: "student",
      socket_id: "socket58",
    },
    {
      username: "user59",
      email: "user59@example.com",
      password_hash: "hashedpassword59",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket59",
    },
    {
      username: "user60",
      email: "user60@example.com",
      password_hash: "hashedpassword60",
      phone: "1234567899",
      role: "student",
      socket_id: "socket60",
    },
    {
      username: "user61",
      email: "user61@example.com",
      password_hash: "hashedpassword61",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket61",
    },
    {
      username: "user62",
      email: "user62@example.com",
      password_hash: "hashedpassword62",
      phone: "1234567891",
      role: "student",
      socket_id: "socket62",
    },
    {
      username: "user63",
      email: "user63@example.com",
      password_hash: "hashedpassword63",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket63",
    },
    {
      username: "user64",
      email: "user64@example.com",
      password_hash: "hashedpassword64",
      phone: "1234567893",
      role: "student",
      socket_id: "socket64",
    },
    {
      username: "user65",
      email: "user65@example.com",
      password_hash: "hashedpassword65",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket65",
    },
    {
      username: "user66",
      email: "user66@example.com",
      password_hash: "hashedpassword66",
      phone: "1234567895",
      role: "student",
      socket_id: "socket66",
    },
    {
      username: "user67",
      email: "user67@example.com",
      password_hash: "hashedpassword67",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket67",
    },
    {
      username: "user68",
      email: "user68@example.com",
      password_hash: "hashedpassword68",
      phone: "1234567897",
      role: "student",
      socket_id: "socket68",
    },
    {
      username: "user69",
      email: "user69@example.com",
      password_hash: "hashedpassword69",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket69",
    },
    {
      username: "user70",
      email: "user70@example.com",
      password_hash: "hashedpassword70",
      phone: "1234567899",
      role: "student",
      socket_id: "socket70",
    },
    {
      username: "user71",
      email: "user71@example.com",
      password_hash: "hashedpassword71",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket71",
    },
    {
      username: "user72",
      email: "user72@example.com",
      password_hash: "hashedpassword72",
      phone: "1234567891",
      role: "student",
      socket_id: "socket72",
    },
    {
      username: "user73",
      email: "user73@example.com",
      password_hash: "hashedpassword73",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket73",
    },
    {
      username: "user74",
      email: "user74@example.com",
      password_hash: "hashedpassword74",
      phone: "1234567893",
      role: "student",
      socket_id: "socket74",
    },
    {
      username: "user75",
      email: "user75@example.com",
      password_hash: "hashedpassword75",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket75",
    },
    {
      username: "user76",
      email: "user76@example.com",
      password_hash: "hashedpassword76",
      phone: "1234567895",
      role: "student",
      socket_id: "socket76",
    },
    {
      username: "user77",
      email: "user77@example.com",
      password_hash: "hashedpassword77",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket77",
    },
    {
      username: "user78",
      email: "user78@example.com",
      password_hash: "hashedpassword78",
      phone: "1234567897",
      role: "student",
      socket_id: "socket78",
    },
    {
      username: "user79",
      email: "user79@example.com",
      password_hash: "hashedpassword79",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket79",
    },
    {
      username: "user80",
      email: "user80@example.com",
      password_hash: "hashedpassword80",
      phone: "1234567899",
      role: "student",
      socket_id: "socket80",
    },
    {
      username: "user81",
      email: "user81@example.com",
      password_hash: "hashedpassword81",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket81",
    },
    {
      username: "user82",
      email: "user82@example.com",
      password_hash: "hashedpassword82",
      phone: "1234567891",
      role: "student",
      socket_id: "socket82",
    },
    {
      username: "user83",
      email: "user83@example.com",
      password_hash: "hashedpassword83",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket83",
    },
    {
      username: "user84",
      email: "user84@example.com",
      password_hash: "hashedpassword84",
      phone: "1234567893",
      role: "student",
      socket_id: "socket84",
    },
    {
      username: "user85",
      email: "user85@example.com",
      password_hash: "hashedpassword85",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket85",
    },
    {
      username: "user86",
      email: "user86@example.com",
      password_hash: "hashedpassword86",
      phone: "1234567895",
      role: "student",
      socket_id: "socket86",
    },
    {
      username: "user87",
      email: "user87@example.com",
      password_hash: "hashedpassword87",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket87",
    },
    {
      username: "user88",
      email: "user88@example.com",
      password_hash: "hashedpassword88",
      phone: "1234567897",
      role: "student",
      socket_id: "socket88",
    },
    {
      username: "user89",
      email: "user89@example.com",
      password_hash: "hashedpassword89",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket89",
    },
    {
      username: "user90",
      email: "user90@example.com",
      password_hash: "hashedpassword90",
      phone: "1234567899",
      role: "student",
      socket_id: "socket90",
    },
    {
      username: "user91",
      email: "user91@example.com",
      password_hash: "hashedpassword91",
      phone: "1234567890",
      role: "admin",
      socket_id: "socket91",
    },
    {
      username: "user92",
      email: "user92@example.com",
      password_hash: "hashedpassword92",
      phone: "1234567891",
      role: "student",
      socket_id: "socket92",
    },
    {
      username: "user93",
      email: "user93@example.com",
      password_hash: "hashedpassword93",
      phone: "1234567892",
      role: "admin",
      socket_id: "socket93",
    },
    {
      username: "user94",
      email: "user94@example.com",
      password_hash: "hashedpassword94",
      phone: "1234567893",
      role: "student",
      socket_id: "socket94",
    },
    {
      username: "user95",
      email: "user95@example.com",
      password_hash: "hashedpassword95",
      phone: "1234567894",
      role: "admin",
      socket_id: "socket95",
    },
    {
      username: "user96",
      email: "user96@example.com",
      password_hash: "hashedpassword96",
      phone: "1234567895",
      role: "student",
      socket_id: "socket96",
    },
    {
      username: "user97",
      email: "user97@example.com",
      password_hash: "hashedpassword97",
      phone: "1234567896",
      role: "admin",
      socket_id: "socket97",
    },
    {
      username: "user98",
      email: "user98@example.com",
      password_hash: "hashedpassword98",
      phone: "1234567897",
      role: "student",
      socket_id: "socket98",
    },
    {
      username: "user99",
      email: "user99@example.com",
      password_hash: "hashedpassword99",
      phone: "1234567898",
      role: "admin",
      socket_id: "socket99",
    },
    {
      username: "user100",
      email: "user100@example.com",
      password_hash: "hashedpassword100",
      phone: "1234567899",
      role: "student",
      socket_id: "socket100",
    },
  ],
];

async function hashPassword(password) {
  const hashedPass = await bcrypt.hash(password, 10);
  return hashedPass;
}

const deleteUsers = async () => {
  const query = "DELETE FROM users";
  await pool.query(query);
};
// deleteUsers();
const createUser = async (username, password, email, role) => {
  const hashedPass = await hashPassword(password);
  const query = `
      INSERT INTO users (username, password_hash, email, role)
      VALUES ($1, $2, $3, $4);
  `;
  const values = [username, hashedPass, email, role];
  await pool.query(query, values);
}

// createUser('admin', 'Password#1', 'admin@uman.edu.mx', 'admin');

// insertUser('admin', hashingpass, 'admin@uman.edu.mx', 'admin');
// insertUser('cristian', 'password', 'adaksjdjkasdkja@gmail.com', 'admin');
// insertUser('user', 'password', 'user@example.com', 'student');
// usersData[0].forEach(user => insertUser(user.username, user.password_hash, user.email, user.role));
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
