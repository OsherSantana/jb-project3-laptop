import Joi from "joi";

export const newVacationValidator = Joi.object({
    destination: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    price: Joi.number().positive().precision(2).required()
});

export const updateVacationValidator = Joi.object({
    destination: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    price: Joi.number().positive().precision(2).required()
});

export const vacationIdValidator = Joi.object({
    vacationId: Joi.string().uuid().required()
});