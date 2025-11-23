// src/routes/properti.routes.js

import { Router } from "express";
// Impor semua controller yang baru kita buat
import {
  createProperti,
  getAllProperti,
  getPropertiById,
  updateProperti,
  deleteProperti,
} from "../controllers/properti.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// === Rute Khusus Admin ===
// POST /api/properti (Create)
router.post("/", [verifyToken, isAdmin], createProperti);

// PUT /api/properti/1 (Update)
router.put("/:id", [verifyToken, isAdmin], updateProperti);

// DELETE /api/properti/1 (Delete)
router.delete("/:id", [verifyToken, isAdmin], deleteProperti);

// === Rute Untuk Semua User (Termasuk Penyewa) ===
// GET /api/properti (Read All)
router.get("/", [verifyToken], getAllProperti);

// GET /api/properti/1 (Read By ID)
router.get("/:id", [verifyToken], getPropertiById);

export default router;
