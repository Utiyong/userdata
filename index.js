const express = require('express');
require('dotenv').config()
const PORT = 2039
require('./config/database')
const app = express()
app.use(express.json())

const router = require('./router/userRouter')

app.use(router)



app.listen(PORT, ()=>{
    console.log(`server is listening on port: ${PORT}`);
    
})

