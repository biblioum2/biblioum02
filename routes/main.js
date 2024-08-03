const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { getBooks, getUsers, getUserLiveSearch, getAllCategories} = require('../queries/getData');
const { deleteUser } = require('../queries/deleteData');
router.use(cookieParser());



// Ruta para formulario login
router.get('/login', (req, res) => {

    res.render('login', {
      title: 'login',
      username: undefined,
      authErrorName: false,
      authErrorPassword: false
    });
  
});

router.get('/logout', (req, res) => {
  res.clearCookie('authToken'); // Borra la cookie 'authToken'
  res.clearCookie('isAdmin');
  res.clearCookie('username');
  res.clearCookie('email');
  res.redirect('/login');
});

// Ruta para la página principal

router.get('/', async (req, res) => {

  const user = req.session.user;
  const authToken = req.cookies.authToken ? true : false;
  const isAdmin = req.cookies.isAdmin ? true : false;
  const username = req.cookies.username;
  const email = req.cookies.email;
  const categories = await getAllCategories();
  const sliderImgs = {
    slider1: 'img/sliders/imagen1.jpg',
    slider2: 'img/sliders/imagen2.jpg',
    slider3: 'img/sliders/imagen3.jpg',
    slider4: 'img/sliders/imagen4.jpg'

  }
  try {
    const books = await getBooks();
    const booksjson = JSON.stringify(books);
    console.log(`Esto es el resultado en main books: ${booksjson}`);
    res.render('main', { categories: categories, title: 'Página de Inicio', sliderImgs: sliderImgs, books: books, authToken: authToken, isAdmin: isAdmin, user: user, });
  } catch (error) {
    console.log(`Error al consultar`, error);
    res.status(500).send('Error al obtener los libros main');
  }
});

router.get('/admin', (req, res) => {
  const isAdmin = req.cookies.isAdmin;
  if (isAdmin) {
    res.render('admin', { title: 'admin', currentPage: 'admin' });
  } else {
    res.redirect('/');
  }
});

router.get('/admin/users', async (req, res) => {
  const users = await getUsers(0);
  const success = req.query.success === 'true';
  res.render('users', { title: 'users', users: users, currentPage: 'users',success: success, postResponse: false});
});

// Otras rutas básicas pueden ir aquí
router.get('/admin/users/success', async (req, res) => {
  const users = await getUsers(0);
  // res.render('users', { title: 'users', users: users, currentPage: 'users', success: true });
  res.redirect(`/admin/users?success=true`);
});

router.get('/admin/users/data', async (req, res) => {
  const users = await getUsers(0);
  res.json(users);
});

router.get('/admin/user/data', async (req, res) => {
  const term = req.query.term || '';
  console.log(`Este es el term ${term}`);
  const users = await getUserLiveSearch(term);
  res.json(users);
});

router.delete('/admin/users/:id', async (req, res) => {
  const userId = req.params.id;
  console.log('este es el id a eliminar:',userId);
  try {
      const result = await deleteUser(userId);
      if (result.rowCount > 0) {
          res.json({ success: true });
      } else {
          res.json({ success: false, message: 'Usuario no encontrado.' });
      }
  } catch (err) {
      console.error('Error al eliminar el usuario:', err);
      res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
});

router.get('/admin/books', async (req, res) => {
  const categories = await getAllCategories();
  const success = req.query.success === 'true';

  console.log('categorias',categories);
  res.render('books', { categories: categories ,title: 'libros', currentPage: 'books', success: success, postResponse: false});
});


router.get('/admin/books/success', async (req, res) => {
  // const categories = await getAllCategories();
  
  // res.render('books', { title: 'books', categories: categories ,currentPage: 'books', success: true, postResponse: false });
  res.redirect(`/admin/books?success=true`);

});
module.exports = router;
