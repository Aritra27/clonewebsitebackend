const express= require('express')
const cors = require('cors')
const cookieParser= require('cookie-parser');
require('dotenv').config()
const connectDB= require('./utils/db')
const userRoute= require('./routes/user.route')
const postRoute= require('./routes/post.route')
const messageRoute= require('./routes/message.route')
const {app,server}= require('./socket/socket')

const PORT= process.env.PORT


//middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))

const corsOption={
    origin:"http://localhost:5173",
    credentials: true, 
}
app.use(cors(corsOption));

app.route('/').get((req,res)=>{
    res.status(200).json({message:"its backend"})
})

app.use('/api/v1/user',userRoute);
app.use('/api/v1/post',postRoute);
app.use('/api/v1/message', messageRoute);

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log(`app is listening on ${PORT}`);
    })
})
