const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '7d',
                issuer: 'danito.com',
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err) return reject(createError.InternalServerError())
                resolve(token)
            })
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: 'danito.com',
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err) {
                    return reject(createError.InternalServerError())
                }
                client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                  if(err) {
                    reject(createError.InternalServerError())
                    return
                  }
                  resolve(token)
                })
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
       return new Promise((resolve, reject) =>{
         JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
             if(err) return reject(createError.Unauthorized())
             const userId = payload.aud

             client.GET(userId, (err, result) => {
                if(err){
                    reject(createError.InternalServerError())
                    return
                }
                if(refreshToken === result) return resolve(userId)
                reject(createError.InternalServerError())
             })
             
         })
       })
    },
    extractHeaderToken: (authHeader) => {
        return new Promise((resolve, reject) =>{
            if (!authHeader.startsWith("Bearer ")){
                reject(createError.Unauthorized())
                return
            }
            return resolve(authHeader.substring(7, authHeader.length))
        })
     }
}