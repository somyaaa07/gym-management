import { Tenant } from "../model/index.js";

export const tenantMiddleware = async (req, res, next) => {
  try {

    // existing code...

    // Super admins aren't scoped to a single tenant — resolve from the request instead
    if (req.user.role === "SUPER_ADMIN") {
      const tenantId = req.body.tenant_id || req.params.tenantId;

      if (!tenantId) {
        // allow through with no tenant context for routes that don't need one (e.g. GET /users list)
        return next();
      }

      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Tenant not found",
        });
      }

      req.tenant = tenant;
      return next();
    }

    // Regular users (ADMIN, BRANCH_ADMIN, etc.) must belong to a tenant
    if (!req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with any tenant",
      });
    }

    const tenant = await Tenant.findByPk(req.user.tenant_id);
    if (!tenant) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with any tenant",
      });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    console.log("tenant middleware error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
