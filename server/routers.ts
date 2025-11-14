import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCategory(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ============ CUSTOMERS ============
  customers: router({
    list: protectedProcedure
      .input(z.object({
        searchTerm: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllCustomers(input?.searchTerm);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCustomer(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: protectedProcedure
      .input(z.object({
        searchTerm: z.string().optional(),
        categoryId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllProducts(input?.searchTerm, input?.categoryId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.number().optional(),
        type: z.enum(["product", "service"]),
        price: z.number().int().min(0),
        unit: z.string().default("un"),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProduct(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.number().optional(),
        type: z.enum(["product", "service"]).optional(),
        price: z.number().int().min(0).optional(),
        unit: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        customerId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllOrders(input?.status, input?.customerId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderWithDetails(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        paymentMethod: z.enum(["cash", "credit_card", "debit_card", "pix", "bank_transfer", "check", "other"]),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          quantity: z.number().int().min(1),
          unitPrice: z.number().int().min(0),
          notes: z.string().optional(),
        })),
        discount: z.number().int().min(0).default(0),
        notes: z.string().optional(),
        deliveryDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Calcular totais
        const totalAmount = input.items.reduce((sum, item) => 
          sum + (item.quantity * item.unitPrice), 0
        );
        const finalAmount = totalAmount - input.discount;
        
        // Gerar número do pedido
        const orderNumber = `PED-${Date.now()}`;
        
        // Criar pedido
        const orderId = await db.createOrder({
          orderNumber,
          customerId: input.customerId,
          userId: ctx.user.id,
          status: "pending",
          paymentMethod: input.paymentMethod,
          totalAmount,
          discount: input.discount,
          finalAmount,
          notes: input.notes,
          deliveryDate: input.deliveryDate,
        });
        
        // Criar itens do pedido
        for (const item of input.items) {
          await db.createOrderItem({
            orderId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes,
          });
        }
        
        return { id: orderId, orderNumber };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "processing", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrder(input.id, { status: input.status });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOrder(input.id);
        return { success: true };
      }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
