import { Router, Request, Response } from "express";
import { login, register } from "../controllers/auth/controller";
import validation from "../middlewares/validation";
import { loginValidator, registerValidator } from "../controllers/auth/validator";

const authRouter = Router();



authRouter.post('/register', validation(registerValidator), register);
authRouter.post('/login', validation(loginValidator), login);

export default authRouter;