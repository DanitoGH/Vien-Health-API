const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
})
/**
 * Place other schemas in the module exports object.
 */
module.exports = {
    authSchema,
}