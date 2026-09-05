import { Member, MemberFaceId ,MemberMembership,MembershipPlan} from "../../model/index.js";
import { faceValidationSchema, verificationFaceValidationSchema } from "./faceValidation.js";
import {comapreFaceEmbeddings} from '../../services/faceRecoginition.services.js'
export const createFaceId = async (req, res) => {
    try {
        const result = faceValidationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Valdation Error",
                error: result.error.issues
            })
        }

        const { face_embedding } = result.data;

        const tenant_id = req.user.tenant_id;
        const member_id = req.params.id;

        const member = await Member.findOne({
            where: { id: member_id, tenant_id: tenant_id }
        })

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",

            })
        }

        const existingFaceId = await MemberFaceId.findOne({
            where: {
                member_id: member_id,
                tenant_id: tenant_id
            }
        })

        if (existingFaceId) {
            return res.status(409).json({
                success: false,
                message: "FaceId already exists"
            })
        }

        const faceId = await MemberFaceId.create({
            member_id: member_id,
            tenant_id: tenant_id,
            face_embedding: face_embedding,
            embedding_model: "face-api.js"
        })
        const faceData = await MemberFaceId.findOne({
            where: {
                id: faceId.id
            },
            include: [
                {
                    model: Member,
                    attributes: [
                        "id",
                        "name",
                        "phone",
                        "email",
                        "branch_id",
                        "status"
                    ]
                }
            ]
        })

        return res.status(201).json({
            success: true,
            message: "FaceId created successfully",
            data: faceData
        })

    }
    catch (err) {
        console.log("error in creating faceId", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const verifyFaceId = async (req, res) => {
    try {
        const result = verificationFaceValidationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues
            })
        }

        const { face_embedding } = result.data;

        const tenant_id = req.user.tenant_id;

        const registeredFaces = await MemberFaceId.findAll({
            where: {
                tenant_id,
                is_active: true
            },
            include: [
                {
                    model: Member,
                    attributes: ["id", "name", "phone", "email"],
                    include: [
                        {
                            model: MemberMembership,
                            where:{
                                status:'ACTIVE'
                            },
                            include: [
                                {
                                    model: MembershipPlan,

                                }
                            ]
                        }
                    ]
                }
            ]
        });


        const incomingEmbedding = face_embedding;
        let matchedFace = null;
for (const faceRecord of registeredFaces) {
    let currentEmbedding = faceRecord.face_embedding;
    if (typeof currentEmbedding === "string") {
     currentEmbedding = JSON.parse(currentEmbedding);
}

    console.log("========== FACE DEBUG ==========");
    console.log("Registered embedding:", currentEmbedding);
    console.log("Registered type:", typeof currentEmbedding);
    console.log("Registered is array:", Array.isArray(currentEmbedding));
    console.log("Registered length:", currentEmbedding?.length);

    console.log("Incoming type:", typeof incomingEmbedding);
    console.log("Incoming is array:", Array.isArray(incomingEmbedding));
    console.log("Incoming length:", incomingEmbedding?.length);
    console.log("================================");

    const Validationresult = comapreFaceEmbeddings(
        currentEmbedding,
        incomingEmbedding
    );

    if (Validationresult.matched) {
        matchedFace = faceRecord;
        break;
    }
}

        if (!matchedFace) {
            return res.status(401).json({
                success: false,
                message: "Face Id not verified"
            })
        }
        await matchedFace.update({
            last_verified_at: new Date()
        });


        return res.status(200).json({
            success: true,
            message: "Face Id verified",
            data: {
                face_id: matchedFace.id,
                member_id: matchedFace.Member.id,
                member_name: matchedFace.Member.name,
                member_phone: matchedFace.Member.phone,
                member_email: matchedFace.Member.email,

                membership: matchedFace.Member.MemberMemberships
            }
        })
    }
    catch (err) {
        console.log("Error in verifying face id", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}