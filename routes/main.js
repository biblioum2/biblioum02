const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const {
  getAuthors,
  getYears,
  getBooksTotal,
  getBookLiveSearch,
  getBooks,
  getUsers,
  getUserLiveSearch,
  getAllCategories,
  getBookDetailsById,
  getBooksByCategory,
  getBooksTotalFilter,
  getBooksCount,
} = require("../queries/getData");
const { deleteUser } = require("../queries/deleteData");
router.use(cookieParser());

// Ruta para formulario login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    username: undefined,
    authErrorName: false,
    authErrorPassword: false,
  });
});

router.get("/test", async (req, res) => {
  const { category, title, author, year, offset } = req.query;
  const filters = {
    category: category === "null" ? null : category,
    author: author === "null" ? null : author,
    year: year === "null" ? null : year,
    limit: 20,
    offset: parseInt(offset),
  };
  // console.log('filtros desde ruta:', filters);

  try {
    const data = await getBooksTotalFilter(filters);
    // const json= JSON.stringify(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authToken"); // Borra la cookie 'authToken'
  res.clearCookie("isAdmin");
  res.clearCookie("username");
  res.clearCookie("email");
  res.redirect("/login");
});

// Ruta para la página principal

router.get("/pages", async (req, res) => {
  const { category, title, author, year } = req.query;
  const filters = {
    category: category,
    title: title,
    author: author,
    year: year,
  };

  // console.log("valor de year desde servidor", filters);

  try {
    const totalBooks = await getBooksCount(filters);
    // console.log(`enviando datos al cliente`, totalBooks);

    res.status(200).json(totalBooks);
  } catch (error) {
    console.log(error);
  }
});

router.get("/", async (req, res) => {
  const user = req.session.user;
  const authToken = req.cookies.authToken ? true : false;
  const isAdmin = req.cookies.isAdmin ? true : false;
  const username = req.cookies.username;
  const email = req.cookies.email;
  const categories = await getAllCategories();
  const pagination = await getBooksTotal();
  const years = await getYears();
  const authors = await getAuthors();
  // console.log(years);
  // console.log(authors);
  const currentPage = 1;
  // console.log(`Este es el numero de paginas: ${pagination.pagination}`);

  const sliderImgs = {
    slider1: "img/sliders/imagen1.jpg",
    slider2: "img/sliders/imagen2.jpg",
    slider3: "img/sliders/imagen3.jpg",
    slider4: "img/sliders/imagen4.jpg",
  };
  let offset = 0;
  const filters = {
    category: null,
    title: null,
    author: null,
    year: null,
    limit: 20,
    offset: offset,
  };
  try {
    const books = await getBooksTotalFilter(filters);
    // const booksjson = JSON.stringify(books);
    // console.log('libros desde ruta main', books);

    //  console.log(`Esto es el resultado en main books: ${booksjson}`);
    res.render("main", {
      years: years,
      authors: authors,
      currentPage: currentPage,
      pagination: pagination.pagination,
      totalBooks: pagination.totalBooks,
      offset: offset,
      categories: categories,
      title: "Página de Inicio",
      sliderImgs: sliderImgs,
      books: books,
      authToken: authToken,
      isAdmin: isAdmin,
      user: user,
    });
  } catch (error) {
    console.log(`Error al consultar`, error);
    res.status(500).send("Error al obtener los libros main");
  }
});

router.get("/book", async (req, res) => {
  const user = req.session.user;
  const authToken = req.cookies.authToken ? true : false;
  const isAdmin = req.cookies.isAdmin ? true : false;
  const idBook = req.query.id;
  const data = await getBookDetailsById(idBook);
  //  console.log(data);

  res.render("book", {
    bookData: data,
    title: data.title,
    currentPage: "book",
    user: user,
    isAdmin: isAdmin,
    authToken: authToken,
  });
});

router.get("/page/:id", async (req, res) => {
  const booksOffset = req.params.id;
  try {
    const pageBooks = await getBooks(20, booksOffset);
    res.status(200).json(pageBooks);
  } catch (error) {
    console.log("error en la ruta page/id", error);
  }
});
// OBTENER LIBROS POR CATEGORIA

router.get("/category/:catId", async (req, res) => {
  const categoryId = req.params.catId;

  try {
    console.log("Ejecutando la query catid", categoryId);

    const books = await getBooksByCategory(categoryId);
    // console.log(`esto hay en books desde route`, books);

    res.status(200).json({ books: books });
  } catch (error) {
    console.log("error al obtener libros por categorias", error);
  }
});

router.get("/admin", (req, res) => {
  const isAdmin = req.cookies.isAdmin;
  if (isAdmin) {
    res.render("admin", { title: "admin", currentPage: "admin" });
  } else {
    res.redirect("/");
  }
});

router.get("/admin/users", async (req, res) => {
  let users = await getUsers(0);
  let success =
    req.query.success === "true"
      ? true
      : req.query.success === "false"
      ? false
      : undefined;
  const errors = req.session.errors || {};
  req.session.errors = {};
  res.render("users", {
    title: "users",
    users: users,
    currentPage: "users",
    success: success,
    errors: errors,
    postResponse: false,
  });
});

// Otras rutas básicas pueden ir aquí
router.get("/admin/users/success", async (req, res) => {
  // res.render('users', { title: 'users', users: users, currentPage: 'users', success: true });
  res.redirect(`/admin/users?success=true`);
});
router.get("/admin/users/failed", async (req, res) => {
  const users = await getUsers(0);
  // res.render('users', { title: 'users', users: users, currentPage: 'users', success: true });
  res.redirect(`/admin/users?success=false`);
});

router.get("/admin/users/data", async (req, res) => {
  const users = await getUsers(0);
  res.json(users);
});

router.get("/admin/user/data", async (req, res) => {
  const term = req.query.term || "";
  console.log(`Este es el term ${term}`);
  const users = await getUserLiveSearch(term);
  res.json(users);
});

// RUTA PARA BUSCADOR DE LIBROS POR NOMBRE
router.get("/book/name", async (req, res) => {
  const term = req.query.term || "";
  // console.log(`Este es el term ${term}`);
  const book = await getBookLiveSearch(term);
  res.status(200).json(book);
});

router.delete("/admin/users/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("ID a eliminar:", userId);
  try {
    const result = await deleteUser(userId);
    console.log("Resultado de deleteUser:", result); // Verifica el resultado

    if (result.rowCount > 0) {
      console.log("Usuario eliminado exitosamente");
      return res.status(200).json({ success: true });
    } else {
      console.log("No se encontró el usuario para eliminar");
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error del servidor." });
  }
});

router.get("/admin/books", async (req, res) => {
  const categories = await getAllCategories();
  const success = req.query.success === "true";

  console.log("categorias", categories);
  res.render("books", {
    categories: categories,
    title: "libros",
    currentPage: "books",
    success: success,
    postResponse: false,
  });
});

router.get("/admin/books/success", async (req, res) => {
  // const categories = await getAllCategories();

  // res.render('books', { title: 'books', categories: categories ,currentPage: 'books', success: true, postResponse: false });
  res.redirect(`/admin/books?success=true`);
});


router.get("/admin/orders", (req, res) => {
  res.render("orders", { currentPage: 'orders' })
})

module.exports = router;
