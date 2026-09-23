import express from "express";

import * as UserController from "./user.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

import { roleMiddleware } from "../../middleware/role.middleware.js";

import { tenantMiddleware } from "../../middleware/tenant.middleware.js";

const router = express.Router();

// ==========================================
// CREATE USER / STAFF
// ==========================================
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("ADMIN", "SUPER_ADMIN", "BRANCH_ADMIN"),
  UserController.createUser,
);

// ==========================================
// GET ALL USERS
// ADMIN / SUPER_ADMIN
// ==========================================
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  UserController.getAllUsers,
);

// ==========================================
// GET USERS BY BRANCH
// IMPORTANT: MUST COME BEFORE /:id
// ==========================================
router.get(
  "/branch/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN"),
  UserController.getUserByBranch,
);

// ==========================================
// GET USER BY ID
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN"),
  UserController.getUserById,
);

// ==========================================
// DELETE USER
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("ADMIN", "BRANCH_ADMIN"),
  UserController.deleteUser,
);

// ==========================================
// UPDATE USER
// ==========================================
router.patch(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "BRANCH_ADMIN"),
  UserController.updateUser,
);

export default router;
