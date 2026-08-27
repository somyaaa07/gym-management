const health = async(req,res)=>{
    try{
        res.status(200).json({
            success:true,
            message:"Health Server is Up and Running"
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Health Server is Down"
        })
    }
}

export default health;
