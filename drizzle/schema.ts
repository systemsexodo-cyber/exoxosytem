import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categorias de produtos/serviços
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Clientes
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  document: varchar("document", { length: 20 }), // CPF/CNPJ
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Produtos e Serviços
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 50 }),
  categoryId: int("categoryId").references(() => categories.id),
  type: mysqlEnum("type", ["product", "service"]).default("product").notNull(),
  price: int("price").notNull(), // Preço em centavos
  unit: varchar("unit", { length: 20 }).default("un").notNull(), // unidade, kg, m, hora, etc
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Pedidos
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull().references(() => customers.id),
  userId: int("userId").notNull().references(() => users.id), // Usuário que criou o pedido
  status: mysqlEnum("status", [
    "pending",      // Pendente
    "confirmed",    // Confirmado
    "processing",   // Em processamento
    "completed",    // Concluído
    "cancelled"     // Cancelado
  ]).default("pending").notNull(),
  totalAmount: int("totalAmount").notNull(), // Total em centavos
  discount: int("discount").default(0).notNull(), // Desconto em centavos
  finalAmount: int("finalAmount").notNull(), // Total final em centavos
  notes: text("notes"),
  deliveryDate: timestamp("deliveryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Itens do Pedido
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id),
  productName: varchar("productName", { length: 200 }).notNull(), // Snapshot do nome
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // Preço unitário em centavos
  totalPrice: int("totalPrice").notNull(), // Total do item em centavos
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
