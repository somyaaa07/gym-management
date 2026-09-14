import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Goal extends Model { }

Goal.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    branch_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    member_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    goal_type: {
        type: DataTypes.ENUM('WEIGHT_LOSS', 'WEIGHT_GAIN', 'FAT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'FITNESS'),
        defaultValue: 'WEIGHT_LOSS',
        allowNull: false
    },
    target_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    target_unit: {
        type: DataTypes.ENUM(
            'KG',
            'PERCENT',
            'REPS',
            'MINUTES'
        ),
        defaultValue: 'KG',
        allowNull: false
    },
    start_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    target_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'ACTIVE',
            'CANCELLED',
            'COMPLETED',
        ),
        defaultValue: 'ACTIVE',
        allowNull:false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    sequelize,
    modelName: 'Goal',
    tableName: 'goals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default Goal;