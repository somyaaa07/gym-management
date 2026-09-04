import {z} from 'zod';

export const faceValidationSchema = z.object({
    face_embedding: z.array(z.number()).length(128)
})

export const verificationFaceValidationSchema = z.object({
    face_embedding: z.array(z.number()).length(128),
});