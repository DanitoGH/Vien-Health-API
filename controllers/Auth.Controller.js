const createError = require('http-errors')
const User = require('../Models/User.models')
const { authSchema }  = require('../helpers/validation_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken }  = require('../helpers/jwt_helper')
const client = require('../helpers/init_redis')

module.exports = {
    register: async (req, res, next) => {
        try { 
            const result = await authSchema.validateAsync(req.body)

            const doesExist = await User.findOne({ email: result.email })
            if(doesExist) throw createError.BadRequest('Email already taken!')

            const user = new User(result)
            const savedUser = await user.save()

            const accessToken = await signAccessToken(savedUser.id)
 
            res.status(201).json({
                body: { 
                  token: accessToken
                }
            })
        }catch(error) {
             // Prevent Joi from throwing false internal error status
            if(error.isJoi === true) 
              return next(createError.BadRequest(error.message))
            //Forward the error to the internal server error handler
            next(error)
        }
    },
    login: async (req, res, next) => {
        try { 
            const result = await authSchema.validateAsync(req.body)
            const user = await User.findOne({ email: result.email })
            if(!user) throw createError.NotFound("User not registered!")
            
            const isMatch = await user.isValidPassword(result.password)
            if(!isMatch) throw createError.Unauthorized('Invalid username or password')
             
            const accessToken = await signAccessToken(user.id)

            res.status(200).json({
                body: {
                     token: accessToken
                }
            })
        }catch(error) {
            // Prevent Joi from throwing false internal error status
           if(error.isJoi === true)
             return next(createError.BadRequest('Invalid username or password'))
           next(error)
        }
    },
    refreshToken: async (req, res, next) => {
        try { 
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
    
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)
            res.send({ accessToken: accessToken, refreshToken: refToken })
        }catch(error) {
           next(error)
        }
    },
    logout: async (req, res, next) => {
        try { 
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadRequest()
    
            const userId = await verifyRefreshToken(refreshToken)
            client.DEL(userId, (err, val) => {
              if(err){
                console.log(err.message)
                throw createError.InternalServerError()
              }
               res.sendStatus(204)
            })
        }catch(error) {
           next(error)
        }
    }
}