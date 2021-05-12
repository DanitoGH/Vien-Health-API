const createError = require('http-errors')
const User = require('../Models/User.models')
const { loginSchema, registerSchema } = require('../helpers/validation_schema')
const client = require('../helpers/init_redis')
const { 
     extractHeaderToken,
     signAccessToken,
     signRefreshToken, 
     verifyRefreshToken,
}  = require('../helpers/jwt_helper')

module.exports = {
    register: async (req, res, next) => {
        try {
            // Validate request body with Joi
            const result = await registerSchema.validateAsync(req.body)
            // Check if user already exist in the database
            const doesExist = await User.findOne({ email: result.email })
            if(doesExist) throw createError.BadRequest('Email already taken!')
            // Save user into database if it does not already exist
            const user = new User(result)
            const savedUser = await user.save()
            // Generate access and refresh token for the new user
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken = await signRefreshToken(savedUser.id)
            // Return JSON response with the token and status code
            res.status(201).json({
                token: refreshToken,
                accessToken
            })
        }catch(error) {
             // Prevent Joi from throwing false internal error status
            if(error.isJoi === true) 
              return next(createError.BadRequest(error.message))
            //Forward the error to the internal server error handler
            next(error.message)
        }
    },
    login: async (req, res, next) => {
        try { 
            // Validate request body with Joi
            const result = await loginSchema.validateAsync(req.body)
           // Check if the user has registered
            const user = await User.findOne({ email: result.email })
            if(!user) throw createError.NotFound("User not registered!")
            // Validate user password and login if registered
            const isMatch = await user.isValidPassword(result.password)
            if(!isMatch) throw createError.Unauthorized('Invalid username or password')
            // Generate access and refresh token for the signed in user
            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
            // Return JSON response with the token and status code
            res.status(200).json({
                token: refreshToken,
                accessToken
            })
        }catch(error) {
            // Prevent Joi from throwing false internal error status
           if(error.isJoi === true)
             return next(createError.BadRequest(error.message))
           next(error)
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            // Extract authorization Token from the request headers
            const authHeader = req.headers.authorization
            if(!authHeader) throw createError.Unauthorized()
            const extractToken = await extractHeaderToken(authHeader)
            // Verify token and return user ID
            const userId = await verifyRefreshToken(extractToken)
            // Generate new access and refresh token for the signed in user
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)
            // Return JSON response with the token and status code
            res.status(200).json({
                accessToken: accessToken, 
                refreshToken: refToken 
             })
        }catch(error) {
           next(error)
        }
    },
    logout: async (req, res, next) => {
        try { 
            // Extract authorization Token from the request headers
            const authHeader = req.headers.authorization
            if(!authHeader) throw createError.Unauthorized()
            const extractToken = await extractHeaderToken(authHeader)
            // Verify token and return user ID
            const userId = await verifyRefreshToken(extractToken)
            // Delete user Token from Redis
            client.DEL(userId, (err, val) => {
              if(err){
                throw createError.InternalServerError()
              }
               res.sendStatus(204)
            })
        }catch(error) {
           next(error)
        }
    },
    profile: async (req, res, next) => {
        try {
            // Extract authorization Token from the request headers 
            const authHeader = req.headers.authorization
            if(!authHeader) throw createError.Unauthorized()
            const extractToken = await extractHeaderToken(authHeader)
            // Verify token and return user ID
            const userId = await verifyRefreshToken(extractToken)
            // Fecth user data by ID
            const user = await User.findById(userId)
            // Return JSON response with user email and status code
            res.status(200).json({
                email: user.email
            })
        }catch(error) {
           next(error)
        }
    }
}