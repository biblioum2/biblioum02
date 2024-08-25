require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const pool = require("./config/database"); // Importa la configuración de la base de datos
const { getUser } = require("./queries/getData");
const {
  insertUser,
  insertBook,
  insertBookCategory,
} = require("./queries/inputData");

const app = express();
const port = 3000;

// Configuración CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Permite solicitudes desde tu dominio
  })
);

// Middleware para configurar CSP
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "img-src 'self' https://i.imgur.com https://drive.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://ka-f.fontawesome.com; " +
      "script-src 'self' https://kit.fontawesome.com; " +
      "font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com; " +
      "connect-src 'self' https://kit.fontawesome.com https://ka-f.fontawesome.com; " +
      "object-src 'none';"
  );
  next();
});

// Middleware
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
app.use("/", indexRouter);

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
      errors.push(`El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`);
    }

    if (!validChars.test(username)) {
      errors.push("El nombre de usuario contiene caracteres no válidos. Solo se permiten letras minúsculas y números.");
    }

    return {
      valid: errors.length === 0,
      error: errors
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
      error: errors
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
      errors.push(`La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`);
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
      error: errors
    };
  };

  // Validaciones
  const usernameValidation = validateUsername(username);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  const errors = {
    username: { exist: false, valid: usernameValidation.valid, error: usernameValidation.error },
    password: { exist: false, valid: passwordValidation.valid, error: passwordValidation.error },
    email: { exist: false, valid: emailValidation.valid, error: emailValidation.error },
  };

  // Consultas a la base de datos
  const emailCheck = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  const usernameCheck = await pool.query("SELECT 1 FROM users WHERE username = $1", [username]);

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
        console.log(`Errors: ${errors[key].error.join(', ')}`); // Si `error` es un array
      }
    }
    
    errors.password.error.forEach((err, index) => {
      console.log(`Error de contraseña ${index + 1}: ${err}`);
    });
    return res.redirect("/admin/users/failed");
  };

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
    const data = await getUser(username, password);
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
          httpOnly: true, // La cookie solo es accesible mediante HTTP
          sameSite: "strict", // Limita el alcance de la cookie a la misma origin
        };
        // Enviar los datos del usuario por cookies
        const username = user.username;
        const email = user.email;

        res.cookie("authToken", authToken, cookieOptions);
        res.cookie("isAdmin", isAdmin, cookieOptions);
        res.cookie("username", username, cookieOptions);
        res.cookie("email", email, cookieOptions);

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

app.post("/admin/books", async (req, res) => {
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
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
  