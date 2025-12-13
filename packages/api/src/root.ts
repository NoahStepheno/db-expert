import { authRouter } from "./router/auth";
import { projectRouter } from "./router/project";
import { chatRouter } from "./router/chat";
import { aiRouter } from "./router/ai";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  project: projectRouter,
  chat: chatRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
