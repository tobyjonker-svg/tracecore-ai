import { authRouter } from './routers/auth';
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { billingRouter } from "./routers/billing";
import { paymentRouter } from "./routers/payment";
import { workflowRouter } from "./routers/workflow";
import { productsRouter } from "./routers/products";
import { inputsRouter } from "./routers/inputs";
import { inventoryRouter } from "./routers/inventory";
import { batchesRouter } from "./routers/batches";
import { suppliersRouter } from "./routers/suppliers";
import { alertsRouter } from "./routers/alerts";
import { ordersRouter } from "./routers/orders";
import { productionRouter } from "./routers/production";
import { shipmentsRouter } from "./routers/shipments";
import { aiRouter } from "./routers/ai";
import { profileRouter } from "./routers/profile";
import { woocommerceRouter } from "./routers/woocommerce";
import { integrationsRouter } from "./routers/integrations";
import { adminRouter } from "./routers/admin";
import { trackingRouter } from "./routers/tracking";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  billing: billingRouter,
  payment: paymentRouter,
  workflow: workflowRouter,
  products: productsRouter,
  inputs: inputsRouter,
  inventory: inventoryRouter,
  batches: batchesRouter,
  suppliers: suppliersRouter,
  alerts: alertsRouter,
  orders: ordersRouter,
  production: productionRouter,
  shipments: shipmentsRouter,
  ai: aiRouter,
  profile: profileRouter,
  woocommerce: woocommerceRouter,
  integrations: integrationsRouter,
  admin: adminRouter,
  tracking: trackingRouter,
});

export type AppRouter = typeof appRouter;
