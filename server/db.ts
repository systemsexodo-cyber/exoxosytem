import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  categories, 
  customers, 
  products, 
  orders, 
  orderItems,
  InsertCategory,
  InsertCustomer,
  InsertProduct,
  InsertOrder,
  InsertOrderItem
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORIES ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return Number(result[0].insertId);
}

export async function updateCategory(id: number, category: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(category).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ============ CUSTOMERS ============

export async function getAllCustomers(searchTerm?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (searchTerm) {
    return await db.select().from(customers)
      .where(
        or(
          like(customers.name, `%${searchTerm}%`),
          like(customers.email, `%${searchTerm}%`),
          like(customers.phone, `%${searchTerm}%`),
          like(customers.document, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(customers.createdAt));
  }
  
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return Number(result[0].insertId);
}

export async function updateCustomer(id: number, customer: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(customer).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customers).where(eq(customers.id, id));
}

// ============ PRODUCTS ============

export async function getAllProducts(searchTerm?: string, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (searchTerm) {
    conditions.push(
      or(
        like(products.name, `%${searchTerm}%`),
        like(products.description, `%${searchTerm}%`),
        like(products.sku, `%${searchTerm}%`)
      )
    );
  }
  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }
  
  if (conditions.length > 0) {
    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }
  
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return Number(result[0].insertId);
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ============ ORDERS ============

export async function getAllOrders(status?: string, customerId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }
  if (customerId) {
    conditions.push(eq(orders.customerId, customerId));
  }
  
  if (conditions.length > 0) {
    return await db.select().from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));
  }
  
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderWithDetails(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const order = await getOrderById(id);
  if (!order) return undefined;
  
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const customer = await getCustomerById(order.customerId);
  
  return {
    ...order,
    items,
    customer
  };
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return Number(result[0].insertId);
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(order).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orders).where(eq(orders.id, id));
}

// ============ ORDER ITEMS ============

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(item);
  return Number(result[0].insertId);
}

export async function deleteOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.id, id));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const totalCustomers = await db.select({ count: sql<number>`count(*)` }).from(customers);
  const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
  const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const pendingOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'pending'));
  
  const revenueResult = await db.select({ 
    total: sql<number>`COALESCE(SUM(${orders.finalAmount}), 0)` 
  }).from(orders).where(eq(orders.status, 'completed'));
  
  return {
    totalCustomers: totalCustomers[0]?.count || 0,
    totalProducts: totalProducts[0]?.count || 0,
    totalOrders: totalOrders[0]?.count || 0,
    pendingOrders: pendingOrders[0]?.count || 0,
    totalRevenue: revenueResult[0]?.total || 0
  };
}
