import { DietPlan,Member,DietPlanMeal, } from "../../../model/index.js";
import { createDietPlanSchema,updateDietPlanSchema } from "./dietPlan.validation.js";

export const createDietPlan = async(req,res)=>{
    try{
        const result = createDietPlanSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const {member_id,name,description,goal,start_date,end_date} = result.data;
        
        const member = await Member.findOne({
            where:{
                id:member_id,
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found",
            })
        }

        const branch_id = member.branch_id;

        const dietPlan = await DietPlan.create({
            member_id,
            branch_id,
            tenant_id,
            name,
            description,
            goal,
            start_date,
            end_date,
            status:'ACTIVE'
        })

        return res.status(201).json({
            success:true,
            message:"Diet Plan created successfully",
            data:dietPlan
        })
       
    }
    catch(error){
        console.log("Error in createDietPlan",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getAllDietPlans = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const dietPlans = await DietPlan.findAll({
            where:{
                tenant_id
            }
        })

        if(dietPlans.length === 0){
            return res.status(404).json({
                success:false,
                message:"No diet plans found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Diet plans fetched successfully",
            data:dietPlans
        })
    }
    catch(error){
        console.log("Error in getAllDietPlans",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}


export const getDietPlanById = async(req,res)=>{
    try{
        const dietPlanId = req.params.id;
        const tenant_id = req.user.tenant_id;

        const dietPlan = await DietPlan.findOne({
            where:{
                id:dietPlanId,
                tenant_id
            }
        })

        if(!dietPlan){
            return res.status(404).json({
                success:false,
                message:"Diet plan not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Diet plan fetched successfully",
            data:dietPlan
        })
}
    catch(error){
        console.log("Error in getDietPlanById",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const updateDietPlan = async(req,res)=>{
    try{
        const result = updateDietPlanSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"validation error",
                error:result.error.issues
            })
        }
        const dietPlanId = req.params.id;
        const tenant_id = req.user.tenant_id;

        const existingDietPlan = await DietPlan.findOne({
            where:{
                id:dietPlanId,
                tenant_id
            }
        })

        if(!existingDietPlan){
            return res.status(404).json({
                success:false,
                message:"Diet plan not found"
            })
        }
               const {name,description,goal,start_date,end_date,status} = result.data;


           const newStartDate = start_date ?? existingDietPlan.start_date;
        const newEndDate = end_date ?? existingDietPlan.end_date;

        if (newStartDate > newEndDate) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date"
            });
        }




       await existingDietPlan.update({
           name,
           description,
           goal,
           start_date:newStartDate,
           end_date:newEndDate,
           status
       })

       return res.status(200).json({
            success:true,
            message:"Diet plan updated successfully",
            data:existingDietPlan
       })

    }
    catch(err){
        console.log("Error in updating diet plan",err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const deleteDietPlan = async (req,res)=>{
    try{
        const dietPlanId = req.params.id;
        const tenant_id = req.user.tenant_id;

        const existingDietPlan = await DietPlan.findOne({
            where:{
                id:dietPlanId,
                tenant_id
            }
        })

        if(!existingDietPlan){
            return res.status(404).json({
                success:false,
                message:"Diet plan not found"
            })  
        }

        await existingDietPlan.destroy();

        return res.status(200).json({
            success:true,
            message:"Diet plan deleted successfully"
        })
    }
    catch(err){
        console.log("Error in deleting diet plan",err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getDietPlansByMember = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { memberId } = req.params;

        const dietPlans = await DietPlan.findAll({
            where: { member_id: memberId, tenant_id },
            include: [{ model: DietPlanMeal }],
            order: [['created_at', 'DESC']],
        });

        return res.status(200).json({
            success: true,
            message: "Diet plans retrieved successfully",
            data: dietPlans
        });
    }
    catch (err) {
        console.log("Error retrieving member diet plans", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};