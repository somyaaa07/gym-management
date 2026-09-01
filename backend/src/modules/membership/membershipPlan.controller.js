import {Tenant, MembershipPlan} from '../../model/index.js';
import { membershipPlanSchema , membershipPlanUpdateSchema} from './membershipPlan.validation.js';

export const createMembershipPlan = async(req,res)=>{
    try{
        const result = membershipPlanSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:result.error.issues
            })
        }

        const {name,description,duration,duration_unit,price,discount,access_type} = result.data;

        const tenant_id = req.user.tenant_id;
        const tenant = await Tenant.findByPk(tenant_id);
         

        if(!tenant){
            return res.status(404).json({
                success:false,
                message:"Tenant not found"
            })
        }

        const existingPlan = await MembershipPlan.findOne({
            where:{
                tenant_id:tenant_id,
                name:name
            }
        })

        if(existingPlan){
            return res.status(409).json({
                success:false,
                message:"Membership plan already exists"
            })
    }

    const membershipPlan = await MembershipPlan.create({
        tenant_id,
        name:name,
        description:description,
        duration:duration,
        duration_unit:duration_unit,
        price:price,
        discount:discount,
        access_type:access_type,
        status:'ACTIVE'

    })

    return res.status(201).json({
        success:true,
        message:"Membership plan created successfully",
        data:{
            id:membershipPlan.id,
            tenant_id:membershipPlan.tenant_id,
            name:membershipPlan.name,
            description:membershipPlan.description,
            duration:membershipPlan.duration,
            duration_unit:membershipPlan.duration_unit,
            price:membershipPlan.price,
            discount:membershipPlan.discount,
            access_type:membershipPlan.access_type,
            status:membershipPlan.status

        }
    })

}
catch(err){
    console.log("failed to createMembershipPlan",err)
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}}

export const getAllMembershipPlans = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const membershipPlans = await MembershipPlan.findAll({
            where:{
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(membershipPlans.length === 0){
            return res.status(404).json({
                success:false,
                message:"No membership plans found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Membership plans fetched successfully",
            data:membershipPlans
        })
    }
    catch(err){
        console.log("failed to getAllMembershipPlans",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}


export const getMembershipPlanById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const membershipPlan_id = req.params.id;

        const membershipPlan = await MembershipPlan.findOne({
            where:{
                id:membershipPlan_id,
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(!membershipPlan){
            return res.status(404).json({
                success:false,
                message:"Membership plan not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Membership plan fetched successfully",
            data:{
                id:membershipPlan.id,
                tenant_id:membershipPlan.tenant_id,
                name:membershipPlan.name,
                description:membershipPlan.description,
                price:membershipPlan.price,
                duration:membershipPlan.duration,
                status:membershipPlan.status,
                duration_unit:membershipPlan.duration_unit,
                discount:membershipPlan.discount,
                access_type:membershipPlan.access_type
            }
        })
    }
    catch(err){
        console.log("failed to getMembershipPlanById",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const deleteMembershipPlan = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const membershipPlan_id = req.params.id;

        const membershipPlan = await MembershipPlan.findOne({
            where:{
                id:membershipPlan_id,
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(!membershipPlan){
            return res.status(404).json({
                success:false,
                message:"Membership plan not found"
            })
        }

        await membershipPlan.update({
            status:'INACTIVE'
        })
        return res.status(200).json({
            success:true,
            message:"Membership plan deleted successfully"
        })
    }
    catch(err){
        console.log("failed to deleteMembershipPlan",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const updateMembershipPlan = async(req,res)=>{
    try{
        const result = membershipPlanUpdateSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:result.error.issues
            })
        }
        // const {name,description,duration,duration_unit,price,discount,access_type} = result.data;

        const tenant_id = req.user.tenant_id;
        const membershipPlan_id = req.params.id;

        const exisitngMembershipPlan = await MembershipPlan.findOne({
            where:{
                id:membershipPlan_id,
                tenant_id:tenant_id
            }
        })
        if(!exisitngMembershipPlan){
            return res.status(404).json({
                success:false,
                message:"Membership plan not found"
            })
        }

        if(result.data.name){
            const existingPlan = await MembershipPlan.findOne({
                where:{
                    tenant_id:tenant_id,
                    name:result.data.name
                }
            })

            if(existingPlan && existingPlan.id !== membershipPlan_id){
                return res.status(409).json({
                    success:false,
                    message:"Membership plan with this name already exists"
                })
            }
        
        }
            await exisitngMembershipPlan.update(result.data)
            return res.status(200).json({
                success:true,
                message:"membership plan updated successfully",
                data:{
                    id:exisitngMembershipPlan.id,
                    tenant_id:exisitngMembershipPlan.tenant_id,
                    name:exisitngMembershipPlan.name,
                    description:exisitngMembershipPlan.description,
                    price:exisitngMembershipPlan.price,
                    duration:exisitngMembershipPlan.duration,
                    status:exisitngMembershipPlan.status,
                    discount:exisitngMembershipPlan.discount,
                    access_type:exisitngMembershipPlan.access_type,
                    duration_unit:exisitngMembershipPlan.duration_unit

                }
            })
                


    }
    catch(err){
        console.log("failed to updateMembershipPlan",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}