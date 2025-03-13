import { NextFunction, Request, Response } from "express";
import Vacation from "../../models/vacation";
import VacationTag from "../../models/vacation-tag";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { UserRequest } from "../../middlewares/auth"; // Import the extended request type

export async function getAllVacations(req: UserRequest, res: Response, next: NextFunction) {
    try {
        // Get user ID from token if available
        const userId = req.user?.id;

        const vacations = await Vacation.findAll({
            include: [{
                model: VacationTag,
                required: false,
                where: userId ? { userId } : undefined,
                attributes: ['userId', 'vacationId'] // Explicitly specify attributes to include
            }],
            order: [['startDate', 'ASC']]
        });

        // Transform response to add isTagged flag
        const transformedVacations = vacations.map(vacation => {
            const vacationData = vacation.toJSON();
            return {
                ...vacationData,
            };
        });

        res.json(transformedVacations);
    } catch (e) {
        next(e);
    }
}

export async function getVacation(req: UserRequest<{ vacationId: string }>, res: Response, next: NextFunction) {
    try {
        const { vacationId } = req.params;
        // Get user ID from token if available
        const userId = req.user?.id;

        const vacation = await Vacation.findByPk(vacationId, {
            include: [{
                model: VacationTag,
                required: false,
                where: userId ? { userId } : undefined
            }]
        });

        if (!vacation) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vacation not found");
        }

        // Transform response to add isTagged flag
        const vacationData = vacation.toJSON();
        const transformedVacation = {
            ...vacationData,
            isTagged: vacationData.vacationTags && vacationData.vacationTags.length > 0,
            vacationTags: undefined // Remove vacationTags array from response
        };

        res.json(transformedVacation);
    } catch (e) {
        next(e);
    }
}

export async function createVacation(req: Request<{}, {}, {
    destination: string,
    description: string,
    startDate: string,
    endDate: string,
    price: number
}>, res: Response, next: NextFunction) {
    try {
        const newVacation = await Vacation.create({
            ...req.body,
            imageFileName: req.imageUrl
        });
        res.status(StatusCodes.CREATED).json(newVacation);
    } catch (e) {
        next(e);
    }
}

export async function updateVacation(req: Request<{ vacationId: string }, {}, {
    destination: string,
    description: string,
    startDate: string,
    endDate: string,
    price: number
}>, res: Response, next: NextFunction) {
    try {
        const { vacationId } = req.params;

        const vacation = await Vacation.findByPk(vacationId);

        if (!vacation) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vacation not found");
        }

        // If image file has changed, delete the old one
        if (req.imageUrl) {
            await vacation.update({
                ...req.body,
                imageFileName: req.imageUrl
            });
        } else {
            await vacation.update(req.body);
        }

        res.json(vacation);
    } catch (e) {
        next(e);
    }
}

export async function deleteVacation(req: Request<{ vacationId: string }>, res: Response, next: NextFunction) {
    try {
        const { vacationId } = req.params;

        const vacation = await Vacation.findByPk(vacationId);

        if (!vacation) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vacation not found");
        }

        // This will also delete all related tags due to CASCADE constraint
        await vacation.destroy();

        res.json({
            success: true,
            message: "Vacation deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

export async function getTaggingStats(req: Request, res: Response, next: NextFunction) {
    try {
        const taggingData = await VacationTag.findAll({
            attributes: ['vacationId', [VacationTag.sequelize?.fn('COUNT', '*'), 'tagsCount']],
            group: ['vacationId'],
            include: [{
                model: Vacation,
                attributes: ['destination']
            }]
        });

        res.json(taggingData);
    } catch (e) {
        next(e);
    }
}