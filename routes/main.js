const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/database");
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
  getFilteredOrders,
  getUser,
  getRatingByUserAndBook,
  getTopRatedBooksByCategory,
  getCategoryById,
  getTotalUsers,
} = require("../queries/getData");
const { deleteUser, deleteOrder } = require("../queries/deleteData");
const { updateOrder, updateOrderStatus, updateUserData } = require("../queries/updateData");
const { addOrUpdateRating } = require("../queries/inputData");
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
  console.log('filtros desde ruta:', filters);
  
  // console.log('filtros desde ruta:', filters);

  try {
    const data = await getBooksTotalFilter(filters);
    console.log(data);
    
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
  res.clearCookie("userId");
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

  const authToken = req.cookies.authToken ? true : false;
  const isAdmin = req.cookies.isAdmin ? true : false;
  const userId = req.cookies.userId ? req.cookies.userId : '0';
  console.log('id desde main con cookies',userId);
  const user = userId !== 0 ? await getUser('null', parseInt(userId)) : null;
  const orders = await getFilteredOrders({user_id: userId, status:'Pendiente' });

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
    const resultF = await getBooksTotalFilter(filters);
    const resultS = await getTopRatedBooksByCategory();
    const books = {
      all: resultF,
      topRated: resultS,
    }
    // console.table(resultS);
    
    
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
      user: user[0],
      orders: orders,
    });
  } catch (error) {
    console.log(`Error al consultar`, error);
    res.status(500).send("Error al obtener los libros main");
  }
});

router.get("/book", async (req, res) => {
  // console.log('datos de req book', req);
  
  const authToken = req.cookies.authToken ? true : false;
  const isAdmin = req.cookies.isAdmin ? true : false;
  const userId = req.cookies.userId ? parseInt(req.cookies.userId) : 0;
  const user = await getUser('null', parseInt(userId));
  console.log('user desde servidor book: ', user);
  console.log('id desde book: ', userId);
  const orders = await getFilteredOrders({user_id: userId, status:'Pendiente' });
  console.table(orders);
  
  const idBook = req.query.id;
  const data = await getBookDetailsById(idBook);
  let rating = 0;
  if (userId !== 0) {
    rating = await getRatingByUserAndBook(userId, idBook);
  }

  //  console.log(data);
  res.render("book", {
    bookData: data,
    title: data.title,
    currentPage: "book",
    user: user[0],
    userId: userId,
    isAdmin: isAdmin,
    authToken: authToken,
    orders: orders,
    rating: rating,
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
  console.log("success", success);
  

  const usersAll = await getTotalUsers();
  console.log('usuarios',usersAll);
  const paginationAll = Math.ceil(parseInt(usersAll.total) / 10);
  const totalUsers = parseInt(usersAll.total);

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
});

router.get("/admin/users/data", async (req, res) => {
  console.log("Ejecutando la ruta offset");
  const offset = req.query.offset;
  console.log("offset desde ruta", offset);
  
  const users = await getUsers(offset);
  res.status(200).json(users);
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

router.get("/updateOrders", async (req, res) => {
  console.log('Ejecutando la ruta update orders');
  
  let {status} = req.query;
  
  status = status ? status : 'Pendiente';
  const isAdmin = req.cookies.isAdmin ? true : false;

  try {
    const data = await getFilteredOrders({status: status});
    // console.table(data);
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      // Cambia el formato aquí según tus necesidades
      return date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });
  };
  const formattedData = data.map(item => ({
    ...item, // Mantiene las demás propiedades del objeto
    loan_date: item.loan_date, // Formatea loan_date
    return_date: item.return_date // Formatea return_date
}));
// console.log('asdkaskdaklakldakldaklkldasklda',formattedData);
    if (isAdmin) {
      res.status(200).json({ data: formattedData });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log('Error en fetch orders',error);
  }
  
});



router.get("/admin/orders", async (req, res) => {
  const idUser = req.cookies.userId;
  const isAdmin = req.cookies.isAdmin;
  try {
    const data = await getFilteredOrders({status: 'Pendiente'});
    // console.table(data);
  //   const formatDate = (dateString) => {
  //     const date = new Date(dateString);
  //     // Cambia el formato aquí según tus necesidades
  //     return date.toLocaleDateString('es-MX', {
  //         day: '2-digit',
  //         month: '2-digit',
  //         year: 'numeric'
  //     });
  // };
  const formattedData = data.map(item => ({
    ...item, // Mantiene las demás propiedades del objeto
    loan_date: item.loan_date, // Formatea loan_date
    return_date: item.return_date// Formatea return_date
}));
// console.table(formattedData);
    if (isAdmin) {
      res.render("orders", { title: "orders", currentPage: "orders", data: formattedData, userId: idUser });
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
  
  // // const formatedLoanDate = formatDate(loanDate);
  // // const formatedReturnDate = formatDate(returnDate);
  // console.log('Fechas formateadas: ', formatedLoanDate, formatedReturnDate);
  
console.log('Datos desde el servidor: ',orderId,loanDate,returnDate);


  try {
    await pool.query('BEGIN');
    await updateOrder(orderId, loanDate, returnDate);
    // await updateOrderStatus(orderId, status);
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
  const { name, email, password, role } = req.body; // Obtiene los datos del formulario
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const response = await updateUserData(userId, name, email, hashedPassword, role);
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
  // console.log(paginationAll);
  res.status(200).json(users);
});

module.exports = router;
