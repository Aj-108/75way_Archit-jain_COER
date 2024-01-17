import { Router, Request, Response } from "express";

import {errorHandler} from '../Middleware/errorMiddleware'
import {allUserStatus, fillUserDetails, loginUser, ownDetails, updatePassword, } from "../Controllers/UserController";
import { checkAuth } from "../Middleware/checkAuthMiddleware";
import { checkRole } from "../Middleware/checkRoleMiddleware";

const router = Router() ;


router.post('/login',loginUser)
router.put('/updatePassword/:id',updatePassword)
router.put('/filldetails/:id',checkAuth,fillUserDetails)
router.get('/user_details/:id',checkAuth,ownDetails)
router.get('/user_status',checkAuth,allUserStatus)

router.use(errorHandler)

export default router;
