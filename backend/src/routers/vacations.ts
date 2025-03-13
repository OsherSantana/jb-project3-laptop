import { Router } from "express";
import {
    createVacation,
    deleteVacation,
    getAllVacations,
    getTaggingStats,
    getVacation,
    updateVacation
} from "../controllers/vacation/controller";
import validation from "../middlewares/validation";
import paramsValidation from "../middlewares/params-validation";
import {
    newVacationValidator,
    updateVacationValidator,
    vacationIdValidator
} from "../controllers/vacation/validator";
import { authorizeAdmin } from "../middlewares/auth";
import fileUploader from "../middlewares/file-uploader";

const vacationRouter = Router();

// Public routes (no auth required)
vacationRouter.get('/', getAllVacations);
vacationRouter.get('/:vacationId', paramsValidation(vacationIdValidator), getVacation);

// Admin only routes
vacationRouter.post('/',
    authorizeAdmin,
    fileUploader,
    validation(newVacationValidator),
    createVacation
);

vacationRouter.put('/:vacationId',
    authorizeAdmin,
    paramsValidation(vacationIdValidator),
    fileUploader,
    validation(updateVacationValidator),
    updateVacation
);

vacationRouter.delete('/:vacationId',
    authorizeAdmin,
    paramsValidation(vacationIdValidator),
    deleteVacation
);

// Reports
vacationRouter.get('/reports/tags',
    authorizeAdmin,
    getTaggingStats
);

export default vacationRouter;