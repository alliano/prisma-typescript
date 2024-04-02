import { PrismaClient } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient";

describe('Prisma Client', function(): void {
    test('Test prisma client',async () => {
        const prismaClient: PrismaClient = PrismaUtil.getConnection();
        await prismaClient.$connect();
        // do something here
        await prismaClient.$disconnect();
    });

    test('Should support 10 connection pool', async function() {
        const prismaClient: PrismaClient = new PrismaClient({
            errorFormat: "pretty",
            log:[
                "info",
                "query",
                "warn",
                "error"
            ]
        });
        await prismaClient.$connect();
        await prismaClient.$disconnect();
    })
})