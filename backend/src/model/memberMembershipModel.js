import { DataTypes,Model } from "sequelize";
import {sequelize} from '../config/database.js';

class MemberMembership extends Model {}

MemberMembership.init({
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
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    end_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    price:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    discount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:true,
        defaultValue:0
    },
    final_amount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    payment_status:{
        type:DataTypes.ENUM('PAID','PENDING','FAILED'),
        allowNull:false,
        defaultValue:'PENDING'
    },
    auto_renew:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    freeze_start_date:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
    freeze_end_date:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },
   
    status:{
        type:DataTypes.ENUM(
            'ACTIVE',
            'DEACTIVE',
            'FROZEN'
        ),
        allowNull:false,
        defaultValue:'ACTIVE'
    }
},{
    sequelize,
    modelName:'MemberMembership',
    tableName:'member_memberships',
   timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
})

export default MemberMembership;