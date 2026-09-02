import {Branch,Tenant,Member} from '../../../model/index.js'
import {memberValidationSchema} from './memberValidation.js'; 

export const createMember = async (req,res)=>{
    try{
        const result = memberValidationSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation error",
                errors:result.error.issues
            })
        }

        const {name,phone,email,date_of_birth,gender,profile_image,address,emergency_contact_name,emergency_contact_phone,joining_date,branch_id} = result.body;
        const tenant_id = req.user.tenant_id;

        const branch = await Branch.findOne({
            where:{
            id:branch_id,
            tenant_id:tenant_id,
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found on the particular tenant"
            })
        }

        const member = await Member.create({
            name:name,
            phone:phone,
            email:email,
            date_of_birth:date_of_birth,
            gender:gender,
            profile_image:profile_image,
            address:address,
            emergency_contact_name:emergency_contact_name,
            emergency_contact_phone:emergency_contact_phone,
            joining_date:joining_date,
            branch_id:branch_id,
            tenant_id:tenant_id

        })

        return res.status(201).json({
            success:true,
            message:"Member created successfully",
            data:{
                name:member.name,
                phone:member.phone,
                email:member.email,
                date_of_birth:member.date_of_birth,
                gender:member.gender,
                profile_image:member.profile_image,
                address:member.address,
                emergency_contact_name:member.emergency_contact_name,
                emergency_contact_phone:member.emergency_contact_phone,
                joining_date:member.joining_date,
                branch_id:member.branch_id,
                tenant_id:member.tenant_id
            }
        })
    }
    catch(err){
        console.log("failed in creating the member",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }

    }


export const getAllMember = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const member_id = req.params.id;

        const member = await Member.findAll({
            where:{
                id:member_id,
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(member.length == 0){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:member
        })
    }
    catch(err){
        console.log("failed in getting the members",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}