// src/routes/kamar.routes.js

import { Router } from "express";
import {
  createKamar,
  getKamarByProperti,
  updateKamar,
  deleteKamar,
  getAllKamars,
} from "../controllers/kamar.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();



router.get("/", [verifyToken], getAllKamars); 


// ===================================
//  RUTE YANG DIPROTEKSI SEMUA USER
// ===================================
// (Semua user yang login boleh melihat daftar kamar)
router.get(
  "/properti/:propertiId", // -> /api/kamar/properti/1
  [verifyToken],
  getKamarByProperti
);

// ===================================
//  RUTE KHUSUS ADMIN
// ===================================
// (Hanya Admin yang boleh Create, Update, Delete)

// POST /api/kamar
router.post("/", [verifyToken, isAdmin], createKamar);

// PUT /api/kamar/1
router.put("/:kamarId", [verifyToken, isAdmin], updateKamar);

// DELETE /api/kamar/1
router.delete("/:kamarId", [verifyToken, isAdmin], deleteKamar);

export default router;
