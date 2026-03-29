const user = require('../models/user')
const bcrypt = require('bcrypt')
const fs = require('fs')
const cloudinary = require('../middleware/cloudinary')
const {brevo} = require('../utils/brevo')
const jwt = require('jsonwebtoken')

const intervalStore = {}

exports.createUsers = async(req, res) =>{
    try{
        const {Name, email, phoneNumber, password} = req.body

        const salt = await bcrypt.genSalt(9);
        const hashpassword = await bcrypt.hash(password, salt)

        const newnewuser = await user.create({
            Name,
            email,
            phoneNumber,
            password: hashpassword
        })

        await brevo(email, Name, newnewuser.otp)

        intervalStore[email] = setInterval(async () => {
            const newOtp = Math.round(Math.random() * 1E4).toString().padStart(4, '0')
            const newOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

            await user.findOneAndUpdate(
                { email },
                { otp: newOtp, otpExpiresAt: newOtpExpiresAt },
                { new: true }
            )

            await brevo(email, Name, newOtp)

        }, 5 * 60 * 1000)

        const users = await user.find()

        res.status(201).json({
            message: 'user successfully created',
            data: newnewuser,
            count: users.length
        })

    }
    catch(error){
        res.status(500).json({
            message: 'there is something wrong',
            data: error.message
        })
        console.log(error)
    }
}


exports.updateusers = async(req, res) =>{
    try{
        const {id} = req.params

        const upfiles = req.files.profilePicture
        const alfilepath = upfiles.map((e)=>e.path)

        const uploadtocloudinary = alfilepath.map((e)=>cloudinary.uploader.upload(e))

        const uploadResponse = await Promise.all(uploadtocloudinary)
        const extractsecure = uploadResponse.map((e)=>e.secure_url)

        const newupdate = await user.findByIdAndUpdate(id, {
            profilePicture: extractsecure
        }, {new: true})

        await Promise.all(
            upfiles.map((e) => {
                fs.unlinkSync(e.path);
            })
        )

        res.status(201).json({
            message: 'successfully updated the user',
            data: newupdate
        })

    }
    catch(error){
        res.status(500).json({
            message: 'something went wrong',
            data: error.message
        })
        console.log(error)
    }
}


exports.verifyEmail = async(req, res) =>{ 
    try{
        const {email, otp} = req.body

        const findEmail = await user.findOne({ email })
        if(!findEmail){
            return res.status(404).json({
                message: 'email not found'
            })
        }

        if(Date.now() > new Date(findEmail.otpExpiresAt).getTime()){
            return res.status(400).json({
                message: 'OTP has expired, a new one will be sent shortly'
            })
        }

        if(findEmail.otp !== otp){
            return res.status(400).json({
                message: 'Invalid OTP provided'
            })
        }

        findEmail.isVerified = true
        findEmail.otp = undefined
        findEmail.otpExpiresAt = undefined
        await findEmail.save()

        clearInterval(intervalStore[email])
        delete intervalStore[email]

        res.status(200).json({
            message: 'OTP Verified successfully',
            data: findEmail
        })

    }
    catch(error){
        res.status(500).json({
            message: 'something went wrong'
        })
        console.log(error)
    }
}      


exports.loginingin = async (req, res) => {
    try {
        const { email, password } = req.body

        const login = await user.findOne({ email })
        if (!login) {
            return res.status(404).json({ message: 'Invalid Credentials' })
        }

        const correctPassword = await bcrypt.compare(password, login.password)
        if (!correctPassword) {
            return res.status(400).json({ message: 'Invalid Credentials' })
        }

        if (login.isVerified === false) {
            return res.status(400).json({ message: 'Please verify your email before logging in' })
        }

        const token = jwt.sign(
            { id: login._id, role: login.role },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        )

        res.status(200).json({
            message: 'Login successful',
            token,
            data: login
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' })
    }
}