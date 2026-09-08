import {z} from 'zod';

export const faceValidationSchema = z.object({
    image: z.string().min(100,"No Custom error message")
})

export const verificationFaceValidationSchema = z.object({
    image: z.string().min(100,"No Custom error message")
});