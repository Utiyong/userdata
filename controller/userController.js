const user = require('../models/user')
const bcrypt = require('bcrypt')
const fs = require('fs')
const cloudinary = require('../middleware/cloudinary')
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

        res.status(201).json({
            message: 'user succcessfully created',
            data:newnewuser
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
            data:newupdate
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

