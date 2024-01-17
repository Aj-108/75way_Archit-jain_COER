import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(res.headersSent){
        return next(err) ;
    }
    
    res.status(500).json({
        ok : false ,
        message : "Internal server error",
        error : err.message,
    })
};