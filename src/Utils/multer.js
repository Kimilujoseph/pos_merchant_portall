import multer from "multer";
import path from "path";
import fs from "fs";

const __dirname = path.resolve(path.dirname(''));

// Absolute path to the Utils directory
const uploadDir = path.join(__dirname, "uploads");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Multer setup
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
    },
    fileFilter: fileFilter,
});

export default upload;
