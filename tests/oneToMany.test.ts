import { Comment, PrismaClient, Users } from "@prisma/client"
import { PrismaUtil } from "../src/prismaClient"
import { randomUUID } from "crypto";

describe('One To Many', function(): void {
    const prismaClinet: PrismaClient = PrismaUtil.getConnection();
    test('Should support One To Many', async(): Promise<any> => {
        await prismaClinet.comment.deleteMany();
        await prismaClinet.ewallet.deleteMany();
        await prismaClinet.users.deleteMany();
        const user: Users = await prismaClinet.users.create({
            data: {
                id: "001",
                name: "Audia Nayyy",
                comments: {
                    create: [
                        {
                            id: randomUUID().toString().substring(0, 10),
                            title: "Bad Word",
                            content: "Don't say Bad Word in ramadhan brouther,,,, Astagfirullah brouther"
                        },
                        {
                            id: randomUUID().toString().substring(0, 10),
                            title: "Lazy",
                            content: "Don't be Lazy in ramadhan kareem brouther,,,, Astagfirullah brouther"
                        },
                    ]
                }
            },
            include: {
                comments: true
            }
        })
        console.log(user);
    })

    test('Should can be able insert form commnet', async(): Promise<any> => {
        const comment: Comment = await prismaClinet.comment.create({
            data: {
                id: randomUUID().toString().substring(0, 10),
                title: "Hard Work",
                content: "Masyaallah brouther u are so hard work...what u want untill u do hard work brouther..",
                user_id: "001"
            }
        })
        console.log(comment);
        
    })

    test('Should support', async(): Promise<any> => {
        const users: Array<Users> = await prismaClinet.users.findMany({
            where: {
                comments: {
                    some: {
                        content: {
                            contains: "Don't"
                        }
                    }
                }
            },
            include: {
                comments: true
            }
        })
        console.log(users[0]);
        
    })
})