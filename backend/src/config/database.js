import Sequelize from 'sequelize';
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    { 
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        pool: {
            max: 15,        // ek saath max 15 connections
            min: 0,
            acquire: 30000,  // 30 sec tak wait karega connection ke liye
            idle: 10000
        },
        logging: false   // console spam kam karne ke liye (optional)
    }
)

const connectDB = async()=>{
    try{
        await sequelize.authenticate();
        console.log("Database Connection Established successfully")
    }
    catch(error){
        console.log("Unable to connect with the database")
        process.exit(1)
    }
}
export {sequelize,connectDB};