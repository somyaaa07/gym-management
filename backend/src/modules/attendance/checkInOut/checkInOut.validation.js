import {z} from 'zod';

export const checkInSchema = z.object({
    method:z.enum(['FACE','MANUAL']),
    image:z.string().min(100).optional(),
    member_id:z.string().uuid().optional(),
    branch_id:z.string().uuid()
}).refine(
    (data)=>{
        if(data.method === 'FACE') return !!data.image;
        if(data.method === 'MANUAL') return !!data.member_id;
        return false;
    }, { message: "image is required for FACE method, member_id is required for MANUAL method" }

)

export const checkOutSchema = z.object({
    method:z.enum(['FACE','MANUAL']),
    image:z.string().min(100).optional(),
    member_id:z.string().uuid().optional(),
}).refine(
    (data)=>{
        if(data.method === 'FACE') return !!data.image;
        if(data.method === 'MANUAL') return !!data.member_id;
        return false;
    }, { message: "image is required for FACE method, member_id is required for MANUAL method"
    }
)