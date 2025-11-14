import { drizzle } from "drizzle-orm/mysql2";
import { categories, customers, products } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Criar categorias
    console.log("Criando categorias...");
    const categoryIds = [];
    
    const cat1 = await db.insert(categories).values({
      name: "Eletrônicos",
      description: "Produtos eletrônicos e tecnologia"
    });
    categoryIds.push(Number(cat1[0].insertId));
    
    const cat2 = await db.insert(categories).values({
      name: "Serviços de Manutenção",
      description: "Serviços de manutenção e reparo"
    });
    categoryIds.push(Number(cat2[0].insertId));
    
    const cat3 = await db.insert(categories).values({
      name: "Consultoria",
      description: "Serviços de consultoria"
    });
    categoryIds.push(Number(cat3[0].insertId));

    // Criar clientes
    console.log("Criando clientes...");
    await db.insert(customers).values([
      {
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 98765-4321",
        document: "123.456.789-00",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        active: true
      },
      {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(21) 97654-3210",
        document: "987.654.321-00",
        address: "Av. Principal, 456",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "20000-000",
        active: true
      },
      {
        name: "Empresa ABC Ltda",
        email: "contato@empresaabc.com.br",
        phone: "(11) 3456-7890",
        document: "12.345.678/0001-90",
        address: "Rua Comercial, 789",
        city: "São Paulo",
        state: "SP",
        zipCode: "04567-890",
        active: true
      }
    ]);

    // Criar produtos
    console.log("Criando produtos...");
    await db.insert(products).values([
      {
        name: "Notebook Dell",
        description: "Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD",
        sku: "NB-DELL-001",
        categoryId: categoryIds[0],
        type: "product",
        price: 350000, // R$ 3.500,00 em centavos
        unit: "un",
        active: true
      },
      {
        name: "Mouse Logitech",
        description: "Mouse sem fio Logitech MX Master 3",
        sku: "MS-LOG-001",
        categoryId: categoryIds[0],
        type: "product",
        price: 45000, // R$ 450,00
        unit: "un",
        active: true
      },
      {
        name: "Teclado Mecânico",
        description: "Teclado mecânico RGB com switches blue",
        sku: "KB-MEC-001",
        categoryId: categoryIds[0],
        type: "product",
        price: 35000, // R$ 350,00
        unit: "un",
        active: true
      },
      {
        name: "Manutenção de Computador",
        description: "Serviço de manutenção preventiva e corretiva",
        sku: "SRV-MAN-001",
        categoryId: categoryIds[1],
        type: "service",
        price: 15000, // R$ 150,00
        unit: "hora",
        active: true
      },
      {
        name: "Instalação de Software",
        description: "Instalação e configuração de software",
        sku: "SRV-INS-001",
        categoryId: categoryIds[1],
        type: "service",
        price: 10000, // R$ 100,00
        unit: "hora",
        active: true
      },
      {
        name: "Consultoria em TI",
        description: "Consultoria especializada em tecnologia da informação",
        sku: "SRV-CON-001",
        categoryId: categoryIds[2],
        type: "service",
        price: 25000, // R$ 250,00
        unit: "hora",
        active: true
      }
    ]);

    console.log("✅ Seed concluído com sucesso!");
    console.log("📊 Dados criados:");
    console.log("  - 3 categorias");
    console.log("  - 3 clientes");
    console.log("  - 6 produtos/serviços");
    
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
