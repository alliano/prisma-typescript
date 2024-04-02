import { PrismaClient, Product_rep } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"

describe('Many To Many', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Test insert product', async(): Promise<any> => {
        await prismaClient.category_Product.deleteMany();
        await prismaClient.category.deleteMany();
        await prismaClient.product_rep.deleteMany();

        await prismaClient.product_rep.createMany({
            data: [
                {
                    name: "Khaf",
                    price: 50.000,
                    stock: 100,
                    id: "P001"
                },
                {
                    name: "Chiken nodle",
                    price: 30.000,
                    stock: 100,
                    id: "P002"
                },
                {
                    name: "Promag",
                    price: 15.000,
                    stock: 200,
                    id: "P003"
                },
                {
                    name: "Samsung Z flip",
                    price: 32.000000,
                    stock: 50,
                    id: "P004"
                },
            ]
        })
    })

    test('Test insert categories', async(): Promise<any> => {
        await prismaClient.category.createMany({
            data: [
                {
                    id: "C001",
                    name: "Skincare"
                },
                {
                    id: "C002",
                    name: "Food"
                },
                {
                    id: "C003",
                    name: "Healthy"
                },
                {
                    id: "C004",
                    name: "Electronic"
                },
            ]
        })
    })

    test('Test insert product_category', async(): Promise<any> => {
        await prismaClient.category_Product.createMany({
            data: [
                {
                    category_id: "C001",
                    product_id: "P001"
                },
                {
                    category_id: "C002",
                    product_id: "P002"
                },
                {
                    category_id: "C003",
                    product_id: "P003"
                },
                {
                    category_id: "C004",
                    product_id: "P004"
                },
            ]
        })
    });

    test('Test find', async(): Promise<any> => {
        const products = await prismaClient.product_rep.findMany({
            orderBy: {
                price: "desc"
            },
            include: {
                category: true
            }
        });
        console.log(products);
    })

    test('Should can be able find unique', async(): Promise<any> => {
        const product: Product_rep | null = await prismaClient.product_rep.findUnique({
            include: {
                category: {
                    include: {
                        category: true
                    }
                }
            },
            where: {
                id: "P001"
            }
        })
        console.log(product);
    })

    test('test', async(): Promise<any> => {
        const result = await prismaClient.$queryRaw`SELECT p.name as productName, p.price AS productPrice, c.name AS categoryName FROM products_rep AS p INNER JOIN category_product AS pc ON(p.id = pc.product_id) INNER JOIN categories AS c ON(c.id = pc.category_id)`;
        console.log(result);
    })
})