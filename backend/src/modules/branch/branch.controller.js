import { branchSchema , updateBranchSchema} from "./branch.validation.js";
import { Tenant, Branch } from "../../model/index.js";

export const createBranch = async (req, res) => {
    try {
        const result = branchSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Validation Error",
                error: result.error.issues
            })
        }

        const {
            name,
            code,
            email,
            phone,
            address_line,
            city,
            state,
            postal_code,
            country,
            opening_time,
            closing_time,
            capacity
        } = result.data;

        const tenant_id = req.user.tenant_id;
        const tenant = await Tenant.findByPk(tenant_id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            })
        }

        const branches = await Branch.findOne({
            where: {
                tenant_id,
                code
            }
        })

        if (branches) {
            return res.status(400).json({
                success: false,
                message: "Branch already exists"
            })
        }

const branch = await Branch.create({
    tenant_id,
    name,
    code,
    email,
    phone,
    address_line,
    city,
    state,
    postal_code,
    country,
    opening_time,
    closing_time,
    capacity
});

        return res.status(201).json({
            success: true,
            message: "Branch created successfully",
            data: {
                id: branch.id,
                tenant_id: branch.tenant_id,
                name: branch.name,
                code: branch.code,
                email: branch.email,
                phone: branch.phone,
                city: branch.city,
                state: branch.state,
                opening_time: branch.opening_time,
                closing_time: branch.closing_time,
                capacity: branch.capacity,
                status: branch.status
            }
        })


    }
    catch (err) {
        console.log("Branch creation error", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const getAllBranches = async(req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;
    const branches = await Branch.findAll({
        where:{
            tenant_id:tenant_id,
            status:true
        }
    })

    return res.status(200).json({
        success:true,
        message:"All branches fetched successfully",
        data:branches
    })
    }
    catch(err){
        console.log("Branch fetching error",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getBranchById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const branch = await Branch.findOne({
            where:{
                id:branch_id,
                tenant_id:tenant_id,
                status:true
            }
        })
        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Branch fetched successfully",
            data:branch
        })
    }
    catch(err){
        console.log("Branch fetching error",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const deleteBranch = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const branch = await Branch.findOne({
            where:{
               id:branch_id,
               tenant_id,
               status:true
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

        branch.update({
            status:false
        })

        return res.status(200).json({
            success:true,
            message:"Branch deleted successfully"
        })
    }
    catch(err){
        console.log("Branch deleting error",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }

}

export const updateBranch = async(req,res)=>{
    try{
        const validateResult = updateBranchSchema.safeParse(req.body);

        if(!validateResult.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:validateResult.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const tenant = await Tenant.findByPk(tenant_id);

        if(!tenant){
            return res.status(404).json({
                success:false,
                message:"Tenant not found"
            })
        }

        const branch = await Branch.findOne({
            where:{
                id:branch_id,
                tenant_id:tenant_id,
                status:true
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

        if(validateResult.data.code){
            const exisitingBranch = await Branch.findOne({
                where:{
                    tenant_id,
                    code:validateResult.data.code
                }
            })

            if(exisitingBranch && exisitingBranch.id !== branch_id){
                return res.status(409).json({
                    success:false,
                    message:"Branch with this code already exists"
                })
            }
        }

        await branch.update(validateResult.data);

        return res.status(200).json({
            success:true,
            message:"Branch updated successfully",
            data:{
                id:branch.id,
                tenant_id:branch.tenant_id,
                name:branch.name,
                code:branch.code,
                phone:branch.phone,
                email:branch.email,
                address_line:branch.address_line,
                city:branch.city,
                state:branch.state,
                country:branch.country,
                postal_code:branch.postal_code,
                opening_time:branch.opening_time,
                closing_time:branch.closing_time,
                capacity:branch.capacity,
                status:branch.status

            }
        })
    }
    catch(err){
        console.log("Branch updating error",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}