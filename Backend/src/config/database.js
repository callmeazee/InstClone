const mongoose = require('mongoose')

const URI = process.env.MONGO_URI
async function connectToDb(){
  await  mongoose.connect(URI)
        console.log("connected to db successfully")


}
module.exports = connectToDb

