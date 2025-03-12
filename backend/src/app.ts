import express from "express";
import config from "config";
import sequelize from "./db/sequelize";
import cors from "cors";
import authRouter from "./routers/auth";
import vacationRouter from "./routers/vacations";
import vacationTagRouter from "./routers/vacation-tags";
import notFound from "./middlewares/not-found";
import errorLogger from "./middlewares/error/error-logger";
import errorResponder from "./middlewares/error/error-responder";


const app = express();



// Middleware
app.use(cors());
app.use(express.json());

// Change this line in app.ts
app.use('/uploads', express.static('./uploads'));

// Routes
app.use('/auth', authRouter);
app.use('/vacations', vacationRouter);
app.use('/vacation-tags', vacationTagRouter);

// Error handling middleware
app.use(notFound);
app.use(errorLogger);
app.use(errorResponder);

const port = config.get<string>('app.port');
const appName = config.get<string>('app.name');

async function start() {
    try {
        // Sync database models with database
        const force = config.get<boolean>('sequelize.sync.force');
        await sequelize.sync({ force });
        console.log('Database synced successfully');

        // Start server
        app.listen(port, () => {
            console.log(`${appName} is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
