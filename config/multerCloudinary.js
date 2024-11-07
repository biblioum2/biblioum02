const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perfiles', // El nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;


const express = require('express');
const upload = require('./uploadConfig'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

router.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  try {
    // Aquí puedes guardar la URL de la imagen en tu base de datos
    const imageUrl = req.file.path; // URL de la imagen almacenada en Cloudinary
    res.status(200).json({ message: 'Imagen subida exitosamente', imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir la imagen', error });
  }
});

module.exports = router;
