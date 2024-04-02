# Setup
``` sh
npm init
```

``` sh
npm install @types/jest --save-dev
```

``` sh
npm install babel-jest @babel/preset-env --save-dev      
```

``` sh
npm install typescript --save-dev
```
``` sh
tsc --init
```

set up `babel.config.json`
``` json
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-typescript"
    ]
}
```

set up `package.json`
``` json
  "jest": {
    "transform": {
      "^.+\\.[t|j]sx?$": "babel-jest"
    }
  },
  "type": "module"
```

set up `tsconfig.json`
``` json
"include": ["./src/**/*", "./tests/**/*.test.ts"]
"module": "ES6"
```

# install prisma orm
``` bash
npm install prisma typescript ts-node @types/node --save-dev
```

# create prisma project
``` sh
npx prisma init
```

# setup database use docker compose
``` yaml
version: '1.9'
services:
  mysql:
    image: mysql:latest
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=bagatal
      - MYSQL_USER=alliano-dev
      - MYSQL_PASSWORD=bagatal
      - MYSQL_DATABASE=ts_prisma_orm
    volumes:
      - pg_volume:/var/lib/mysql
volumes:
  pg_volume : {}
```

# create connection
setup `.env`
``` env
DATABASE_URL="mysql://root:bagatal@localhost:3306/ts_prisma_orm?schema=public"
```

