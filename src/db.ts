import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: __dirname+'/.env' }) ;
const mongo_url =  `mongodb+srv://architjain1082002:E91k1FeyRraz1Krn@cluster0.gsqgjzb.mongodb.net/?retryWrites=true&w=majority`
const db_name = "employeeDb"

export const  dbConnect =  mongoose.connect(mongo_url||" ",{
    // dbName : process.env.DB_NAME?.toString() || " "
    dbName : db_name
}).then(() => {
    console.log("Connected to db") ;
}).catch(err => {
    console.log("Error in connecting to db ",err) ;
})  

// TODO USE ENV