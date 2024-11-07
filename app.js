require("dotenv").config();
// Carga las variables de entorno desde un archivo .env en process.env para que estén disponibles en la aplicación.
const express = require("express");
// Importa Express, un framework para Node.js que facilita la creación de aplicaciones web y APIs.
const session = require("express-session");
// Importa el middleware express-session, que permite la gestión de sesiones en la aplicación, almacenando y persistiendo datos de usuario entre peticiones.
const cors = require("cors");
// Importa el middleware CORS (Cross-Origin Resource Sharing), que permite o restringe las solicitudes de recursos en el servidor desde diferentes dominios.
const bodyParser = require("body-parser");
// Importa body-parser, un middleware para analizar el cuerpo de las solicitudes HTTP, permitiendo acceder a los datos enviados en formularios o en formato JSON.
const path = require("path");
// Importa el módulo path de Node.js, que proporciona utilidades para trabajar con rutas de archivos y directorios.
const cookieParser = require("cookie-parser");
// Importa cookie-parser, un middleware que permite analizar las cookies enviadas en las solicitudes HTTP y hacerlas accesibles en `req.cookies`.
const pool = require("./config/database");
// Importa la configuración de la base de datos desde el archivo `database.js` (o el nombre que corresponda), que típicamente configura y exporta un pool de conexiones para interactuar con la base de datos.
const { Server } = require("socket.io");
const { getUser } = require("./queries/getData");
const {
  insertUser,
  insertBook,
  insertBookCategory,
  createOrder,
} = require("./queries/inputData");
const http = require("http");
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

// Configuración CORS
app.use(
  cors({
    origin: `https://biblioum02.onrender.com`, // Permite solicitudes desde tu dominio
  })
);

// Middleware para configurar CSP
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "img-src 'self' https://i.imgur.com https://drive.google.com https://res.cloudinary.com https://asset.cloudinary.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://ka-f.fontawesome.com https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com https://cdn.jsdelivr.net/npm/flatpickr; " + // Agregar Flatpickr
      "font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com; " +
      "connect-src 'self' https://kit.fontawesome.com https://ka-f.fontawesome.com; " +
      "object-src 'none';"
  );
  next();
});

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

// Configuración de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuracion de session
app.use(
  session({
    secret: "tu_secreto_aqui",
    resave: false,
    saveUninitialized: true,
  })
);

// Rutas
const indexRouter = require("./routes/main");
const { updateOrderStatus } = require("./queries/updateData");
const { sendMessageToUser } = require("./utilities/deleteCookies");
app.use("/", indexRouter);

//Uso de websocket para manejar las ordenes en tiempo real

// io.on("connection", async (socket) => {
//   console.log("Nuevo cliente conectado");
//   const userIdFromSocket = socket.handshake.query.userId;
//   console.log(userIdFromSocket);

//    pool.query('UPDATE users SET socket_id = $1 WHERE user_id = $2', [socket.id, userIdFromSocket], (err) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
    
//     console.log(`Usuario con ID ${userIdFromSocket} conectado con socket ID ${socket.id}`);
//   });

//   // ESCUCHAR Y REDIRIGIR LA ORDEN DEL CLIENTE AL ADMIN
//   socket.on("order", async (data, mensaje) => {
//     // console.log("Mensaje recibido:", mensaje);
//     const { userId, bookId, title, loanDate, returnDate } = data;
//     console.log('data desde el servidor book',data);
//     try {
//       const response = await createOrder(userId, bookId, loanDate, returnDate);
//       if(response){
//         io.emit("new order");
//       }
//     } catch (error) {
//       console.error('Error al crear la orden: ',error);
//       io.emit("create order result", {success: false});
//     }
//   });
//   // ESCUCHAR LA RESPUESTA DEL ADMIN Y ACTUALIZAR LA INFORMACION
//   socket.on("admin response", (userId) => {
//     pool.query('SELECT socket_id FROM users WHERE user_id = $1',[userId],(error, result) => {
//       if (error){
//         console.log(error);
//         return;
//       } else if (result.rows.length > 0){
//         const socketId = result.rows[0].socket_id;
//         console.log(socketId);        
//       } else {
//         console.log(`Usuario ${userId} no encontrado.`);        
//       }
//     });
//   })
// socket.on("message", async () =>{
//   sendMessageToUser();
// })
//   // Manejar la desconexión
//   socket.on("disconnect", () => {
//     console.log("Cliente desconectado");
//     pool.query('UPDATE users SET socket_id = NULL WHERE user_id = $1', [userIdFromSocket], (err) => {
//       if (err) {
//           console.error(err);
//           return;
//       }
//       console.log(`Usuario con ID ${userIdFromSocket} desconectado`);
//   });
//   });
// });


