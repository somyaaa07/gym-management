import { DataTypes,Model } from "sequelize";
import {sequelize} from '../config/database.js';

class memberMembership extends Model {}

memberMembership.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    membership_plan_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    start_date:{
        type:DataTypes.DATE,
        allowNull:false
    },
    end_date:{
        type:DataTypes.DATE,
        allowNull:false
    },
    price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    }
})