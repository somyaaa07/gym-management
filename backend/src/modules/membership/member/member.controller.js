import {Branch,Member,MemberMembership,MembershipPlan} from '../../../model/index.js'
import {memberValidationSchema,updateMemberValidationSchema} from './memberValidation.js'; 

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

        const {name,phone,email,date_of_birth,gender,profile_image,address,emergency_contact_name,emergency_contact_phone,joining_date,branch_id} = result.data;
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


        const member = await Member.findAll({
            where:{
                
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

export const getMemberById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const member_id = req.params.id;   
const member = await Member.findOne({
    where:{
        tenant_id: tenant_id,
        // branch_id: branch_id,
        id: member_id,
        status: 'ACTIVE'
    },
    include: [
        {
            model: MemberMembership,
            include: [
                {
                    model: MembershipPlan
                }
            ]
        }
    ]
})

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Member fetched successfully",
            data:member
        })
    }
    catch(err){
        console.log("failed in getting the member by it's id",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getBranchMembers = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const members = await Member.findAll({
            where:{
                tenant_id:tenant_id,
                branch_id:branch_id,
                status:'ACTIVE'
            },
            

        })

        if(members.length == 0){
            return res.status(404).json({
                success:false,
                message:"No members found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Members fetched successfully",
            data:members
        })

    }
    catch(err){
        console.log("failed in getting the members of a branch",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getBranchMemberById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.branch_id;
        const member_id = req.params.member_id;

      const branch = await Branch.findOne({
    where: {
        tenant_id: tenant_id,
        id: branch_id
    }
})

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

    const member = await Member.findOne({
    where: {
        tenant_id: tenant_id,
        branch_id: branch_id,
        id: member_id,
        status: 'ACTIVE'
    },
    include: [
        {
            model: MemberMembership,
            include: [
                {
                    model: MembershipPlan
                }
            ]
        }
    ]
})

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Member found",
            data:member
        })
    }
    catch(err){
        console.log("Error in getMemberById",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}

export const deleteMember = async(req,res)=>{
    try{
        
        const member_id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const member = await Member.findOne({
            where:{
                tenant_id:tenant_id,
                id:member_id,
                status:'ACTIVE'
            }
        })

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
            }
        
        await member.update({
            status:'INACTIVE'
        })

        console.log("params:", req.params);
console.log("member_id:", req.params.id);
console.log("tenant_id:", req.user.tenant_id);
        return res.status(200).json({
            success:true,
            message:"Member deleted successfully"
        })
    }
    catch(err){
        console.log("Error in deleteMember",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}

export const updateMember= async(req,res)=>{
    try{
        const result = updateMemberValidationSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation error",
                error:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const memeber_id = req.params.id;
        const {name, email,phone,gender,date_of_birth,joining_date,address,profile_image,emergency_contact_name,emergency_contact_phone,branch_id} = result.data;

        const existingMember = await Member.findOne({
            where:{
                tenant_id:tenant_id,
                id:memeber_id,
                status:'ACTIVE'
            }
        })

        if(!existingMember){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }

        if(branch_id && branch_id != existingMember.branch_id){
        const branch = await Branch.findOne({
            where:{
                tenant_id:tenant_id,
                id:branch_id,
                status:true
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Particular branch not found"
            })
        }
        }

     

        await existingMember.update(result.data);

        return res.status(200).json({
            success:true,
            message:"Member updated successfully",
            data:{
                name:existingMember.name,
                email:existingMember.email,
                phone:existingMember.phone,
                gender:existingMember.gender,
                date_of_birth:existingMember.date_of_birth,
                joining_date:existingMember.joining_date,
                address:existingMember.address,
                profile_image:existingMember.profile_image,
                emergency_contact_name:existingMember.emergency_contact_name,
                emergency_contact_phone:existingMember.emergency_contact_phone,
                branch_id:existingMember.branch_id

            }
        })
    }
    catch(err){
        console.log("failed in updating the member",err);
        return res.status(500).json({
            success:false,
            message:"Failed to update the member"
        })
    }
}