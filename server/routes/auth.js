import express from 'express';
import { login } from "../controllers/auth.js";

const router = express.Router();

// when this url is hit it will be /auth/login as all url with /auth will be redirected to this file
router.post("/login", login);

export default router;