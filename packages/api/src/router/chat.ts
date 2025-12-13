import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { desc, eq, and } from "@acme/db";

import {
  chats, chatMessages, projects,
  CreateChatSchema, CreateChatMessageSchema
} from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const chatRouter = {
  create: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      data: CreateChatSchema
    }))
    .mutation(async ({ ctx, input }) => {
      // Check project ownership
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.ownerId, ctx.session.user.id)
        )
      });
      if (!project) throw new Error("Project not found or access denied");

      return ctx.db.insert(chats).values({
        ...input.data,
        projectId: input.projectId,
      });
    }),

  listByProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.ownerId, ctx.session.user.id)
        )
      });
      if (!project) return [];

      return ctx.db.query.chats.findMany({
        where: eq(chats.projectId, input.projectId),
        orderBy: desc(chats.updatedAt),
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, input.id),
        with: {
          messages: true,
          project: true, // Need project to verify owner
        }
      });

      if (!chat) return null;
      if (chat.project.ownerId !== ctx.session.user.id) {
        throw new Error("Access denied");
      }

      return chat;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, input.id),
        with: {
          project: true
        }
      });

      if (!chat || chat.project.ownerId !== ctx.session.user.id) {
         throw new Error("Access denied");
      }

      await ctx.db.update(chats)
        .set({ deletedAt: new Date() })
        .where(eq(chats.id, input.id));

      return { success: true };
    }),

  // --- Messages ---
  sendMessage: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      content: z.string(),
      role: z.enum(["user", "assistant"]), // Force specific roles
      metaData: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify chat access
      const chat = await ctx.db.query.chats.findFirst({
        where: eq(chats.id, input.chatId),
        with: {
            project: true
        }
      });

      if (!chat || chat.project.ownerId !== ctx.session.user.id) {
        throw new Error("Chat not found or access denied");
      }

      // Add message
      const message = await ctx.db.insert(chatMessages).values({
        chatId: input.chatId,
        content: input.content,
        role: input.role,
        metaData: input.metaData,
      }).returning();

      // Update chat updatedAt
      await ctx.db.update(chats)
        .set({ updatedAt: new Date() })
        .where(eq(chats.id, input.chatId));

      return message[0];
    }),

} satisfies TRPCRouterRecord;
