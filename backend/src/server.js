import app from './app.js';
import {connectDB} from './config/database.js';
import "./jobs/freezeMembershipJob.js";

const PORT = process.env.PORT || 5001;

// const app = express();

const startServer = async ()=>{
await connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
}


startServer();