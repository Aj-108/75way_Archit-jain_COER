import express from "express"
import cors from 'cors' ;
import bodyParser from 'body-parser' ;
import dotenv from 'dotenv'
import cookieparser from 'cookie-parser'
import AdminRoutes from './Routes/AdminRoutes'
import UserRoutes from './Routes/UserRoutes'
import cron from 'node-cron'
import { sendMail } from "./Utils/emailSender";
import EmploySchema from "./models/EmploySchema";


require('./db')

const app = express() ;
const PORT = 8000 ;

// dotenv.config({ path: __dirname+'/.env' }) ;

require('dotenv').config() ;

declare global{
  namespace Express{
    interface Request{
      userId? : string,
      isAdmin : Boolean
    }
  }
}


app.use(cors()) ;
app.use(cookieparser()) ;   
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );


app.use('/api/admin',AdminRoutes) ;
app.use('/api/user',UserRoutes) ;


cron.schedule('0 0 * * *', async () => {
        try {
            const today = new Date();
    
            const employeesWithBirthday = await EmploySchema.find({
                birth_date: {
                    $regex: today,
                },
            });

            const employeeAnniversary :any = await EmploySchema.find({
                anniversary_date: {
                    $regex: today,
                },
            });

    
            employeesWithBirthday.forEach((employee:any) => {
                const emailBody = `Dear ${employee.name},\n\nHappy Birthday!\n\nBest regards,\nYour Company`
                sendMail(employee.email,"Birthday Wish",emailBody)}
            )

            employeeAnniversary.forEach((employee:any) => {
                const emailBody = `Dear ${employee.name},\n\nHappy Birthday!\n\nBest regards,\nYour Company`
                sendMail(employee.email,"Birthday Wish",emailBody)}
            )

        } catch (error) {
            console.error('Error fetching employees with birthday:', error);
        }

});


app.listen(PORT,()=>{
    console.log("server is running on PORT :",PORT)
})