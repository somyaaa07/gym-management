import { userSchema } from "./user.validation.js";
import {Tenant,User} from '../../model/index.js';
import bcrypt from "bcryptjs";
export const createUser= async(req,res)=>{
    try{
        const result = userSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                message:"Validation Error",
                errors:result.error.issues

            })
        }

        const{name,email,phone,tenant_id,password} = result.data;

        const tenant = await Tenant.findByPk(tenant_id);

        if(!tenant){
            return res.status(404).json({
                success:false,
                message:"Tenant not found"
            })
        }
        
        const existingUser = await User.findOne({
            where:{
                email:email
            }
        })

        if(existingUser){
            return res.status(409).json({
                success:false,
                message:"User with this email already exists"
            })
        }

        const passwordHashed = await bcrypt.hash(password,10);

        const user = await User.create({
            name:name,
            email:email,
            phone:phone,
            password:passwordHashed,
            tenant_id:tenant_id,
            role:'ADMIN'
        })

        return res.status(201).json({
            success:true,
            message:"User created successfully",
            data:{
                id:user.id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                role:user.role,
                tenant_id:user.tenant_id,
                status:user.status
            }
        })
    }
    catch(err){
        console.log("failed to create user",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}