import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 25000,
    timeout: 30000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
});

export default prisma;
