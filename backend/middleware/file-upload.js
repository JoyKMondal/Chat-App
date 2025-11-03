// const multer = require('multer');
// const { v4: uuidv4 } = require('uuid');

// const MIME_TYPE_MAP = {
//   'image/png': 'png',
//   'image/jpeg': 'jpeg',
//   'image/jpg': 'jpg'
// };

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/images');
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + '.' + ext);
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type!');
//     cb(error, isValid);
//   }
// });

// module.exports = fileUpload;


const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chatapp/profiles', // Your folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      if (!ext) throw new Error('Invalid file type');
      return `profile_${uuidv4()}.${ext}`;
    },
    transformation: [
      { width: 500, height: 500, crop: 'limit' }, // Optional: Resize
    ],
  },
});

const fileUpload = multer({
  limits: { fileSize: 500000 }, // 500KB
  storage: storage, // Now Cloudinary!
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    cb(isValid ? null : new Error('Invalid mime type!'), isValid);
  }
});

module.exports = fileUpload;
