import {RequestHandler} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' ;
import Employ from '../models/EmploySchema'
import {sendMail}  from '../Utils/emailSender';



export const updatePassword : RequestHandler = async (req,res,next) => {
    try{
        const {old_password,new_password,confirm_password} = req.body ;

        const user:any = await Employ.findById(req.params.id) ;

        if(!user){
            res.status(409).json({ok:false,message:"No user found"}) ;
        }


        const isPasswordMatch = await bcrypt.compare(old_password,user.password) ;
        if(!isPasswordMatch){
            return res.status(400).json({ok:false,message:"Invalid Credentials"}); 
        }

        if(new_password !== confirm_password){
            res.status(409).json({ok:false,message:"Password and Confrim password do not match"}) ;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(new_password, salt);

        const updatedUser = Employ.findByIdAndUpdate(
            req.params.id,
            {
                password : hashedPassword
            },
            {new:true}  
        )

        

        res.json({ok:true,message:"Password updated successfully"})
    }
    catch(err) {
        // console.log("pass")
        next(err) ; 
    }
}

export const loginUser : RequestHandler = async (req,res,next) => {
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
    catch(err) {
        // console.log("pass")
        next(err) ; 
    }
}



export const fillUserDetails : RequestHandler = async (req,res,next) => {
    try{
        if(req.userId !== req.params.id) {
            return res.status(400).json({ok:false,message:"Cannot access data of other users"}) ;
        }

        
        const {inTime,outTime} =  req.body ;

        const user:any =await Employ.findById(req.params.id.toString()) ;
        
        const date = new Date() ;
        user.employ_details.push({inTime,outTime})
        const mailSubject = `Timings of ${user.name} for ${date}`
        const mailBody = `InTime for today is ${inTime} and outTime is ${outTime}` ;

        await Employ.find({role:"admin"}).then((admins:any) => {
            const adminEmails = admins.map((admin:any) => admin.email)
            adminEmails.map((email:any) => {
                sendMail(email,mailSubject,mailBody) ;
            })
        })
        
        
        await user.save() ;
        res.status(200).json({ok:true,message:"Both values are updated"})
    }
    catch(err) {
        next(err) ; 
    }
}


export const ownDetails : RequestHandler = async (req,res,next) => {
    try{
        if(req.userId !== req.params.id) {
            return res.status(400).json({ok:false,message:"Cannot access data of other users"}) ;
        }
       
        const user:any =await Employ.findById(req.params.id.toString()) ;
    
        res.status(200).json({ok:true,data:user.employ_details})
    }
    catch(err) {
        next(err) ; 
    }
}

export const allUserStatus : RequestHandler = async (req,res,next) => {
    try{
        const users = await Employ.find({ role: "user" });
        const responseData = users.map((user_1: any) => {
            return user_1.employ_details;
        });

        res.status(200).json({ okay: true, data: responseData });

    }
    catch(err) {
        next(err) ; 
    }
}

