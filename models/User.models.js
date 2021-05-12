const mongoose  = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const userScheme = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
       type: String,
       required: true,
       unique: true
    },
    password: {
        type: String,
        required: true
    }
})
/**
 * Hash password when the save middleware is invoked
 */
userScheme.pre('save', async function (next) {
    try {
       const salt = await bcrypt.genSalt(10)
       const hashedPassword = await bcrypt.hash(this.password, salt)
       this.password = hashedPassword
       next()
    } catch (error) {
      next(error)
    }
})
/**
 * Validate user password
 */
userScheme.methods.isValidPassword = async function (password) {
    try {
       return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}

const User = mongoose.model('user', userScheme)
module.exports = User