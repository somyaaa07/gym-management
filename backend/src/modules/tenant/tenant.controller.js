import { tenantSchema } from "./tenant.validation.js";
import { Tenant } from "../../model/index.js";
import { Op } from "sequelize";
export const createTenant = async (req, res)=>{
    try{
        const result  = tenantSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message:"Validation Error",
                errors:result.error.issues
            })
        }

        const {
            name,
            email,
            phone,
            address_line,
            city,
            state,
            postal_code

        } = result.data;

        const exsitingTenant = await Tenant.findOne({
          where:{
            [Op.or]:[{email:email},{phone:phone}]
          }
        })

        if(exsitingTenant){
            return res.status(409).json({
                success:false,
                message:"Tenant with this email or phone already exits"
            })
        }

        const tenant = await Tenant.create({
            name:name,
            email:email,
            phone:phone,
            address_line:address_line,
            city:city,
            state:state,
            postal_code:postal_code


        })

        return res.status(201).json({
            success:true,
            message:"Tenant created successfully",
            data:{
                id:tenant.id,
                name:tenant.name,
               subscription_plan: tenant.subscription_plan,
                max_branches:tenant.max_branches,
                status:tenant.status
            }
        })
    }
    catch(err){
        console.log("failed to create tenant",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getTenant = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const tenant = await Tenant.findByPk(tenant_id);

        if(!tenant){
            return res.status(404).json({
                success:false,
                message:"Tenant not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Tenant fetched successfully",
            data:{
                id:tenant.id,
                name:tenant.name,
                subscription_plan: tenant.subscription_plan,
                max_branches:tenant.max_branches,
                status:tenant.status   
            }
        })

    }
    catch(err){
        console.log("failed to fetch tenant",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}