import { defineConfig } from "@prisma/migrate";

export default defineConfig({
  schema: "./schema.prisma",
  datasources: {
    db: {
      provider: "mysql",
      url: process.env.DATABASE_URL,
    },
  },
});
