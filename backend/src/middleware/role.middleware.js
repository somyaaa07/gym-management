export const roleMiddleware = (...roles) => {
    return (req, res, next) => {

        console.log("Allowed roles:", roles);
        console.log("User role:", req.user.role);

        if (roles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource"
            });
        }
    };
};