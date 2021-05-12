const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const createError = require('http-errors')

require('dotenv').config()
require('./helpers/init_mongodb')
require('./helpers/init_redis')

const AuthRoute = require('./Routes/Auth.route')

const app = express()
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

// Handle all API Auth request
app.use('/api/auth', AuthRoute)

/**
 * Espress Error Handlers
 */

/** 404 Error Handler */
app.use(async (req, res, next) => {
    next(createError.NotFound())
})

/** Internal Server Error Handler */
app.use((err, req, res , next) => {
    res.status(err.status || 500)
    res.send({
        error: {
          status: err.status || 500,
          message: err.message, 
        },
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app;

