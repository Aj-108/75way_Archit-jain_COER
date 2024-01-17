import mongoose,{Document,Schema} from 'mongoose'

export interface EmployModel extends Document {
    name : string ,
    email : string ,
    password : string ,
    join_date : Date ,
    birth_date : Date,
    salary : string,
    anniversary_date : String ,
    createdAt : Date ,
    updatedAt : Date  
}



const EmploySchema : Schema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,
    },
    email : {
        type : String ,
        required : true ,
        unique : true ,
    },
    password : {
        type : String ,
        required  : true
    },
    join_date : {
        type: Date,
        default: () => new Date(Date()),
        required : true ,
    },
    birth_date : {
        type : Date ,
        required : true 
    },
    salary : {
        type : Number,
        required : true
    }
    ,
    anniversary_date : {
        type : Date,
        timezone: 'Asia/Kolkata'
    },
    role : {
        type : String ,
        required : true ,
        default : 'user' ,
        enum : ['user','admin']
    },
    employ_details : [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, ref: 'Employ' 
            },
            date : {
                type : Date ,
                default: () => new Date(Date()) ,
            },
            status : {
                type : String ,
                enumn : ["present","absent","on leave","before half day","after half day","short leave"],
                default : 'absent'
            },
            inTime : {
                type : Date ,
                required : true ,
                timezone: 'Asia/Kolkata'
            },
            outTime : {
                type : Date ,
                required : true ,
                timezone: 'Asia/Kolkata'
            },
            salary_deduction : {
                type : Number ,
                default : 0 ,
            },
            leaves : {
                type : Number ,
                default : 0 
            }
        }
    ]
},{ 
    timestamps : true 
})

export default mongoose.model<EmployModel>('Employ',EmploySchema) ;

