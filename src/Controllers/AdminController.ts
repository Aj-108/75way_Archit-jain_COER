import {RequestHandler} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' ;
import Employ from '../models/EmploySchema'
import {sendMail}  from '../Utils/emailSender';

export const register : RequestHandler = async (req,res,next) => {
    try{
        const {name,email,password,join_date,birth_date,salary,anniversary_date} = req.body ;
        const existingUser = await Employ.findOne({email}) ;

        // Checking if user already exists or not 
        if(existingUser){
            return res.status(409).json({ok:false,message:"User already exists"}) ;
        }

        const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if (email !== '' && !email.match(emailFormat)) { 
            return res.status(400).json({
                ok:false,message:'Invalid email format',
            });
         }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
        return res.status(400).json({
            ok:false,message:'Invalid password format. It should contain at least 8 characters, one uppercase letter, one digit, and one special character.',
        });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const role = "admin"
        //Storing password in database
        const newUser:any = new Employ({
            name,email,password:hashedPassword,join_date,birth_date,salary,anniversary_date,role
        })

        await newUser.save() ; 
        return res.status(201).json({ok:true,message:"User is created Successfully",newUser}) 
    }
    catch(err){
        next(err) ;
    }
}

export const login : RequestHandler = async (req,res,next) => {
    try{
        const {email,password} = req.body ;

        const user = await Employ.findOne({email}) ;

        // Checking if the email exists in database 
        if(!user){
            return res.status(400).json({ok:false,message:"Invalid Credentials"}) ;
        }

        // comapring password entered with database hashed Password
        const isPasswordMatch = await bcrypt.compare(password,user.password) ;
        if(!isPasswordMatch){
            return res.status(400).json({ok:false,message:"Invalid Credentials"}); 
        }

        // Generating tokens
        const authToken = jwt.sign({userId : user._id},process.env.JWT_SECRET_KEY||" ",{expiresIn : '30m'}) ;
        const refreshToken = jwt.sign({userId : user._id},process.env.JWT_REFRESH_SECRET_KEY||" ",{expiresIn : '2h'}) ;


        // Saving tokens in cookies 
        res.cookie('authToken',authToken,({httpOnly : true})) ;
        res.cookie('refreshToken',refreshToken,({httpOnly:true})) ;

        return res.status(200).json({ok:true,message : "Login Successful",userid:user.id}) ;

    }
    catch(err){
        next(err) ;
    }
}

export const logout : RequestHandler = async (req,res,next) => {
    try{
        res.clearCookie('authToken') ;
        res.clearCookie('refreshToken') ;
        
        return res.status(200).json({ok:true,message:"User has been logged out"}) ;
    }
    catch(err) {
        next(err) ;
    }
}


export const registerUser : RequestHandler = async (req,res,next) => {
    try{
        if(req.isAdmin !== true){
            return res.status(409).json({ok:false,message:"You must be an admin for this opeartion"})
        }

        const {name,email,password,join_date,birth_date,salary,anniversary_date,role,employ_details} = req.body ;

        const existingUser = await Employ.findOne({email}) ;

        // Checking if user already exists or not 
        if(existingUser){
            return res.status(409).json({ok:false,message:"User already exists"}) ;
        }

        const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if (email !== '' && !email.match(emailFormat)) { 
            return res.status(400).json({
                ok:false,message:'Invalid email format',
            });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
        return res.status(400).json({
            ok:false,message:'Invalid password format. It should contain at least 8 characters, one uppercase letter, one digit, and one special character.',
        });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // const employer_details = {...employ_details,date:new Date()}

        const newUser:any = new Employ({
            name,email,password:hashedPassword,join_date,birth_date,salary,anniversary_date,role,employ_details
        })

        await newUser.save() ; 

            const passwordLink = `http://localhost:8000/api/user/updatePassword/${newUser._id}`
            const mailBody = `Your link for settign password if : ${passwordLink}    and your default password is "${password}"` ;
            const mailSubject =  'Link for setting up password'
            sendMail(email,mailSubject,mailBody) ;
    

        return res.status(201).json({ok:true,message:"User is created Successfully",newUser}) 

    }
    catch(err) {
        next(err) ; 
    }
}

// TOO CHECK
export const userList : RequestHandler = async (req,res,next) => {
    try{
        if(req.isAdmin !== true){
            return res.status(409).json({ok:false,message:"You must be an admin for this opeartion"})
        }
        const users  = (await Employ.find()).filter((user:any) => user.role !== "admin") ;
        res.status(200).json({ok:true,users}) ;
    }
    catch(err) {
        // console.log("pass")
        next(err) ; 
    }
}

export const userDetails : RequestHandler = async (req,res,next) => {
    try{
        if(!req.isAdmin){
            return res.status(409).json({ok:false,message:"You must be an admin for this opeartion"})
        }
        const user:any  = await Employ.findById(req.params.id) ;

        if(!user){
            res.status(409).json({ok:true,message:"No user found "})
        }
        res.status(200).json({ok:true,userDetails:user.employ_details}) ;

    }
    catch(err) {
        // console.log("pass")
        next(err) ; 
    }
}


export const userStatusUpdate : RequestHandler = async (req,res,next) => {
    try{
        const { date, status } = req.body;

        const user:any  = await Employ.findById(req.params.id) ;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userDetails = user.employ_details.find(
            (details:any) => details.date.toISOString() === new Date(date).toISOString()
        );

        if (userDetails) {
            userDetails.status = status;
        } else {
            user.employ_details.push({
                date: new Date(date),
                status,
            });
        }


        await user.save();

        res.status(200).json({ okay: true, message: 'Status updated successfully' });
    }
    catch(err) {
        next(err) ; 
    }
}

