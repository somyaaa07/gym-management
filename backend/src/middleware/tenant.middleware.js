import { Tenant } from "../model/index.js";
export const tenantMiddleware = async(req,res,next)=>{
    try{
        if(!req.user.tenant_id){
            return res.status(403).json({
                success:false,
                message:"user is not associated with any tenant"
            })
        }
      
        const tenant = await Tenant.findByPk(req.user.tenant_id);

        if(tenant===null){
            return res.status(403).json({
                success:false,
                message:"User is not associated with any tenant"
            })
        }

        req.tenant = tenant;

        next();
        
    }
    catch(err){
        console.log("tenant middleware error",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}