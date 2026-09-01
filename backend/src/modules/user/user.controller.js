import { userSchema ,updateUserSchema} from "./user.validation.js";
import {Tenant,User,Branch} from '../../model/index.js';
import bcrypt from "bcryptjs";
export const createUser = async (req, res) => {
    try {
        const result = userSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: result.error.issues
            });
        }

        const {
            name,
            email,
            phone,
            password,
            tenant_id: bodyTenantId,
            branch_id,
            role
        } = result.data;

        const creatorRole = req.user.role;

        let tenant_id = null;
        let finalBranchId = null;
        let finalRole = role;

        // ==========================================
        // SUPER ADMIN → CREATE ADMIN
        // ==========================================
        if (creatorRole === "SUPER_ADMIN") {

            if (!bodyTenantId) {
                return res.status(400).json({
                    success: false,
                    message: "tenant_id is required"
                });
            }

            if (role !== "ADMIN") {
                return res.status(400).json({
                    success: false,
                    message: "SUPER_ADMIN can only create ADMIN"
                });
            }

            tenant_id = bodyTenantId;
            finalBranchId = null;

            const tenant = await Tenant.findByPk(tenant_id);

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: "Tenant not found"
                });
            }
        }

        // ==========================================
        // ADMIN → CREATE BRANCH USER
        // ==========================================
        else if (creatorRole === "ADMIN") {

            tenant_id = req.user.tenant_id;

            if (!branch_id) {
                return res.status(400).json({
                    success: false,
                    message: "branch_id is required"
                });
            }

            if (role === "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "ADMIN cannot create another ADMIN"
                });
            }

            const branch = await Branch.findOne({
                where: {
                    id: branch_id,
                    tenant_id: tenant_id,
                    status: "ACTIVE"
                }
            });

            if (!branch) {
                return res.status(404).json({
                    success: false,
                    message: "Branch not found"
                });
            }

            finalBranchId = branch_id;
        }

        // ==========================================
        // CHECK DUPLICATE EMAIL
        // ==========================================
        const existingUser = await User.findOne({
            where: {
                tenant_id: tenant_id,
                email: email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // ==========================================
        // HASH PASSWORD
        // ==========================================
        const passwordHashed = await bcrypt.hash(password, 10);

        // ==========================================
        // CREATE USER
        // ==========================================
        const user = await User.create({
            name,
            email,
            phone,
            password: passwordHashed,
            tenant_id,
            branch_id: finalBranchId,
            role: finalRole
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                tenant_id: user.tenant_id,
                branch_id: user.branch_id,
                role: user.role,
                status: user.status
            }
        });

    } catch (err) {
        console.log("Failed to create user", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAllUsers = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        // const branch_id = req.params.id;
        const users = await User.findAll({
            where:{
                tenant_id:tenant_id,
                status:"ACTIVE"

                // branch_id:branch_id
            },
            attributes:{
                exclude:['password']
            }
            
        })

        if(users.length === 0){
            return res.status(404).json({
                success:false,
                message:"No users found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Users retrieved successfully",
            data:users
        })
    }
    catch(err){
        console.log("failed to get users",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getUserById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const user_id = req.params.id;

        const user = await User.findOne({
            where:{
                id:user_id,
                tenant_id:tenant_id,
                status:"ACTIVE"
            },
            attributes:{
                exclude:['password']
            }
        })

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"fetched user successfully",
            data:user
        })
    }
    catch(err){
        console.log("failed to get user",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }

}

export const getUserByBranch = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const branch = await Branch.findOne({
            where:{
                id:branch_id,
                tenant_id:tenant_id,
                status:"ACTIVE"
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

        const user = await User.findAll({
            where:{
                tenant_id:tenant_id,
                branch_id:branch_id,
                status:"ACTIVE"

            },
                attributes:{
                    exclude:['password']
                }
            
        })

        if(user.length === 0){
            return res.status(404).json({
                success:false,
                message:"No users found in this branch"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Users fetched successfully from the particular branch",
            data:user
        })
    }
    catch(err){
        console.log("failed to get users from branch",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const updateUser = async(req,res)=>{
    try{
        const result = updateUserSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                errors:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const user_id = req.params.id;

        const user = await User.findOne({
            where:{
                tenant_id:tenant_id,
                id:user_id,
                status:"ACTIVE"
            }
        })

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        if(result.data.email){
            const existingUser = await User.findOne({
                where:{
                    tenant_id:tenant_id,
                    email:result.data.email,
                    status:"ACTIVE"
                }
            })

            if(existingUser && existingUser.id !== user_id){
                return res.status(409).json({
                    success:false,
                    message:"Email already exists"
                })
            }

        }

        if(result.data.password){
            const passwordHashed = await bcrypt.hash(result.data.password,10);
            result.data.password = passwordHashed;

        }

        await user.update(result.data);

        return res.status(200).json({
            success:true,
            message:"User updated successfully",
            data:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                status:user.status,
            }
        })

    }
    catch(err){
        console.log("failed to update user",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}


export const deleteUser = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const user_id = req.params.id;

        const user = await User.findOne({
            where:{
                id:user_id,
                tenant_id:tenant_id,
                status:"ACTIVE"
            }
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        await user.update({
            status:"INACTIVE"
        })

        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
            
        })
    }
    catch(err){
        console.log("failed to delete user",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}