import { Router, Request, Response } from "express";
import { login, logout, register, registerUser, userDetails, userList, userStatusUpdate } from "../Controllers/AdminController";
import {errorHandler} from '../Middleware/errorMiddleware'
import { checkAuth } from "../Middleware/checkAuthMiddleware";
import { checkRole } from "../Middleware/checkRoleMiddleware";

const router = Router() ;

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logout)
router.post('/user/register',checkAuth,checkRole,registerUser) ;
router.get('/user/listing',checkAuth,checkRole,userList);
router.get('/user/details/:id',checkAuth,checkRole,userDetails) ;
router.put('/user/update_status/:id',userStatusUpdate) ; // id of employee__details goes here....  


router.use(errorHandler)

export default router;
