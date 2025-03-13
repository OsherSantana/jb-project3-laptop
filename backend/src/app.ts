import express, { json } from "express";
import config from "config";
import sequelize from "./db/sequelize";
import cors from "cors";
import authRouter from "./routers/auth";
import vacationRouter from "./routers/vacations";
import vacationTagRouter from "./routers/vacation-tags";
import notFound from "./middlewares/not-found";
import errorLogger from "./middlewares/error/error-logger";
import errorResponder from "./middlewares/error/error-responder";
import enforceAuth from "./middlewares/enforceAuth";
import { createAppBucketIfNotExist } from "./aws/aws";
import fileUpload from "express-fileupload";

const app = express();

const port = config.get<string>('app.port');
const appName = config.get<string>('app.name');
const force = config.get<boolean>('sequelize.sync.force');

(async () => {
    await sequelize.sync({ force });
    await createAppBucketIfNotExist()

    // Middleware
    app.use(cors());
    app.use(json());
    app.use(fileUpload())

    // Routes
    app.use('/auth', authRouter);
    app.use(enforceAuth)

    app.use('/vacations', vacationRouter);
    app.use('/vacation-tags', vacationTagRouter);

    // Error handling middleware
    app.use(notFound);
    app.use(errorLogger);
    app.use(errorResponder);

    app.listen(port, () => {
        console.log(`${appName} is running on port ${port}`);
    });
})()