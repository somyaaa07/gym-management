import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MemberFaceID extends Model {}

MemberFaceID.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull:false,
        unique:true
    },
    face_embedding:{
        type:DataTypes.JSON,
        allowNull:false
    },
    embedding_model:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_verified_at:{
        type:DataTypes.DATE,
        // allowNull:false,
        allowNull:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    
    }
    
    // created_at:{
    //     type:DataTypes.DATE,
    //     allowNull:false,
    //     defaultValue:DataTypes.NOW
    
    // },
    // updated_at:{
    //     type:DataTypes.DATE,
    //     allowNull:false,
    //     defaultValue:DataTypes.NOW
    
    // }
},{
    sequelize,
    modelName:"MemberFaceID",
    tableName:"member_faces",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:"updated_at"
})

export default MemberFaceID;