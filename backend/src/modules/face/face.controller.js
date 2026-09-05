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
            attributes: ["id", "name", "phone", "email"]
        }
    ]
});


        const incomingEmbedding = face_embedding;

        // 1:N identification needs more than "closest wins under the 1:1
        // threshold" — as the tenant's member count grows, the chance that
        // some *wrong* face lands under 0.6 purely by chance goes up. So we
        // track the best AND second-best distance, and require the winner to
        // clear the threshold AND be clearly closer than the runner-up.
        const MATCH_THRESHOLD = 0.5;
        const MIN_MARGIN = 0.08;

        let matchedFace = null;
        let bestDistance = Infinity;
        let secondBestDistance = Infinity;

        for (const faceRecord of registeredFaces) {
            let currentEmbedding = faceRecord.face_embedding;
            if (typeof currentEmbedding === "string") {
                currentEmbedding = JSON.parse(currentEmbedding);
            }

            const { distance } = comapreFaceEmbeddings(
                currentEmbedding,
                incomingEmbedding
            );

            if (distance < bestDistance) {
                secondBestDistance = bestDistance;
                bestDistance = distance;
                matchedFace = faceRecord;
            } else if (distance < secondBestDistance) {
                secondBestDistance = distance;
            }
            console.log(faceRecord.Member?.name, distance);
        }

        const isAmbiguous = (secondBestDistance - bestDistance) < MIN_MARGIN;

        if (!matchedFace || bestDistance > MATCH_THRESHOLD || isAmbiguous) {
            return res.status(401).json({
                success: false,
                message: "Face Id not verified"
            });
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
                distance: bestDistance,

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