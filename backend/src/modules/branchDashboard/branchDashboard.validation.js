export const branchDashboardValidation = (req, res, next) => {
  try {
    // User must be authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Only Branch Admin
    if (req.user.role !== "BRANCH_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Branch Admin can access branch dashboard",
      });
    }

    // Tenant must exist
    if (!req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: "Tenant is required",
      });
    }

    // Branch must exist
    if (!req.user.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Branch is required",
      });
    }

    next();
  } catch (error) {
    console.error("Branch dashboard validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};