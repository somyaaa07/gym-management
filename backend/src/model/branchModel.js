import { DataTypes,Model } from "sequelize";
import {sequelize} from '../config/database.js';

class Branch extends Model {}

Branch.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    //
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    code:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    address_line:{
        type:DataTypes.STRING,
        allowNull:false
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false
    },
    state:{
        type:DataTypes.STRING,
        allowNull:false
    },
    postal_code:{
        type:DataTypes.STRING,
        allowNull:false
    },
     country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    
    opening_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    closing_time:{
        type:DataTypes.TIME,
        allowNull:false
    }, 
    //
    status:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },
    //
    capacity:{
        type:DataTypes.INTEGER, 
        allowNull:false
    },
    //
  

},{
    sequelize,
    modelName: 'Branch',
    tableName: 'branches',
    timestamps: true,
    underscored: true
})

export default Branch;