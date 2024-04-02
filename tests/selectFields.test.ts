import { PrismaClient } from "@prisma/client";
import { PrismaUtil } from "../src/prismaClient";

describe('Select Many', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support select many', async(): Promise<any> => {
        await prismaClient.customer.deleteMany();
        const customer = await prismaClient.customer.create({
            data: {
                name: "Naila",
                email: "nailasafa2@gmail.com",
                phone: "082342892345"
            },
            // dengan begini email tidak ikut di di select ketika proses insert selesai
            select: {
                name: true,
                phone: true,
                email: false
            }
        });
        expect(customer).toEqual({
            name: "Naila",
            phone: "082342892345"
        })
        // expect(customer.email).toBeUndefined(); email akan undifined karena nga ikut di select
    })

    test('Should support select count', async (): Promise<any> => {
        const customer: number = await prismaClient.customer.count({
            where: {
                name: "Naila"
            }
        })
        expect(customer).toEqual(1);
    })
});