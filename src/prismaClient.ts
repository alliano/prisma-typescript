import { PrismaClient } from "@prisma/client";

export class PrismaUtil {
    private static prismaClient?: PrismaClient;
    public static getConnection(): PrismaClient {
        if (this.prismaClient == undefined){
            return new PrismaClient({
                errorFormat: "pretty",
                log:[
                    "info",
                    "query",
                    "warn",
                    "error"
                ]
            });
        }
        else {
            return this.prismaClient;
        }
    }
}