import { Member, HealthProfile,Branch } from '../../model/index.js';
import { sequelize } from '../../config/database.js';
import { healthProfileSchema,updateHealthProfileSchema } from './healthProfile.validation.js';


export const createHealthProfile = async (req, res) => {
    try {
        const result = healthProfileSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: "Validation Error", error: result.error.issues });
        }

        const { member_id, blood_group, medical_condition, allergies, current_medication, injury_history, exercise_restriction, doctor_clearance, doctor_notes } = result.data;

        const tenant_id = req.user.tenant_id;

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id: tenant_id,
                status: 'ACTIVE'
            }
        })

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const existingHealthProfile = await HealthProfile.findOne({
            where: {
                member_id: member_id,
                tenant_id: tenant_id,
            },

        })

        if (existingHealthProfile) {
            return res.status(400).json({ message: "Health Profile already exists" });
        }

        const healthProfile = await HealthProfile.create({
            tenant_id: tenant_id,
            member_id: member_id,
            branch_id: member.branch_id,
            blood_group: blood_group,
            medical_condition: medical_condition,
            allergies: allergies,
            current_medication: current_medication,
            injury_history: injury_history,
            exercise_restriction: exercise_restriction,
            doctor_clearance: doctor_clearance,
            doctor_notes: doctor_notes,
        })

        const createdProfile = await HealthProfile.findOne({
            where: {
                id: healthProfile.id,
                tenant_id: tenant_id
            },
            include: [
                {
                    model: Member,
                    attributes: ['id', 'name', 'phone', 'email', 'gender']
                }
            ]
        });
        return res.status(201).json({
            success: true,
            message: "Health Profile created successfully",
            data: createdProfile
        })
    }
    catch (err) {
        console.log("Error in creating health profile", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const getAllHealthProfiles = async (req, res) => {
    try{
        const tenant_id = req.user.tenant_id;
        
        const healthProfiles = await HealthProfile.findAll({
            where:{
                tenant_id:tenant_id
            },
        include:[{
            model: Member,
            attributes: ['id', 'name', 'phone', 'email', 'gender']
        }]
        })

        if(healthProfiles.length === 0){
            return res.status(404).json({
                success: false,
                message: "No health profiles found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Health profiles fetched successfully",
            data: healthProfiles
        })
    }
    catch(err){
        console.log("Error in fetching health profiles", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const getHealthProfileById = async (req, res) => {
    try{
        const tenant_id = req.user.tenant_id;
        const healthProfileId = req.params.id;

        const healthProfile = await HealthProfile.findOne({
            where:{
                id:healthProfileId,
                tenant_id:tenant_id
            },
            include:[{
                model: Member,
            }]
        })

        if(!healthProfile){
            return res.status(404).json({
                success:false,
                message: "No health profile found"
            })
        }

        return res.status(200).json({
            success:true,
            message: "Health profile fetched successfully",
            data: healthProfile
        })

    }
    catch(err){
        console.log("Error in fetching health profile", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const getHealthProfilesOnBranch = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.id;

        const branch = await Branch.findOne({
            where:{
                id:branch_id,
                tenant_id:tenant_id
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message: "No branch found"
            })
        }

      

        const healthProfiles = await HealthProfile.findAll({
            where:{
                tenant_id:tenant_id,
                branch_id:branch_id
            },
            include:[{
                model: Member,
            }]
        })

        if(healthProfiles.length == 0){
            return res.status(404).json({
                success:false,
                message: "No health profile found"
            })
        }

        return res.status(200).json({
            success:true,
            message: "Health profile fetched successfully",
            data: healthProfiles
        })
    }
    catch(err){
        console.log("Error in fetching health profile", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const updateHealthProfile = async(req,res)=>{
    try{
        const result = updateHealthProfileSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message: "Validation Error",
            })
        }

        const {blood_group,medical_condition,allergies,current_medication,injury_history,exercise_restriction,doctor_clearance,doctor_notes} = result.data;

        const tenant_id = req.user.tenant_id;
        const healthProfileID = req.params.id;

  

        const healthProfile = await HealthProfile.findOne({
            where:{
                id:healthProfileID,
                tenant_id:tenant_id,
               
            }
        })

        if(!healthProfile){
            return res.status(404).json({
                success:false,
                message: "Health Profile not found",
            })
        }

        await healthProfile.update(
            result.data
        )

        return res.status(200).json({
            success:true,
            message: "Health Profile updated successfully",
            data:healthProfile,
        })
    }
    catch(err){
        console.log("Error updating health profile",err)
        return res.status(500).json({
            success:false,
            message: "Internal server error",
        })

    }
}

export const deleteHealthProfile = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const healthProfileID = req.params.id;

        const healthProfile = await HealthProfile.findOne({
            where:{
                id:healthProfileID,
                tenant_id:tenant_id,

            }
        })

        if(!healthProfile){
            return res.status(404).json({
                success:false,
                message: "Health Profile not found",
            })
        }

        await healthProfile.destroy()

        return res.status(200).json({
            success:true,
            message: "Health Profile deleted successfully",
        })
    }
    catch(err){
        console.log("Error deleting health profile",err)
        return res.status(500).json({
            success:false,
            message: "Internal server error",
        })
    }
}