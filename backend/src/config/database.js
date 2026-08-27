import Sequelize from 'sequelize';
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
{ 
    host:process.env.DB_HOST,
    dialect:'mysql',
    port:process.env.DB_PORT
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
export {sequelize,connectDB}
;