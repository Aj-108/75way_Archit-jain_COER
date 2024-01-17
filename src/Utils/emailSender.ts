import nodemailer from 'nodemailer'

export  const sendMail = (email:String,mailSubject:String,body:String) => {

        const mailData:any = {
            from : process.env.EMAIL_ACC,
            to : email,
            subject : mailSubject,
            text : body
        }

        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.EMAIL_ACC,
                pass : process.env.EMAIL_PASS||""
            }
        })


        transporter.sendMail(mailData,async(err,info)=>{
            if(err){
                console.log(err) ;
                return false ;
            }
            else{
                console.log("Mail sent")
                return true ;   
            }
        })

        return true ;
}


