import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from '../../config/redis.js'

export const authMiddleware = async(req,res,next)=>{
    try{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"Authorization header missing"
        })
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const isBlackListed = await redis.get(`blacklist:${tokenHash}`)

    if(isBlackListed){
        return res.status(401).json({
            success:false,
            message:"Session expired. Please login again"
        })
    }

    req.user = decoded;

    next();
}
catch(err){
    return res.status(401).json({
        success:false,
        message:"Invalid token"
    })
}
}