require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
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
  getFilteredOrders,
  getUser,
  getRatingByUserAndBook,
  getTopRatedBooksByCategory,
  getCategoryById,
  getTotalUsers,
  checkFavoriteBook,
  getFavoriteBooks,
} = require("../queries/getData");
const { deleteUser, deleteOrder } = require("../queries/deleteData");
const { updateOrder, updateOrderStatus, updateUserData } = require("../queries/updateData");
const { addOrUpdateRating } = require("../queries/inputData");
router.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
};

const SECRET_KEY = process.env.SECRET_KEY;

function validateJwt(req, res, next) {
  console.log('Ejecutando validacion de token');
  
  const token = req.cookies.token;
  console.log('token', token);
  
  if (!token) {
    console.log('No hay token');
    
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Error en token');
      
      return res.redirect("/login");
    }
    req.user = user;
    next();
  });
}

router.get("/payloadXtract", validateJwt, (req, res) => {
  const user = req.user;
  console.log('user desde payloadXtract', user);
  
  res.status(200).json(user);
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    username: undefined,
    authErrorName: false,
    authErrorPassword: false,
  });
});

router.get("/register", (req, res) => {
  errors = undefined;
  res.render("register", { title: "register", errors: errors });
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
  

  try {
    const data = await getBooksTotalFilter(filters);
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("userId");
  res.redirect("/login");
});

router.get("/pages", async (req, res) => {
  const { category, title, author, year } = req.query;
  const filters = {
    category: category,
    title: title,
    author: author,
    year: year,
  };

  

  try {
    const totalBooks = await getBooksCount(filters);

    res.status(200).json(totalBooks);
  } catch (error) {
    console.log(error);
  }
});

router.get("/uman", async (req, res) => {
  res.render("index", { title: "index" });
});

router.get("/", validateJwt, async (req, res) => {
  const user = req.user;
  const orders = await getFilteredOrders({user_id: user.id, status:'Pendiente' });
  console.log('user desde servidor main: ', user);

  const categories = await getAllCategories();
  const pagination = await getBooksTotal();
  const years = await getYears();
  const authors = await getAuthors();
 
  const currentPage = 1;

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
    const resultF = await getBooksTotalFilter(filters);
    const resultS = await getTopRatedBooksByCategory();
    const books = {
      all: resultF,
      topRated: resultS,
    }
    
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
      user: user,
      orders: orders,
    });
  } catch (error) {
    console.log(`Error al consultar`, error);
    res.status(500).send("Error al obtener los libros main");
  }
});

