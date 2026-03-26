const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    otp:{
        type:String,
        trim: true,
        default: ()=>{
            return Math.round(Math.random() * 1E4).toString().padStart(4, '0')
        }
    },
    phoneNumber:{
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        securedUrl: {
            type: String,
            trim: true,
            // required: true
        },
        publicId: {
            type:String,
            trim: true,
            // required: true
        }
    },
    
})

const user = mongoose.model('newdata', schema)

module.exports = user
