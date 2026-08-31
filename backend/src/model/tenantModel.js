import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Tenant extends Model {}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address_line: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
    },


    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "SUSPENDED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    subscription_plan: {
      type: DataTypes.ENUM(
        "TRIAL",
        "BASIC",
        "PRO",
        "ENTERPRISE"
      ),
      allowNull: false,
      defaultValue: "TRIAL",
    },
  },
  {
    sequelize,
    modelName: "Tenant",
    tableName: "tenants",
    underscored:true
  }
);

export default Tenant;