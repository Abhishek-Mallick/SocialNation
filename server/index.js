import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { createPost } from "./controllers/posts.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";

/* configurations */
// for communication in directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
// setting file upload limit
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
// setting directory where we store our assets i.e images here we are saving it locally in production enviornment we would use prefereably S3
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* file storage */
// that is whenever someone uploads a file it will be saved in public/assets folder -> multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({storage: storage});

/* routes with files */
// we hit the route /auth/register and we use a middleware where we upload a file to local and register
app.post("/auth/register", upload.single("picture"),register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* other routes */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* mongoose setup */
const PORT = process.env.PORT || 6001;

if (!process.env.MONGO_URL) {
    console.error('MONGO_URL environment variable is not set.');
  }

mongoose.connect(process.env.MONGO_URL,{
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
})
    .catch((error) => console.log(`${error} did not connect`));