io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");
  const userIdFromSocket = socket.handshake.query.userId;
  console.log(userIdFromSocket);

  // Actualizar el socket_id del usuario en la base de datos
  pool.query('UPDATE users SET socket_id = $1 WHERE user_id = $2', [socket.id, userIdFromSocket], (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Usuario con ID ${userIdFromSocket} conectado con socket ID ${socket.id}`);
  });

  // ESCUCHAR Y REDIRIGIR LA ORDEN DEL CLIENTE AL ADMIN
  socket.on("order", async (data, mensaje) => {
    const { userId, bookId, title, loanDate, returnDate } = data;
    console.log('data desde el servidor book', data);
    try {
      const response = await createOrder(userId, bookId, loanDate, returnDate);
      if (response) {
        io.emit("new order");
      }
    } catch (error) {
      console.error('Error al crear la orden: ', error);
      io.emit("create order result", { success: false });
    }
  });

  // ESCUCHAR LA RESPUESTA DEL ADMIN Y ACTUALIZAR LA INFORMACION
  socket.on("admin response", (userId) => {
    pool.query('SELECT socket_id FROM users WHERE user_id = $1', [userId], (error, result) => {
      if (error) {
        console.log(error);
        return;
      } else if (result.rows.length > 0) {
        const socketId = result.rows[0].socket_id;
        console.log(socketId);
        // Enviar la respuesta del admin al usuario correspondiente
        io.to(socketId).emit("admin response", { userId });
      } else {
        console.log(`Usuario ${userId} no encontrado.`);
      }
    });
  });

  socket.on("message", async () => {
    sendMessageToUser();
  });

  // Manejar la desconexión
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
    pool.query('UPDATE users SET socket_id = NULL WHERE user_id = $1', [userIdFromSocket], (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Usuario con ID ${userIdFromSocket} desconectado`);
    });
  });
});

app.patch("/updateOrderStatus1", async (req, res) => {
  const {orderId, status} = req.body;
  console.log('datos desde app: ', orderId, status);
  
  try {
    const response = await updateOrderStatus(orderId, status);
    console.log('antes de redireccionar');
    res.status(200).json({success: true, response: response});
  } catch (error) {
    console.error(error);
    res.status(400).json({success: false});
  }
});

