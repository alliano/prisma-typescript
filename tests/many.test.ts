import { Customer, PrismaClient } from "@prisma/client";
import { PrismaUtil } from "../src/prismaClient";

describe('Many', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support create many', async (): Promise<any> => {
        await prismaClient.customer.deleteMany();
        const { count } = await prismaClient.customer.createMany({
            data: [
                {
                    name: "Audia",
                    email: "audialli@gmail.com",
                    phone: "092328375422"
                },
                {
                    name: "Ali",
                    email: "alliNayla@gmail.com",
                    phone: "092328375433"
                },
                {
                    name: "safa",
                    email: "safa@gmail.com",
                    phone: "092328375455"
                },
            ]
        });
        expect(count).toEqual(3);
    })

    test('It should support update many', async function(): Promise<any> {
        const { count } = await prismaClient.customer.updateMany({
            data:{
                phone: "019329384562"
            },
            where: {
                email: "alliNayla@gmail.com"
            }
        })
        expect(count).toEqual(1);
    })

    test('Should support select many', async (): Promise<any> => {
        const customers: Array<Customer> = await prismaClient.customer.findMany();
        expect(customers.length).toEqual(3);
    })

    test('Should support delete many', async (): Promise<any> => {
        const { count } = await prismaClient.customer.deleteMany();
        expect(count).toEqual(3);
    })
})