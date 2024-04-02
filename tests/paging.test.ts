import { Customer, PrismaClient } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"

describe('Paging', function(): void {
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

    test('Should support paging', async (): Promise<any> => {
        let customers: Array<Customer> = await prismaClient.customer.findMany({
            // jumlah data yang di skip
            skip: 0,
            // jumlah data yang di ambil/ditampilkan
            take: 1
        });
        expect(customers.length).toBe(1);
        customers = await prismaClient.customer.findMany({
            skip: 1,
            take: 2,
            // melakukan multiple ordering
            orderBy: [
                {
                    email: "asc"
                },
                {
                    name: "desc"
                }
            ]
        }) 
        expect(customers.length).toBe(2);
        customers = await prismaClient.customer.findMany({
            skip: 0,
            take: 3,
            // ordering berdasarkan kolom email dengan strategy descending
            orderBy: {
                email: "desc"
            }
        }) 
        expect(customers.length).toBe(3);
    })
})