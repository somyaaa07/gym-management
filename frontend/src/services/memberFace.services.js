export const registerMemberFace = async(memberId,faceEmbedding)=>{
    const token = localStorage.getItem("ironline_token");
    const response = await fetch(`http://localhost:5001/api/v1/member-faceId/${memberId}`,{
        method:'POST',
     headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
},
        body:JSON.stringify({
            face_embedding:faceEmbedding
        })
   }  
 )

 const data = await response.json()

 return data;

}

export const verifyMemberFace = async(faceEmbedding)=>{
    const token = localStorage.getItem("ironline_token");
    const response = await fetch(`http://localhost:5001/api/v1/member-faceId/verify`,{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body:JSON.stringify({
            face_embedding:faceEmbedding
        })
        }
    )
    const data = await response.json()

    return data;
    }