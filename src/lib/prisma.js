// src/lib/prisma.js

import { PrismaClient } from '@prisma/client';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Ekspor instance tunggal (singleton)
export default prisma;