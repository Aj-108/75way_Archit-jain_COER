import express,{ Express,NextFunction, Request, Response } from "express";
import jwt,{JwtPayload} from 'jsonwebtoken' ;


export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies.authToken ;   
    const refreshToken = req.cookies.refreshToken ;
    // console.log("authTOken",authToken)
    if(!authToken || !refreshToken){
        return res.status(401).json({message : " Authentication Failed : No authToken or refreshToken is provided "})
    }

    jwt.verify(authToken,process.env.JWT_SECRET_KEY||"",(err:any,decode:any)=>{
        
        if(err) {
            jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET_KEY||"",(refreshErr:any,refreshDecode:any)=> {
                if(refreshErr){
                    return res.status(401).json({message : " Authentication Failed : Both tokens are invalid"}) ;
                }
                else{
                    const newAuthToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_SECRET_KEY||"",{expiresIn : '30m'});
                    const newRefreshToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_REFRESH_SECRET_KEY||"",{expiresIn : '2h'})

                    res.cookie('authToken',newAuthToken,{httpOnly:true}) ;
                    res.cookie('refreshToken',newRefreshToken,{httpOnly : true }) ;
                    console.log(refreshDecode.userId,"liasd")
                    // Object.assign(req,{userId:refreshDecode?.userId})
                    req.userId = refreshDecode.userId ;
                    next() ;
                }
            })
        }
        else{
            req.userId = decode.userId ;
            next() ;
        }
    })
};