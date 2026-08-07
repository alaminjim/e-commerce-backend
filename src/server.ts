import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const start = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

void start();

const shutdown = () => {
  void prisma.$disconnect().finally(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
