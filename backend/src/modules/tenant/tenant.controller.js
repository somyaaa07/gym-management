import { tenantSchema } from "./tenant.validation.js";
import { Tenant, Branch } from "../../model/index.js";
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

export const getAllTenants = async(req,res)=>{
    try{
        const tenants = await Tenant.findAll({
            order:[['createdAt','DESC']]
        });

        return res.status(200).json({
            success:true,
            message:"Tenants fetched successfully",
            data:tenants.map((tenant)=>({
                id:tenant.id,
                name:tenant.name,
                email:tenant.email,
                phone:tenant.phone,
                address_line:tenant.address_line,
                city:tenant.city,
                state:tenant.state,
                postal_code:tenant.postal_code,
                country:tenant.country,
                subscription_plan:tenant.subscription_plan,
                max_branches:tenant.max_branches,
                status:tenant.status,
                createdAt:tenant.createdAt
            }))
        })
    }
    catch(err){
        console.log("failed to fetch tenants",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
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

export const getTenantDetails = async (req, res) => {
    try {
        const { tenantId } = req.params;

        const tenant = await Tenant.findByPk(tenantId, {
            include: [
                {
                    model: Branch,
                    attributes: [
                        "id",
                        "tenant_id",
                        "name",
                        "code",
                        "phone",
                        "email",
                        "address_line",
                        "city",
                        "state",
                        "postal_code",
                        "country",
                        "opening_time",
                        "closing_time",
                        "status",
                        "capacity"
                    ]
                }
            ]
        });

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tenant details fetched successfully",
            data: {
                id: tenant.id,
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                address_line: tenant.address_line,
                city: tenant.city,
                state: tenant.state,
                postal_code: tenant.postal_code,
                country: tenant.country,
                subscription_plan: tenant.subscription_plan,
                max_branches: tenant.max_branches,
                status: tenant.status,
                createdAt: tenant.createdAt,

                branch_count: tenant.Branches?.length || 0,

                branches: tenant.Branches || []
            }
        });

    } catch (err) {
        console.error("Failed to fetch tenant details:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};