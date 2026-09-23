import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Member extends Model{}

Member.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    user_id:{
        type:DataTypes.UUID,
        allowNull:true,
        unique:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    date_of_birth:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    gender:{
        type:DataTypes.ENUM('female','male','other'),
        allowNull:true
    },
    profile_image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    address:{
        type:DataTypes.STRING,
        allowNull:true
    },
    emergency_contact_name:{
        type:DataTypes.STRING,
        allowNull:true
    },
    emergency_contact_phone:{
        type:DataTypes.STRING,
        allowNull:true
    },
    joining_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('ACTIVE','INACTIVE'),
        allowNull:false,
        defaultValue:'ACTIVE'
    }
   
},{
    sequelize,
    modelName:'Member',
    tableName:'members',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at',
    indexes:[
        { unique:true, fields:['tenant_id','email'], name:'unique_member_email_per_tenant' },
        { unique:true, fields:['tenant_id','phone'], name:'unique_member_phone_per_tenant' }
    ]
})

export default Member;