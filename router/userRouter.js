const express = require('express')

const router = express.Router()
const {upload} = require('../middleware/multer')
const cloudinary = require('cloudinary')

const {createUsers, updateusers} = require('../controller/userController')

router.post('/users', createUsers)

router.put('/profileusers/:id', upload.fields([{name: 'profilePicture'}]) ,updateusers)


module.exports = router