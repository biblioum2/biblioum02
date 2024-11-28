require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
const fileUpload = require("express-fileupload");
const http = require("http");
const multer = require("multer");
const cloudinary = require("./config/cloudinaryConfig");
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

const local = "http://localhost:3000";
const renderr = "https://biblioum02.onrender.com";

const baseUrl = local;
const SECRET_KEY = process.env.SECRET_KEY;
// Configuración CORS
app.use(
  cors({
    origin: baseUrl,
  })
);

// Configuración de Multer para manejar archivos temporales
const storage = multer.memoryStorage();
// Validación del archivo
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error("El archivo debe ser una imagen o un PDF")); // Rechazar archivo
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Configuración de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para configurar CSP
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src *; " +
      "img-src *; " +
      "style-src * 'unsafe-inline'; " +
      "script-src * 'unsafe-inline' 'unsafe-eval'; " +
      "font-src *; " +
      "connect-src *; " +
      "object-src *;"
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
const { render } = require("ejs");
const e = require("express");
app.use("/", indexRouter);

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");
  const userIdFromSocket = socket.handshake.query.userId;
  console.log(userIdFromSocket);

  // Actualizar el socket_id del usuario en la base de datos
  pool.query(
    "UPDATE users SET socket_id = $1 WHERE user_id = $2",
    [socket.id, userIdFromSocket],
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(
        `Usuario con ID ${userIdFromSocket} conectado con socket ID ${socket.id}`
      );
    }
  );

  // ESCUCHAR Y REDIRIGIR LA ORDEN DEL CLIENTE AL ADMIN
  socket.on("order", async (data, mensaje) => {
    const { userId, bookId, title, loanDate, returnDate } = data;
    console.log("data desde el servidor book", data);
    try {
      const response = await createOrder(userId, bookId, loanDate, returnDate);
      if (response) {
        io.emit("new order");
      }
    } catch (error) {
      console.error("Error al crear la orden: ", error);
      io.emit("create order result", { success: false });
    }
  });

  // ESCUCHAR LA RESPUESTA DEL ADMIN Y ACTUALIZAR LA INFORMACION
  socket.on("admin response", (userId) => {
    pool.query(
      "SELECT socket_id FROM users WHERE user_id = $1",
      [userId],
      (error, result) => {
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
      }
    );
  });

  socket.on("message", async () => {
    sendMessageToUser();
  });

  // Manejar la desconexión
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
    pool.query(
      "UPDATE users SET socket_id = NULL WHERE user_id = $1",
      [userIdFromSocket],
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Usuario con ID ${userIdFromSocket} desconectado`);
      }
    );
  });
});

// Ruta para subir archivos a Cloudinary
app.post(
  "/uploadFiles",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "lib", maxCount: 1 },
  ]),
  async (req, res) => {
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
      languaje,
    } = req.body;
    function formatDate(dateInput) {
      // Verificar si el formato de entrada es dd/mm/yyyy
      const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;

      if (ddmmyyyyRegex.test(dateInput)) {
        // Si es en formato dd/mm/yyyy, convertir a Date
        const [day, month, year] = dateInput.split("/").map(Number);
        const date = new Date(year, month - 1, day); // Meses en JS son 0-indexed

        // Retornar en formato ISO (yyyy-mm-ddTHH:mm:ss.sssZ)
        return date.toISOString();
      } else {
        // Si no es un formato dd/mm/yyyy, se asume que es una fecha ISO
        const date = new Date(dateInput);

        // Verificar si la fecha es válida
        if (isNaN(date)) {
          throw new Error("Formato de fecha no válido");
        }

        // Retornar en formato dd/mm/yyyy
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses en JS son 0-indexed
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
      }
    }
    console.log(
      "datos desde app: ",
      title,
      edition,
      author,
      category,
      publication_date,
      isbn,
      summary,
      available,
      available_copies,
      languaje
    );
    const coverFile = req.files.cover ? req.files.cover[0] : null;
    const pdfFile = req.files.lib ? req.files.lib[0] : null;
    try {
      const base64CoverFile = `data:${
        coverFile.mimetype
      };base64,${coverFile.buffer.toString("base64")}`;
      const base64PdfFile = `data:${
        pdfFile.mimetype
      };base64,${pdfFile.buffer.toString("base64")}`;
      // Subir archivo a Cloudinary
      const result1 = await cloudinary.uploader.upload(base64CoverFile, {
        folder: "books", // Opcional: carpeta en Cloudinary
        public_id: `book_cover_${Date.now()}`, // Opcional: nombre del archivo en Cloudinary
      });
      const coverUrl = result1.secure_url;
      console.log("url de la imagen", coverUrl);

      const result2 = await cloudinary.uploader.upload(base64PdfFile, {
        folder: "books", // Opcional: carpeta en Cloudinary
        public_id: `book_PDF_${title}`, // Opcional: nombre del archivo en Cloudinary
      });
      const pdfUrl = result2.secure_url;
      console.log("url del pdf", pdfUrl);

      const resultBd = await insertBook({
        title,
        author,
        edition,
        isbn,
        summary,
        available,
        publication_year: formatDate(publication_date),
        available_copies,
        cover: coverUrl,
        lib: pdfUrl,
        languaje,
      });

      await insertBookCategory(resultBd, category);

      console.log("resultado de la base de datos", resultBd);
      res.redirect("/admin/books/success");
    } catch (error) {
      console.error("Error al subir archivo:", error);
      res.status(500).json({ error: "Error al subir archivo." });
    }
  }
);

// Manejo de errores de Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    res.status(400).send({ error: err.message });
  } else {
    next(err);
  }
});

app.patch("/updateOrderStatus1", async (req, res) => {
  const { orderId, status } = req.body;
  console.log("datos desde app: ", orderId, status);

  try {
    const response = await updateOrderStatus(orderId, status);
    console.log("antes de redireccionar");
    res.status(200).json({ success: true, response: response });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false });
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
    password = await bcrypt.hash(password, 10);
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

app.post("/registerUser", async (req, res) => {
  let { name, email, password, passwordRepeat } = req.body;
  let errorsCount = 0;
  let duplicateCount = 0;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  passwordRepeat = passwordRepeat.trim();

  const errors = {
    username: {
      exist: false,
      valid: true,
      error: [],
    },
    email: {
      exist: false,
      valid: true,
      error: [],
    },
    password: {
      valid: {
        password1: true,
        password2: true,
      },
      error: [],
    },
  };
  const validateUsername = (username) => {
    const errors = [];
    const minLength = 3;
    const maxLength = 15;
    const validChars = /^[a-z0-9]+$/;
    const trimmedUsername = username.trim();

    if (
      trimmedUsername.length < minLength ||
      trimmedUsername.length > maxLength
    ) {
      errorsCount++;
      errors.push(
        `El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`
      );
    }

    if (!validChars.test(trimmedUsername)) {
      errorsCount++;
      errors.push(
        "El nombre de usuario contiene caracteres no válidos. Solo se permiten letras minúsculas y números."
      );
    }

    return errors;
  };

  const validateEmail = (email) => {
    const errors = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@uman\.edu\.mx$/;

    if (!emailRegex.test(email)) {
      errorsCount++;
      errors.push(
        "Correo electronico no valido, utiliza tu correo institucional."
      );
    }

    return errors;
  };

  const validatePassword = (password, passwordConfirm) => {
    const errors = {
      password1: [],
      password2: [],
    };
    const minLength = 8;
    const maxLength = 20;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasDigit = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || password.length > maxLength) {
      errorsCount++;
      errors.password1.push(
        `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`
      );
    }

    if (!hasUpperCase.test(password)) {
      errorsCount++;
      errors.password1.push(
        "La contraseña debe contener al menos una letra mayúscula."
      );
    }

    if (!hasLowerCase.test(password)) {
      errorsCount++;
      errors.password1.push(
        "La contraseña debe contener al menos una letra minúscula."
      );
    }

    if (!hasDigit.test(password)) {
      errorsCount++;
      errors.password1.push("La contraseña debe contener al menos un dígito.");
    }

    if (!hasSpecialChar.test(password)) {
      errorsCount++;
      errors.password1.push(
        "La contraseña debe contener al menos un carácter especial."
      );
    }
    if (password !== passwordConfirm) {
      errorsCount++;
      errors.password2.push("Las contraseñas no coinciden.");
    }
    return errors;
  };

  errors.username.error.push(validateUsername(name));
  errors.email.error.push(validateEmail(email));
  errors.password.error.push(validatePassword(password, passwordRepeat));

  errors.username.valid = errors.username.error.length === 0;
  errors.email.valid = errors.email.error.length === 0;

  errors.password.valid.password1 =
    errors.password.error[0].password1.length === 0;
  errors.password.valid.password2 =
    errors.password.error[0].password2.length === 0;

  const usernameExists = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM users WHERE username = $1)",
    [name]
  );
  errors.username.exist = usernameExists.rows[0].exists;
  duplicateCount = usernameExists.rows[0].exists
    ? duplicateCount + 1
    : duplicateCount;
  const emailExists = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)",
    [email]
  );
  errors.email.exist = emailExists.rows[0].exists;
  duplicateCount = emailExists.rows[0].exists
    ? duplicateCount + 1
    : duplicateCount;

  if (errorsCount > 0) {
    res.status(400).json({ errors });
  } else if (duplicateCount > 0) {
    errors.username.exist = usernameExists.rows[0].exists;

    errors.email.exist = emailExists.rows[0].exists;

    errors.username.error = usernameExists.rows[0].exists
      ? ["El nombre de usuario ya existe."]
      : [];
    errors.email.error = emailExists.rows[0].exists
      ? ["El correo electrónico ya está registrado."]
      : [];
    errors.username.valid = !usernameExists.rows[0].exists;
    errors.email.valid = !emailExists.rows[0].exists;

    res.status(409).json({ errors });
  } else {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await insertUser(name, passwordHash, email,"student");
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }

  console.log("pal login");
});

app.post("/register", async (req, res) => {
  const { username = username.trim(), email, password } = req.body;
  const errors = {
    username: {
      exist: false,
      valid: true,
      error: [],
    },
    email: {
      exist: false,
      valid: true,
      error: [],
    },
    password: {
      valid: true,
      error: [],
    },
  };

  const validateUsername = (username) => {
    const errors = [];
    const minLength = 3;
    const maxLength = 15;
    const validChars = /^[a-z0-9]+$/;
    const trimmedUsername = username.trim();

    if (
      trimmedUsername.length < minLength ||
      trimmedUsername.length > maxLength
    ) {
      errors.push(
        `El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`
      );
    }

    if (!validChars.test(trimmedUsername)) {
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

  errors.username = validateUsername(username);
  errors.email = validateEmail(email);
  errors.password = validatePassword(password);

  for (let key in errors) {
    if (errors.hasOwnProperty(key)) {
      console.log(`Key: ${key}`);
      console.log(`Exist: ${errors[key].exist}`);
      console.log(`Valid: ${errors[key].valid}`);
      console.log(`Errors: ${errors[key].error.join(", ")}`); // Si `error` es un array
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const response = await insertUser(username, passwordHash, email);
    console.log("Usuario registrado: ", response.rows[0]);
    res.redirect("/login");
  } catch (error) {
    console.error("Error al registrar usuario: ", error);
    res.render("register", {
      errors,
      username,
      email,
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password, remember } = req.body;
  try {
    const data = await getUser(username);
    if (data.length > 0) {
      const user = data[0];
      console.log("Usuario encontrado", user);
      console.log(await bcrypt.hash(password, 10));

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password_hash
      );
      console.log("Contraseña correcta? ", isPasswordCorrect);

      if (isPasswordCorrect) {
        // EVALUAR EL ROL DEL USUARIO
        console.log("Rol del usuario: ", user.role);
        const token = jwt.sign({id: user.user_id, username: user.username, role: user.role, email: user.email}, SECRET_KEY, {expiresIn: "1h"});
        
        const isAdmin = user.role === "admin" ? true : false;
        console.log("Es admin desde app? ", isAdmin);
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
  console.log("body del cliente books", req.body);
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
  console.log(`Servidor corriendo en ${baseUrl}`);
});
