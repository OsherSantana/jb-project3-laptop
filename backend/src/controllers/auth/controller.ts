import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import config from "config";
import crypto from "crypto";

export async function register(req: Request<{}, {}, {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}>, res: Response, next: NextFunction) {
    try {
        // Check if email already exists
        const existingUser = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (existingUser) {
            throw new AppError(StatusCodes.CONFLICT, "Email already in use");
        }

        // Hash password using crypto (Node.js built-in)
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto
            .pbkdf2Sync(req.body.password, salt, 1000, 64, 'sha512')
            .toString('hex');

        const passwordWithSalt = `${salt}:${hashedPassword}`;

        // Create new user
        const newUser = await User.create({
            ...req.body,
            password: passwordWithSalt,
            role: 'user'  // Default role is user
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            config.get<string>("app.jwtSecret"),
            { expiresIn: "24h" }
        );

        // Return user without password and with token
        const userResponse = newUser.toJSON();
        delete userResponse.password;

        res.status(StatusCodes.CREATED).json({
            user: userResponse,
            jwt: token
        });
    } catch (e) {
        next(e);
    }
}

export async function login(req: Request<{}, {}, {
    email: string,
    password: string
}>, res: Response, next: NextFunction) {
    try {
        // Find user by email
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
        }

        // Validate password using crypto
        const [salt, storedHash] = user.password.split(':');
        const hash = crypto
            .pbkdf2Sync(req.body.password, salt, 1000, 64, 'sha512')
            .toString('hex');

        const validPassword = storedHash === hash;

        if (!validPassword) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.get<string>("app.jwtSecret"),
            { expiresIn: "24h" }
        );

        // Return user without password and with token
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            user: userResponse,
            jwt: token
        });
    } catch (e) {
        next(e);
    }
}