// Ruta POST para agregar un usuario con validación de datos
app.post("/admin/users", async (req, res) => {
  let { username, password, email, role } = req.body;
  username = username.trim();
  password = password.trim();
  email = email.trim();
  role = role.trim();

  // Funciones de validación
  const validateUsername = (username) => {
    const errors = [];
    const minLength = 3;
    const maxLength = 15;
    const validChars = /^[a-z0-9]+$/;

    if (username.length < minLength || username.length > maxLength) {
      errors.push(
        `El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`
      );
    }

    if (!validChars.test(username)) {
      errors.push(
        "El nombre de usuario contiene caracteres no válidos. Solo se permiten letras minúsculas y números."
      );
    }

    return {
      valid: errors.length === 0,
      error: errors,
    };
  };

  const validateEmail = (email) => {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push("El formato del correo electrónico no es válido.");
    }

    return {
      valid: errors.length === 0,
      error: errors,
    };
  };

  const validatePassword = (password) => {
    const errors = [];
    const minLength = 8;
    const maxLength = 20;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasDigit = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || password.length > maxLength) {
      errors.push(
        `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`
      );
    }

    if (!hasUpperCase.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula.");
    }

    if (!hasLowerCase.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula.");
    }

    if (!hasDigit.test(password)) {
      errors.push("La contraseña debe contener al menos un dígito.");
    }

    if (!hasSpecialChar.test(password)) {
      errors.push("La contraseña debe contener al menos un carácter especial.");
    }

    return {
      valid: errors.length === 0,
      error: errors,
    };
  };

  // Validaciones
  const usernameValidation = validateUsername(username);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  const errors = {
    username: {
      exist: false,
      valid: usernameValidation.valid,
      error: usernameValidation.error,
    },
    password: {
      exist: false,
      valid: passwordValidation.valid,
      error: passwordValidation.error,
    },
    email: {
      exist: false,
      valid: emailValidation.valid,
      error: emailValidation.error,
    },
  };

  // Consultas a la base de datos
  const emailCheck = await pool.query("SELECT 1 FROM users WHERE email = $1", [
    email,
  ]);
  const usernameCheck = await pool.query(
    "SELECT 1 FROM users WHERE username = $1",
    [username]
  );

  if (emailCheck.rowCount > 0) {
    errors.email.exist = true;
    errors.email.error.push("Correo no disponible");
  }

  if (usernameCheck.rowCount > 0) {
    errors.username.exist = true;
    errors.username.error.push("Usuario no disponible");
  }

  // Verificar si hay errores y redirigir
  if (
    errors.email.error.length > 0 ||
    errors.username.error.length > 0 ||
    errors.password.error.length > 0
  ) {
    req.session.errors = errors;
    for (let key in errors) {
      if (errors.hasOwnProperty(key)) {
        console.log(`Key: ${key}`);
        console.log(`Exist: ${errors[key].exist}`);
        console.log(`Valid: ${errors[key].valid}`);
        console.log(`Errors: ${errors[key].error.join(", ")}`); // Si `error` es un array
      }
    }

    errors.password.error.forEach((err, index) => {
      console.log(`Error de contraseña ${index + 1}: ${err}`);
    });
    return res.redirect("/admin/users/failed");
  }

  // Continuar con la lógica de procesamiento
  try {
    await insertUser(username, password, email, role);
    return res.redirect("/admin/users/success");
  } catch (error) {
    console.log("Error al agregar usuario: ", error);
    res.status(500).render("users", {
      title: "users",
      currentPage: "users",
      success: false,
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password, remember } = req.body;
  try {
    const data = await getUser(username);
    if (data.length > 0) {
      const user = data[0];
      if (user.password_hash == password) {
        // EVALUAR EL ROL DEL USUARIO
        const isAdmin = user.role == `admin` ? true : false;
        // console.log("Es admin desde app? ", isAdmin);
        const authToken = `${user.user_id}-${Math.random()
          .toString(36)
          .substring(7)}`;
        // Establecer cookie de autenticación
        const cookieOptions = {
          maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 días si se selecciona "Remember Me", 1 día si no
          httpOnly: false, // La cookie solo es accesible mediante HTTP
          sameSite: "strict", // Limita el alcance de la cookie a la misma origin
        };
        // Enviar los datos del usuario por cookies
        const username = user.username;
        const email = user.email;
        const userId = user.user_id;
        console.log("id del usuario desde inicio", userId);

        res.cookie("authToken", authToken, cookieOptions);
        res.cookie("isAdmin", isAdmin, cookieOptions);
        res.cookie("username", username, cookieOptions);
        res.cookie("email", email, cookieOptions);
        res.cookie("userId", userId, cookieOptions);
        // Enviar los datos de usuario a la session

        req.session.user = user;
        res.redirect("/");
      } else {
        res.render("login", {
          authErrorName: false,
          authErrorPassword: true,
          username: user.username,
        });
      }
    } else {
      res.render("login", {
        username: username,
        authErrorName: true,
        authErrorPassword: false,
      });
    }
  } catch (error) {
    console.log("Error al validar usuario: ", error);
  }
});

app.post("/submit/order", (req, res) => {
  alert("funciona");
});

app.post("/admin/books", async (req, res) => {
  console.log('body del cliente books', req.body);
  const {
    title,
    edition,
    author,
    category,
    publication_date,
    isbn,
    summary,
    available,
    available_copies,
    cover,
    languaje,
  } = req.body;
  console.log(`ID categoria ${category}`);
  try {
    const bookId = await insertBook({
      title,
      author,
      edition,
      isbn,
      summary,
      available,
      publication_date,
      available_copies,
      cover,
      languaje,
    });

    console.log(bookId);
    console.log(publication_date);

    await insertBookCategory(bookId, category);
    res.redirect("/admin/books/success");
  } catch (error) {
    console.log("Error al agregar libro: ", error);
  }
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en https://biblioum02.onrender.com`);
});