router.get("/book", validateJwt, async (req, res) => {
  const user = req.user;
  if (!user) {
    console.log('No hay usuario logueado');
    res.redirect('/login');
  }

  const orders = await getFilteredOrders({user_id: user.id, status:'Pendiente' });
  const idBook = req.query.id;
  const isFavoriteBook = await checkFavoriteBook(user.id, idBook);
  console.log('EL LIBRO ES FAVORITO?',isFavoriteBook);
  
  const data = await getBookDetailsById(idBook);
  let rating = 0;
  if (user.id) {
    rating = await getRatingByUserAndBook(user.id, idBook);
  }
  res.render("book", {
    bookData: data,
    title: data.title,
    currentPage: "book",
    user: user,
    orders: orders,
    rating: rating,
    isFavoriteBook: isFavoriteBook === 1 ? true : false,
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

router.get("/category/:catId", async (req, res) => {
  const categoryId = req.params.catId;

  try {
    console.log("Ejecutando la query catid", categoryId);

    const books = await getBooksByCategory(categoryId);
    res.status(200).json({ books: books });
  } catch (error) {
    console.log("error al obtener libros por categorias", error);
  }
});

router.get("/admin/users", validateJwt, async (req, res) => {
  const user = req.user;
  if (!user.id) {
    console.log('No hay usuario logueado');
    res.redirect('/login');
  }
  let users = await getUsers(0);
  let success =
    req.query.success === "true"
      ? true
      : req.query.success === "false"
      ? false
      : undefined;
  const errors = req.session.errors || {};
  req.session.errors = {};
  console.log("success", success);
  

  const usersAll = await getTotalUsers();
  console.log('usuarios',usersAll);
  const paginationAll = Math.ceil(parseInt(usersAll.total) / 10);
  const totalUsers = parseInt(usersAll.total);

  if (user.role === 'admin') {
    res.render("users", {
      title: "users",
      users: users,
      currentPage: "users",
      pagination: paginationAll,
      totalUsers: totalUsers,
      currentPage: 1,
      success: success,
      errors: errors,
      postResponse: false,
    });
  } else {
    res.redirect("/");
  }

  
});

router.get("/admin/users/data", async (req, res) => {
  console.log("Ejecutando la ruta offset");
  const offset = req.query.offset;
  console.log("offset desde ruta", offset);
  
  const users = await getUsers(offset);
  res.status(200).json(users);
});

router.get("/admin/users/success", async (req, res) => {
  res.redirect(`/admin/users?success=true`);
});
router.get("/admin/users/failed", async (req, res) => {
  const users = await getUsers(0);
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

router.get("/book/name", async (req, res) => {
  const term = req.query.term || "";
  const book = await getBookLiveSearch(term);
  res.status(200).json(book);
});

router.delete("/admin/users/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("ID a eliminar:", userId);
  try {
    const result = await deleteUser(userId);
    console.log("Resultado de deleteUser:", result);

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

router.get("/admin/books", validateJwt, async (req, res) => {
  const user = req.user;
  if (!user) {
    console.log('No hay usuario logueado');
    res.redirect('/login');
  }
  const categories = await getAllCategories();
  const success = req.query.success === "true";
  console.log("categorias", categories);

  if (user.role === 'admin') {
    res.render("books", {
      categories: categories,
      title: "libros",
      currentPage: "books",
      success: success,
      postResponse: false,
    });
    
  } else {
    res.redirect("/");
  }

 
});

router.get("/admin/books/success", async (req, res) => {
  res.redirect(`/admin/books?success=true`);
});

router.get("/updateOrders", validateJwt, async (req, res) => {
  console.log('Ejecutando la ruta update orders');
  const user = req.user;
  let {status} = req.query;
  console.log('Status desde ruta', status);
  
  status = status ? status : 'Pendiente';
  

  try {
    const data = await getFilteredOrders({status: status});
    const formattedData = data.map(item => ({
    ...item,
    loan_date: item.loan_date,
    return_date: item.return_date,
}));
    if (user.role === 'admin') {
      res.status(200).json({ data: formattedData });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log('Error en fetch orders',error);
  }
  
});



router.get("/admin/orders", validateJwt, async (req, res) => {
  const user = req.user;
  

  try {
    const data = await getFilteredOrders({status: 'Pendiente'});
  const formattedData = data.map(item => ({
    ...item,
    loan_date: item.loan_date,
    return_date: item.return_date,
}));
    if (user.role === 'admin') {
      res.render("orders", { title: "orders", currentPage: "orders", data: formattedData, userId: user.id });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log('Error en fetch orders',error);
  }
});

router.get("/updateOrderRow", async (req, res) => {
  const { orderId, loanDate, returnDate } = req.query;
  console.log('Fechas no formateadas: ', loanDate, returnDate);


  try {
    await pool.query('BEGIN');
    await updateOrder(orderId, loanDate, returnDate);
    await pool.query('COMMIT');
    res.status(200).json({success: true});
  } catch (err) {
    await pool.query('ROLLBACK');
    console.log('Error al aztualizar registros en ordenes',err);
    res.status(400).json({success: false});
  }
});

router.delete("/deleteOrder", async (req, res) => {
  const {orderId} = req.body;
  const formatOrderId = parseInt(orderId);
  try {
    await pool.query('BEGIN');
    const response = await deleteOrder(formatOrderId);
    await pool.query('COMMIT');
    res.status(200).json({success: true, response: response});
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al borrar orden',error);
    res.status(400).json({success: false});
  }
});

router.get("/getorders", async (req, res) => {
  const { 
    user_id = undefined,
    book_id = undefined,
    loan_date = undefined,
    return_date = undefined,
    status = undefined
  } = req.query;
  try {
    const result = await getFilteredOrders({user_id, book_id, loan_date, return_date, status});
    const data = await JSON.stringify(result);
    console.log(data);
    
    
    res.status(200).json({response: result, success: true});
  } catch (error) {
    console.log('Error al obtener ordenes /getorders', error);
    res.status(400).json({success: false});
  }
});

router.post("/updateRatingBook", async (req, res) => {
  let { userId, bookId, score } = req.body;

  userId = userId ? parseInt(userId) : null;
  bookId = bookId ? parseInt(bookId) : null;
  score = score ? parseInt(score) : null;

  try {
    console.log('VALORES EN SERVIDOR: ', userId, bookId, score);
    
    const response = await addOrUpdateRating(userId, bookId, score);
    res.status(200).json({success:true, message:'Puntuacion asignada con exito!'});
  } catch (error) {
    console.log(error);
    res.status(400).json({success: false});
  }
});

router.get("/getRatingBook", async (req, res) => {
  const { userId, bookId } = req.query;
  try {
    const response = await getRatingByUserAndBook(userId, bookId);
    res.status(200).json({success:true, response: response});
  } catch (error) {
    console.log(error);
    res.status(400).json({success: false});
  }
});

router.get("/getTopRatedBooks", async (req, res) => {
  const { category } = req.query;
  console.log('Categoria desde servidor', category);
  
  try {
    const categoryResponse = await getCategoryById(parseInt(category));
    console.log('Respuesta de categoria', categoryResponse);
    const categoryName = categoryResponse.name;
    const response = await getTopRatedBooksByCategory(categoryName);
    res.status(200).json({success:true, response: response});
  } catch (error) {
    console.log(error);
    res.status(400).json({success: false});
  }
});

router.patch("/admin/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, role } = req.body;
  const saltRounds = 10;
  console.log("Datos desde el servidor", userId, name, email, password, role);
  
  let hashedPassword = undefined;
  
  console.log("Contraseña encriptada", hashedPassword);
  
  try {
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }
    const response = await updateUserData(userId, {name, email, password:hashedPassword, role});
    res.status(200).json({ success: true, response: response });
  } catch (error) {
    console.log("Error al actualizar usuario", error);
    res.status(400).json({ success: false });
  }
});

router.get("/admin/users/total", async (req, res) => {
  const users = await getTotalUsers();
  console.log(users);
  const paginationAll = Math.ceil(parseInt(users.total) / 10);
  const totalUsers = parseInt(users.total);
  res.status(200).json(users);
});

router.get("/getFavoriteBooks", validateJwt , async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await getFavoriteBooks(userId);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    
  }
});

module.exports = router;
