import express,{ Express,NextFunction, Request, Response } from "express";
import jwt,{JwtPayload} from 'jsonwebtoken' ;
import Employ from '../models/EmploySchema'

export const checkRole =async (req: Request, res: Response, next: NextFunction) =>{
    const user:any =await Employ.findById(req.userId) ;

    if(user.role === "admin"){
        req.isAdmin = true ;
        return next() ;
    }
    req.isAdmin = false ;
    return next() ;
}