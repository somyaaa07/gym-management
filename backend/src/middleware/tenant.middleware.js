import { Tenant } from "../model/index.js";
<<<<<<< HEAD
export const tenantMiddleware = async (req, res, next) => {
  try {

    if (!req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: "user is not associated with any tenant",
      });
    }

    const tenant = await Tenant.findByPk(req.user.tenant_id);

    if (tenant === null) {
=======

export const tenantMiddleware = async (req, res, next) => {
  try {
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
>>>>>>> 7b90c13a75692ea5a147bb03c1b36970e89fa5ac
      return res.status(403).json({
        success: false,
        message: "User is not associated with any tenant",
      });
    }

<<<<<<< HEAD
    req.tenant = tenant;
    req.tenant_id = tenant.id;

=======
    const tenant = await Tenant.findByPk(req.user.tenant_id);
    if (!tenant) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with any tenant",
      });
    }

    req.tenant = tenant;
>>>>>>> 7b90c13a75692ea5a147bb03c1b36970e89fa5ac
    next();
  } catch (err) {
    console.log("tenant middleware error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 7b90c13a75692ea5a147bb03c1b36970e89fa5ac
