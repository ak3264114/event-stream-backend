const { ValidationError } = require('express-validation');
const constants = require('../config/constants');
class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'Custom Error';
        this.code = code;
    }
}
exports.CustomError = CustomError;
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, _next) => {
    // set locals, only providing error in development
    if (err.status === 404) {
        return res.status(404).json({
            err: true,
            msg: 'Not Found',
            errType: constants.ERROR_TYPES.HTTP
        });
    }
    if (err instanceof ValidationError) {
        const validationErrors = {};
        Object.keys(err.details).forEach((key) => {
            const details = err.details[key];
            details.forEach((d) => {
                validationErrors[d.path.join('.')] = d.message;
            });
        });
        return res.status(400).json({
            err: true,
            msg: 'Validation Error',
            details: validationErrors,
            errType: constants.ERROR_TYPES.VALIDATION
        });
    }
    if (err instanceof CustomError) {
        err.stack;
        return res.status(200).json({
            err: true,
            msg: String(err.message),
            errType: constants.ERROR_TYPES.CUSTOM
        });
    }
    console.log(err);
    return res.status(500).json({
        err: true,
        msg:
            req.app.get('env') === 'development'
                ? String(err.message)
                : 'An unexpected Error occured',
        errType: constants.ERROR_TYPES.UNEXPECTED,
        stack: req.app.get('env') === 'development' ? err.stack : undefined
    });
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};

    // // render the error page
    // res.status(err.status || 500);
    // res.render('error');
};