setup `schema.prisma`
``` ts
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

# Create table
``` sql
CREATE TABLE users(
    id VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    PRIMARY KEY (id)
)ENGINE =InnoDb;
```

``` ts
model users {
  id String @id
  name String
}
```

``` sh
npx prisma generate
```

# Prisma Client
Object prisma client sanagtlah besar, lebih baik dibuat 1x
``` ts
export class PrismaUtil {
    private static prismaClient?: PrismaClient;
    /**
     * dengan begini object PrismaClient
     * akan dibuat denga pateren singleton
     * artinya object dari PrismaClient hanya akan dibuat
     * 1xz
     * */
    public static getConnection(): PrismaClient {
        if (this.prismaClient == undefined){
            return new PrismaClient();
        }
        else {
            return this.prismaClient;
        }
    }
}
```
``` ts
describe('Prisma Client', function(): void {
    test('Test prisma client',async () => {
        // dengan begini object PrismaClient hanya dibuat 1x
        const prismaClient: PrismaClient = PrismaUtil.getConnection();
        await prismaClient.$connect();
        // do something here
        await prismaClient.$disconnect();
    })
})
```

# PrismaClient Configuration
kita bisa melakukan konfigurasi connection pool dengan menggunakan url connection pada `.env`
``` env
DATABASE_URL="mysql://root:bagatal@localhost:3306/ts_prisma_orm?schema=public&connection_limit=30"
```

``` ts
describe('Prisma Client', function(): void {
    test('Should support 10 connection pool', async function() {
        const prismaClient: PrismaClient = new PrismaClient({
            errorFormat: "pretty",
            log:[
                "info",
                "query",
                "warn",
                "error"
            ]
        });
        await prismaClient.$connect();
        await prismaClient.$disconnect();
    })
})
```

# Tag Function
``` ts
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
})
```

# Insert
untuk melakukan insert kita bisa menggunakan `$executeRaw`. `$executeRaw`sudah aman dari SQL INJECTION
``` ts
describe('Tag Function', function(): void {
    test('Should support insert data', async function() {
        const id: number = 1;
        const name: string = "Alliano";
        const impactedRows: number = await PrismaUtil.getConnection().$executeRaw`INSERT INTO users(id, name) VALUES(${id}, ${name})`;
        expect(impactedRows).toEqual(1);
    })
})
```

# Query SQL
untuk melakukan select kita bisa menggunakan `$queryRaw`. `$queryRaw`sudah aman dari SQL INJECTION
``` ts
describe('Tag Function', function(): void {
    test('Shoul support seclect', async function() {
        const id: number = 1;
        const result: Array<string> = await PrismaUtil.getConnection().$queryRaw`SELECT * FROM users AS u WHERE u.id = ${id}`;
        expect(result).toEqual([{
            id: "1",
            name: "Alliano"
        }]);
    })
})
```

# Prisma ORM
Menggunakan Prisma sebenarnya akan sangat jarang kita menggunakan Raw SQL seperti pada materi-materi sebelumnya.  
Oleh karena itu, mulai sekarang kita akan fokus membahas fitur ORM di Prisma nya

# Model
Saat membuat table di database, maka kita perlu membuat model di Prisma, hal ini agar kode untuk memanipulasi data model tersebut di generate oleh Prisma CLI sehingga bisa digunakan menggunakan Prisma Client  
Untuk membuat model, kita bisa membuat model file prisma schema  
Nama model akan menjadi nama table di database, jika kita ingin mengubahnya, kita bisa gunakan @@map(“namatable”)  
Kolom yang boleh null, kita perlu tandai dengan ? (tanda tanya)  
Untuk kolom Primary Key, perlu kita tandai dengan @id  
Setelah mengubah model, jangan lupa untuk generate Prisma Client menggunakan perintah : npx prisma generate

``` sql
CREATE TABLE customers(
    id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(12) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT unique_email_customer UNIQUE (email),
    CONSTRAINT unique_phone_customer UNIQUE (phone)
)ENGINE=InnoDB;
```

``` ts
model Customer {
  id    Int @id @default(autoincrement())
  name  String @db.VarChar(100)
  email String @db.VarChar(50) @unique
  phone String @db.VarChar(12) @unique
  @@map("customers")
}
```

# CRUD
``` ts
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
    })
})
```

# Transaction
``` ts
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
```

# batch
``` ts
describe('Many', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support create many', async (): Promise<any> => {
        await prismaClient.customer.deleteMany();
        // batch insert
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
      // batch update
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
      // select all
        const customers: Array<Customer> = await prismaClient.customer.findMany();
        expect(customers.length).toEqual(3);
    })

    test('Should support delete many', async (): Promise<any> => {
      // batch delete
        const { count } = await prismaClient.customer.deleteMany();
        expect(count).toEqual(3);
    })
})
```

# Paging
``` ts
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
```

# Select fields
``` ts
describe('Select Many', function(): void {
    const prismaClient: PrismaClient = PrismaUtil.getConnection();
    test('Should support select many', async(): Promise<any> => {
        await prismaClient.customer.deleteMany();
        const customer = await prismaClient.customer.create({
            data: {
                name: "Naila",
                email: "nailasafa2@gmail.com",
                phone: "082342892345"
            },
            // dengan begini email tidak ikut di di select ketika proses insert selesai
            select: {
                name: true,
                phone: true,
                email: false
            }
        });
        expect(customer).toEqual({
            name: "Naila",
            phone: "082342892345"
        })
        // expect(customer.email).toBeUndefined(); email akan undifined karena nga ikut di select
    })

    test('Should support select count', async (): Promise<any> => {
        const customer: number = await prismaClient.customer.count({
            where: {
                name: "Naila"
            }
        })
        expect(customer).toEqual(1);
    })
});
```

# Aggregate Function
``` ts
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
})
```
# Group By
``` ts
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
    })
})
```
# Having Clause
``` ts
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
})
```

# Where and Condition
``` ts
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
```

# Prisma Schema
Sebelumnya kita sudah membuat model di Prisma Schema, sekarang kita akan bahas lebih detail tentang Prisma Schema  
Prisma Schema berisikan informasi tentang database yang digunakan oleh Prisma Client, dari mulai koneksi sampai model data  
Hal ini digunakan untuk men-generate kode Prisma Client 
Semua detail referensi Prisma Schema bisa kita baca disini : 
https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference 

# Model
Saat kita membuat model di Prisma Schema, kita harus memiliki sebuah field/column yang unique
Biasanya berupa primary key  
Dan untuk model field pada model merepresentasikan nama kolom table didalam database  
https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model 

# Data Type
Setiap kita menambahkan field di Model, kita harus menentukan tipe data yang akan digunakan  
Jika file tersebut nullable maka tambahkan ? (tanda tanya) pada filed tersebut  
Ada banyak sekali tipe data yang didukung oleh Prisma Schema, kita bisa melihatnya di halaman dokumentasi nya
https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-scalar-types 

# Model Attribute
Saat kita membuat model, kadang ada informasi tambahan yang perlu kita beritahu ke Prisma Schema  
Contoh sebelumnya misal kita ingin membuat nama model berbeda dengan nama table, maka kita gunakan @@map()  
Masih banyak model attribute yang bisa kita gunakan, kita bisa lihat di dokumentasinya   
https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#attributes 

# Enum
Di database MySQL dan PostgreSQL, kita bisa membuat tipe data Enum
Kita juga bisa memberi tahu tentang enum di Prisma Schema
Kita bisa membuat enum seperti pada dokumentasinya :  
https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#enum 

# One To One Relationshep
``` sql
CREATE TABLE users(
    id VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    PRIMARY KEY (id)
)ENGINE =InnoDb;

CREATE TABLE ewallet(
    id VARCHAR(50) NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    user_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT ewallet_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id)
)ENGINE=InnoDB;
```

``` ts
model Users {
  id      String @id
  name    String
  ewallet Ewallet?
  @@map("users")
}

