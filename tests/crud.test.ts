import { Customer, PrismaClient } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"

describe('CRUD', function() {
    // Create atau insert data customer baru menggunakan fitur ORM prisma
    test('Should support Insert', async function() {
        await PrismaUtil.getConnection().customer.deleteMany();
        const customer: Customer = await PrismaUtil.getConnection().customer.create({
            data: {
                name: "Audia",
                email: "audia221@gmail.com",
                phone: "+62912341243"
            }
        })
        expect(customer).toEqual({
            id: customer.id,
            name: "Audia",
            email: "audia221@gmail.com",
            phone: "+62912341243"
        })
    })

    // Update
    test('Should support Update', async function() {
        const email: string = "audia221@gmail.com";
        const name: string = "Audia Safa"
        const customer: Customer = await PrismaUtil.getConnection().customer.update({
            data: {
                name: name
            },
            where: {
                email: email 
            }
        })
        expect(customer).toEqual({
            id: customer.id,
            name: name,
            email: email,
            phone: "+62912341243"
        })
    })

    // Find OR Select
    test('Should support find or select', async function() {
        const email: string = "audia221@gmail.com"
        const customer: Customer | null = await PrismaUtil.getConnection().customer.findUnique({
            where: {
                email: email
            }
        })
        expect(customer).toEqual({
            id: customer?.id,
            name: "Audia Safa",
            email: email,
            phone: "+62912341243"
        })
    })

    // Delete
    test('Should support delete', async function() {
        const customerDeleted: Customer | null = await PrismaUtil.getConnection().customer.delete({
            where: {
                email: "audia221@gmail.com"
            }
        })
        expect(customerDeleted).toEqual({
            id: customerDeleted?.id,
            name: "Audia Safa",
            email: "audia221@gmail.com",
            phone: "+62912341243"
        })
    });
})