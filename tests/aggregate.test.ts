import { PrismaClient, Product } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"

describe('Aggregate', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support Batch insert', async(): Promise<any> => {
        await prismaClient.product.deleteMany();
        const { count } = await prismaClient.product.createMany({
            data: [
                {
                    name: "Siwag",
                    price: 20.000,
                    stock: 200,
                    category: "Pasta Gigi"
                },
                {
                    name: "Ciptadent",
                    price: 15.000,
                    stock: 100,
                    category: "Pasta Gigi"
                },
                {
                    name: "Khaf",
                    price: 50.000,
                    stock: 400,
                    category: "Facial Wash"
                },
                {
                    name: "Jrf",
                    price: 25.000,
                    stock: 300,
                    category: "Facial Wash"
                },
            ]
        });
        expect(count).toEqual(4);
    });

    test('Should support aggregate function', async(): Promise<any> => {
        const { _avg, _max, _min } = await prismaClient.product.aggregate({
            _avg: {
                price: true
            },
            _max: {
                price: true
            },
            _min: {
                price: true
            }
        });
        expect(_avg.price).toEqual(27.5);
        expect(_max.price).toEqual(50);
        expect(_min.price).toEqual(15);
    });

    test('Should support group by function', async(): Promise<any> => {
        // SELECT * FROM 
        const result = await prismaClient.product.groupBy({
            _max: {
                stock: true
            },
            by: [
                "id",
                "name",
                "price",
                "stock"
            ],
            orderBy: {
                stock: "desc"
            }
        })
        expect(result[0].name).toBe("Khaf");
        expect(result[0].stock).toEqual(400);
        expect(result[1].name).toBe("Jrf");
        expect(result[1].stock).toEqual(300);
        expect(result[2].name).toBe("Siwag");
        expect(result[2].stock).toEqual(200);
        expect(result[3].name).toBe("Ciptadent");
        expect(result[3].stock).toEqual(100);
    });

    test('Should support having clause', async function(): Promise<any> {
        const result = await prismaClient.product.groupBy({
            having: {
                stock: {
                    gt: 200
                },
                AND: {
                    price: {
                        gt: 10.000
                    }
                }
            },
            by: [
                "name",
                "category",
                "price",
                "stock"
            ]
        });
        expect(result[0].name).toBe("Khaf");
        expect(result[0].price).toEqual(50.000);
        expect(result[0].stock).toEqual(400);
        expect(result[0].category).toBe("Facial Wash")
        expect(result[1].name).toBe("Jrf");
        expect(result[1].price).toEqual(25.000);
        expect(result[1].stock).toEqual(300);
        expect(result[1].category).toBe("Facial Wash")
    })

    test('Should support Where and condition', async function(): Promise<any> {
        const products: Array<Product> = await prismaClient.product.findMany({
            where: {
                AND: [
                    {
                        category: "Facial Wash"
                    },
                    {
                        price: {
                            gt: 10.000
                        }
                    }
                ]
            },
            orderBy: {
                price: "desc"
            }
        })
        expect(products[0].name).toBe("Khaf");
        expect(products[0].price).toEqual(50.000);
        expect(products[0].stock).toEqual(400);
        expect(products[0].category).toBe("Facial Wash")
        expect(products[1].name).toBe("Jrf");
        expect(products[1].price).toEqual(25.000);
        expect(products[1].stock).toEqual(300);
        expect(products[1].category).toBe("Facial Wash")
    })
})