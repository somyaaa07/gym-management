import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    branch_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
    type: DataTypes.STRING,
    allowNull: true
},
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('SUPER_ADMIN',
            'ADMIN',
            'MANAGER',
            'TRAINER',
            'RECEPTIONIST',
            'ACCOUNTANT'),
        defaultValue: 'ADMIN'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE',
            'INACTIVE',
            'SUSPENDED'),
        defaultValue: 'ACTIVE'
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
   


}, {
  
        sequelize,
    modelName: 'User',
    tableName: 'users',

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default User;