model Ewallet {
  id      String @unique
  balance Int @default(0)
  user_id String @unique
  user    Users @relation(fields: [user_id], references: [id])
  @@map("ewallet")
}
```

``` ts
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
```

# One TO Many Relationsip
``` sql
CREATE TABLE comments(
    id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT coment_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id)
)ENGINE=InnoDB;
```

``` ts
model Users {
  id        String @id
  name      String
  ewallet   Ewallet?
  comments  Comment[]
  @@map("users")
}

model Comment {
  id      String @id @unique
  title   String @db.VarChar(255)
  content String @db.LongText
  user_id String @unique
  user Users @relation(fields: [user_id], references: [id])
  @@map("comments")
}
```

``` ts
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
```

# Many To Many
``` sql
CREATE TABLE categories(
    id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY(id)
)ENGINE=InnoDB;

CREATE TABLE category_product(
    category_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    CONSTRAINT category_id_fk FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT product_id_fk FOREIGN KEY (product_id) REFERENCES products_rep(id)
)ENGINE=InnoDB;

CREATE TABLE products_rep(
    id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    PRIMARY KEY (id)
)ENGINE=InnoDB;
```
``` ts
model Product_rep {
  id        String              @db.VarChar(100) @id
  name      String              @db.VarChar(100)
  price     Int                 @default(0)
  stock     Int                 @default(0)
  category  Category_Product[]
  @@map("products_rep")
}
// junction Table
model Category_Product {
  category_id     String      @db.VarChar(100)
  product_id      String      @db.VarChar(100)
  product         Product_rep @relation(fields: [product_id], references: [id])
  category        Category    @relation(fields: [category_id], references: [id])

  @@id([category_id, product_id])
  @@map("category_product")
}

model Category {
  id      String             @db.VarChar(100) @id
  name    String             @db.VarChar(100)
  product Category_Product[]
  @@map("categories")
}
```
``` ts
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

    test('test select manual', async(): Promise<any> => {
        const result = await prismaClient.$queryRaw`SELECT p.name as productName, p.price AS productPrice, c.name AS categoryName FROM products_rep AS p INNER JOIN category_product AS pc ON(p.id = pc.product_id) INNER JOIN categories AS c ON(c.id = pc.category_id)`;
        console.log(result);
    })
})
```

# Prisma migrate
Sampai sekarang, kita selalu membuat table secara manual  
Prisma sendiri memiliki fitur Prisma Migrate, dimana kita bisa membuat database migration untuk membuat schema database menggunakan Prisma  
Keuntungan menggunakan Prisma Migrate adalah, kita tidak perlu mengeksekusi perintah SQL untuk membuat schema database secara manual lagi  

# Mental Migration
* Model/Entity-first migration, yaitu dimana programmer biasa membuat Model terlebih dahulu, lalu Prisma Migrate akan membuatkan perintah SQL DDL nya. Cara ini biasanya digunakan ketika membuat aplikasi baru atau melakukan perubahan baru  
* Database-first migration, yaitu dimana programmer biasa membuat SQL DDL nya terlebih dahulu, lalu menggunakan Prisma Migrate untuk melakukan introspect database untuk membuat model sesuai dengan database. Cara ini biasanya dilakukan ketika menggunakan Prisma untuk database yang sudah ada

# Model first migration
generate file migration
``` sh
npx prisma migrate dev --create-only --name new_migration
```
execute file migration
``` sh
npx prisma migrate dev
```

# Database First Migration
Database-first Migration adalah kebalikan dari Model-first Migration
Ini biasanya dilakukan ketika database nya sudah ada, dan kita ingin menggunakan Prisma untuk mengelola database nya  
Untuk membuat model dari schema database yang sudah ada, kita bisa gunakan perintah :
``` sh
npx prisma db pull
```
maka model schema prisma akan dibuatkan sesuai dengan desain table database database

# Migration Information
Prisma Migrate melakukan maintain versi file migrasi yang sudah dieksekusi secara otomatis menggunakan table _prisma_migrations  
Setiap file migration yang sudah dieksekusi, maka kita tidak boleh mengubahnya lagi, hal ini dikarenakan file migration yang sudah dieksekusi tidak akan pernah dijalankan lagi, jadi percuma saja mengubah file migration lama  
Selain itu, informasi checksum file migration disimpan di table _prisma_migrations, jadi jika sampai kita ubah, maka akan terjadi error karena checksum nya akan berubah  

# Prisma studio
Prisma Studio adalah fitur yang bisa kita gunakan untuk menjalankan web visual untuk memanipulasi data di database berdasarkan Prisma Schema  
Ini sangat cocok dalam proses development ketika kita ingin mudah melihat atau mengubah data di database, tanpa harus menggunakan perintah SQL  
Kita bisa jalankan Prisma Studio dengan perintah :  
``` sh
npx prisma studio
```
Secara otomatis akan menjalankan web di localhost port 5555