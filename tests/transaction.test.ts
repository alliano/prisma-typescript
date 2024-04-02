import { Customer, PrismaClient } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"

describe('Tansaction', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support sequential transaction', async function(): Promise<any> {
        await prismaClient.customer.deleteMany();
        const [Abdillah, Alli] = await prismaClient.$transaction([
            prismaClient.customer.create({
                data: {
                    name: "Abdillah Alli",
                    email: "abdilah@gmail.com",
                    phone: "029385529082"
                }
            }),
            prismaClient.customer.create({
                data: {
                    name: "Alli",
                    email: "allian@gmail.com",
                    phone: "029385529333"
                }
            }),
        ])
        console.log(Abdillah);
        console.log(Alli);
        // const metricsPrometheus: string = await prismaClient.$metrics.prometheus();
        // console.log(metricsPrometheus);
    })

    // interactive transaction
    test('Should support interactive transaction', async function(): Promise<any> {
        const[customer1, customer2] = await prismaClient.$transaction(async (prisma): Promise<Array<Customer>> => {
            const customer1: Customer = await prisma.customer.create({
                data: {
                    name: "Audia", 
                    email: "audiaalli@gmail.com",
                    phone: "082348729345"
                }
            })
            const customer2: Customer = await prisma.customer.create({
                data: {
                    name: "Naila",
                    email: "abdillahnayila@gmail.com",
                    phone: "082373849204"
                }
            })
            return [customer1, customer2];
        })
        expect(customer1).toEqual({
            id: customer1.id,
            name: "Audia", 
            email: "audiaalli@gmail.com",
            phone: "082348729345"
        })
        expect(customer2).toEqual({
            id: customer2.id,
            name: "Naila",
            email: "abdillahnayila@gmail.com",
            phone: "082373849204"
        })
    })
})