
import {
    Member,
    MemberFaceId,
    MemberMembership,
    MembershipPlan
} from "../../model/index.js";

import {
    faceValidationSchema,
    verificationFaceValidationSchema
} from "./faceValidation.js";

import { getFaceEncoding } from "../../services/faceEncoding.services.js";
import { findMatchingFace } from "../../services/faceMatching.services.js";


export const createFaceId = async (req, res) => {
    try {
        const result = faceValidationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: result.error.issues
            });
        }

        const { image } = result.data;

        const tenant_id = req.user.tenant_id;
        const member_id = req.params.id;

        const face_embedding = await getFaceEncoding(image);

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id
            }
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        const existingFaceId = await MemberFaceId.findOne({
            where: {
                member_id,
                tenant_id
            }
        });

        if (existingFaceId) {
            return res.status(409).json({
                success: false,
                message: "FaceId already exists"
            });
        }

        const faceId = await MemberFaceId.create({
            member_id,
            tenant_id,
            face_embedding,
            embedding_model: "face_recognition"
        });

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
        });

        return res.status(201).json({
            success: true,
            message: "FaceId created successfully",
            data: faceData
        });

    } catch (err) {
        console.log("Error in creating faceId", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const verifyFaceId = async (req, res) => {
    try {
        const result = verificationFaceValidationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues
            });
        }

        const { image } = result.data;

        const face_embedding = await getFaceEncoding(image);

        const tenant_id = req.user.tenant_id;

        const registeredFaces = await MemberFaceId.findAll({
            where: {
                tenant_id,
                is_active: true
            },
            include: [
                {
                    model: Member,
                    attributes: [
                        "id",
                        "name",
                        "phone",
                        "email"
                    ]
                }
            ]
        });

        const incomingEmbedding = face_embedding;

        const {
            matchedFace,
            bestDistance,
            isMatch
        } = findMatchingFace(
            incomingEmbedding,
            registeredFaces
        );

        if (!isMatch) {
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
                distance: bestDistance
            }
        });

    } catch (err) {
        console.log("Error in verifying face id", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};