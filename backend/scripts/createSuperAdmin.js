
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/database.js";
import { User } from "../src/model/index.js";

const createSuperAdmin = async () => {
    try {
        await connectDB();

        const existingSuperAdmin = await User.findOne({
            where: {
                role: "SUPER_ADMIN"
            }
        });

        if (existingSuperAdmin) {
            console.log("SUPER_ADMIN already exists.");
            process.exit(0);
        }

        const password = "Admin@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const superAdmin = await User.create({
            name: "Super Admin",
            email: "superadmin@gym.com",
            phone: null,
            password: hashedPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            tenant_id: null,
            branch_id: null
        });

        console.log("SUPER_ADMIN created successfully.");
        console.log({
            id: superAdmin.id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: superAdmin.role
        });

        console.log(`Password: ${password}`);

        process.exit(0);

    } catch (error) {
        console.error("Failed to create SUPER_ADMIN:", error);
        process.exit(1);
    }
};

createSuperAdmin();

