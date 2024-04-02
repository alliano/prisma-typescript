import { PrismaClient, Users } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"
import { randomUUID } from "crypto";

describe('One To One Relationship', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support One to One relationship', async(): Promise<any> => {
        await prismaClient.ewallet.deleteMany();
        await prismaClient.users.deleteMany();
        const user: Users = await prismaClient.users.create({
            data: {
                id: randomUUID().toString().substring(0, 20),
                name: "Alliano",
                ewallet: {
                    create: {
                        id: randomUUID().toString().substring(0, 20),
                        balance: 10.000000
                    }
                }
            },
            include: {
                ewallet: true
            }
        })
        console.log(user);
    });

    test('Should be able find with include', async(): Promise<any> => {
        const user: Users | null = await prismaClient.users.findFirst({
            where: {
                name: "Alliano"
            },
            include: {
                ewallet: true
            }
        })
        console.log(user);
    });

    test('Should can be able find many include', async(): Promise<any> => {
        const user: Array<Users> = await prismaClient.users.findMany({
            where: {
                ewallet: {
                    isNot: null
                }
            },
            include: {
                ewallet: true
            }
        });
        console.log(user);
    })
})