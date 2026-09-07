import axios from 'axios';


export const getFaceEncoding = async(imageBase64)=>{
    const response = await axios.post((process.env.FACE_API_URL || 'http://localhost:8001')+'/encode',{
        image:imageBase64,
    },{
        headers:{
            'X-Internal-Key':process.env.FACE_API_KEY
            
        }
    })

   if (!response.data.success) {
    const error = new Error(response.data.detail || response.data.reason);
    error.reason = response.data.reason;
    throw error;
}
return response.data.encoding;
}