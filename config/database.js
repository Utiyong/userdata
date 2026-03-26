const mongoose = require('mongoose')

mongoose.connect(process.env.mongodburi).then(()=>{
    console.log('the connection is established')
}).catch((error)=>{
    console.log(`there is a problem ${error.message}`)

})
