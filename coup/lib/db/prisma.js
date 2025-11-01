import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

globalThis.prismaGlobal = globalThis.prismaGlobal || {};

const prisma = globalThis.prismaGlobal.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal.prisma = prisma;

export default prisma;
