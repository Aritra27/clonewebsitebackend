const mongoose = require('mongoose')

const connectdb= async()=>{
    try {
        await mongoose.connect(process.env.MONGOOSE_URI)
        console.log("database connect sucessfully")
    } catch (error) {
        console.log(`a error occured at ${error}`)
    }
}

module.exports=connectdb