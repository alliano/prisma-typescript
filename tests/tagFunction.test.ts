import { PrismaClient } from "@prisma/client";
import { PrismaUtil } from "../src/prismaClient";

describe('Tag Function', function(): void {
    // saat kita membuat query, prisma orm menggunakan
    // konsep tagFunction sebagai berikut
    function tagFunction(array: any, ...arg: any) {
        console.log(array);
        console.log(arg);
    }
    test('Should support tag function', async function() {
        const nama: string = "Alli";
        const age: number = 20;
        // tagFunction`Hallo nama saya ${nama} umur saya ${age}`;
        tagFunction`SELECT * FROM users AS u WHERE u.name = ${nama} AND u.age = ${age}`;
    });

    test('Should support insert data', async function() {
        const prismaClient: PrismaClient = PrismaUtil.getConnection();
        const id: number = 1;
        const name: string = "Alliano";
        await prismaClient.ewallet.deleteMany();
        await prismaClient.users.deleteMany();
        const impactedRows: number = await prismaClient.$executeRaw`INSERT INTO users(id, name) VALUES(${id}, ${name})`;
        expect(impactedRows).toEqual(1);
    });

    test('Shoul support seclect', async function() {
        const id: number = 1;
        const result: Array<string> = await PrismaUtil.getConnection().$queryRaw`SELECT * FROM users AS u WHERE u.id = ${id}`;
        expect(result.length).toEqual(1);
    })
})