import bcrypt from 'bcryptjs';
import {registerSchema,loginSchema} from './auth.validation.js';
import {User} from '../../model/index.js';
import jwt from 'jsonwebtoken'
// import { success } from 'zod';

export const register = async(req,res)=>{
    try{
        const result = registerSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                errors:result.error.issues

            })
        }

        const {name,phone,email,password} = result.data;

        //email already existing or not
        const existingUser = await User.findOne({
            where:{
                email:email
            }
      })
        if(existingUser){
            return res.status(409).json({
                success:false,
                message:"Email already exists"
            })
        }

        //password hashing

        const hashPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            name:name,
            email:email,
            phone:phone,
            password:hashPassword
        })

        return res.status(201).json({
            success:true,
            message:"User resgistered successfully",
               data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
    }
        })

    }
    catch(err){
        console.log("failed to registerUser",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const login = async(req,res)=>{
    try{
        const result = loginSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Invalid input",
                error:result.error.issues
            })
        }

        const {email,password} = result.data;

        const user = await User.findOne({
            where:{email:email}
        })

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                message:"Invalid Password"
            })
        }

        const token = jwt.sign(
            {
                id:user.id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_EXPIRES_IN || '1d'
            }
        )

        return res.status(200).json({
            success:true,
            message:"Login Successful",
            token:token
        })

    }
    catch(err){
        console.log("failed to login",err)
        return res.status(500).json({
            success:false,
            message:"Failed to Login"
        })
    }
}

export const getMe = async(req,res)=>{
    try{
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        console.log(user.toJSON());

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
    return res.status(200).json({
        success:true,
        message:"User details fetched successfully",
        data:{
            id:user.id,
            name:user.name,
            email:user.email,
            phone:user.phone
        }
    })

    }
    catch(err){
        console.log("failed to fetch user details",err)
        return res.status(500).json({
            success:false,
            message:"Failed to fetch user details"
        })
    }
}

export const logout = async(req,res)=>{
    
}