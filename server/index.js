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
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

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

// new addition
// app.get("/", (req, res) => {
//     res.send("Server is up and running!");
//   });

    app.get("/", (req, res) => {
        const loaderHtml = "<div class='loader'></div>";
        const messageHtml = "<h1 style='color: black; text-align: center; margin-top: 20px;'>Server is up and running!</h1>";
        const linkHtml = "<h3 style='text-align: center; margin-top: 10px;'>Visit SocialNation <a href='https://social-nation.vercel.app/'>here</a></h3>";
        
        const combinedHtml = `
        <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Status</title>
            <style>
                body {
                display: flex;
                flex-direction: column; /* Make the content stack vertically */
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #94d2bd;
                }
    
                .loader {
                width: 90px;
                height: 14px;
                --c: #00b4d8 92%, #0000;
                background: 
                    radial-gradient(circle closest-side, var(--c)) calc(100%/-4) 0,
                    radial-gradient(circle closest-side, var(--c)) calc(100%/4) 0;
                background-size: calc(100%/2) 100%;
                animation: l14 1.5s infinite;
                }
    
                @keyframes l14 {
                0%   {background-position: calc(100%/-4) 0, calc(100%/4) 0}
                50%  {background-position: calc(100%/-4) -14px, calc(100%/4) 14px}
                100% {background-position: calc(100%/4) -14px, calc(3*100%/4) 14px}
                }
    
                h1 {
                color: black;
                margin-top: 20px;
                }
    
                p {
                color: #333;
                margin-top: 10px;
                }
    
                a {
                color: #007bff;
                text-decoration: none;
                }
    
                a:hover {
                text-decoration: underline;
                }
            </style>
            </head>
            <body>
            ${loaderHtml}
            ${messageHtml}
            ${linkHtml}
            </body>
        </html>
        `;
    
        res.send(combinedHtml);
    });
    
  
  
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

    /* adding data one time */
    // User.insertMany(users);
    // Post.insertMany(posts);
})
    .catch((error) => console.log(`${error} did not connect`));