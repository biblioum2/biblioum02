const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const pool = require("../config/database");
const cookieParser = require("cookie-parser");

router.use(cookieParser());
const upload = multer({ dest: "uploads/" });
const app = express();
app.use(express.json());


router.post("/upload", upload.single("image"), async (req, res) => {
  try {
      const result = await cloudinary.uploader.uploar(req.file.path);
  } catch (error) {
    folder: 'covers',
  }
});