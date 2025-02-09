import { AppError } from 'adminjs';
import { CustomError } from '../helpers/errorHelper.js';

export const handlerWrapper = (f) => {
    return async (request, response, context) => {
        try {
            const data = await f(request, response, context);
            if (!data.record) {
                data.record =
                    (await context.resource.findOne(
                        context.record.params._id,
                        context
                    )) || context.record;
                data.record = data.record.toJSON(context.currentAdmin);
            }
            return data;
        } catch (e) {
            if (e instanceof CustomError) {
                return {
                    notice: {
                        message: e.message,
                        type: 'error'
                    }
                };
            }
            console.log(e);
            throw new AppError(
                'UnExpected error occurred. Please try after some time'
            );
        }
    };
};

export const beforeHookWrapper = (f) => {
    return async (request, context) => {
        try {
            return await f(request, context);
        } catch (e) {
            if (e instanceof CustomError) {
                throw new AppError(e.message.split('You').join('User'));
            }
            throw new AppError(
                'UnExpected error occurred. Please try after some time'
            );
        }
    };
};
