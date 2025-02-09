const { Joi } = require('express-validation');

exports.login = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6)
    })
};

exports.idQuery = {
    query: Joi.object({
        id: Joi.string().min(5).required()
    })
};

exports.register = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(50).required().messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters'
        }),

        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Please enter a valid email address'
        }),

        phone: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
                'string.empty': 'Phone number is required',
                'string.pattern.base':
                    'Please enter a valid 10-digit Indian phone number'
            }),

        password: Joi.string().min(6).max(30).required()
    })
};
