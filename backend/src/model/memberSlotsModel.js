import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MemberSlots extends Model {}

MemberSlots.init({
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull: false,
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull: false,
    },
    branch_id: {
  type: DataTypes.UUID,
  allowNull: true,
},
    slot_start_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    slot_end_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true,
        allowNull:false
    }
},{
    sequelize,
    modelName:'MemberSlots',
    tableName:'member_slots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default MemberSlots