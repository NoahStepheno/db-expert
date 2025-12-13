import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";
import { desc, eq, and } from "@acme/db";

import {
  projects, documents, requirements, schemas,
  CreateProjectSchema, CreateDocumentSchema, CreateRequirementSchema, CreateSchemaSchema
} from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const projectRouter = {
  // --- Projects ---
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.projects.findMany({
      where: eq(projects.ownerId, ctx.session.user.id),
      orderBy: desc(projects.createdAt),
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.ownerId, ctx.session.user.id)
        ),
        with: {
          documents: true,
          requirements: true,
          schemas: true,
          chats: true,
        },
      });
    }),

  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(projects).values({
        ...input,
        ownerId: ctx.session.user.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: CreateProjectSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(projects)
        .set(input.data)
        .where(and(
          eq(projects.id, input.id),
          eq(projects.ownerId, ctx.session.user.id)
        ));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Soft delete
      await ctx.db.update(projects)
        .set({ deletedAt: new Date() })
        .where(and(
          eq(projects.id, input.id),
          eq(projects.ownerId, ctx.session.user.id)
        ));
      return { success: true };
    }),

  // --- Documents ---
  documents: {
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        data: CreateDocumentSchema
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify project ownership
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) throw new Error("Project not found or access denied");

        return ctx.db.insert(documents).values({
          ...input.data,
          projectId: input.projectId,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify project ownership first? Or rely on join?
        // Let's verify ownership to be safe and consistent
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) return [];

        return ctx.db.query.documents.findMany({
          where: eq(documents.projectId, input.projectId),
          orderBy: desc(documents.uploadedAt),
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Need to check if the document belongs to a project owned by user
        // We can do this by joining or two queries.
        // Drizzle delete with returning or check first.

        const doc = await ctx.db.query.documents.findFirst({
          where: eq(documents.id, input.id),
          with: {
            project: true
          }
        });

        if (!doc || doc.project.ownerId !== ctx.session.user.id) {
            throw new Error("Document not found or access denied");
        }

        await ctx.db.update(documents)
            .set({ deletedAt: new Date() })
            .where(eq(documents.id, input.id));

        return { success: true };
      })
  },

  // --- Requirements ---
  requirements: {
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        data: CreateRequirementSchema
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) throw new Error("Project not found or access denied");

        return ctx.db.insert(requirements).values({
          ...input.data,
          projectId: input.projectId,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) return [];

        return ctx.db.query.requirements.findMany({
          where: eq(requirements.projectId, input.projectId),
          orderBy: desc(requirements.createdAt),
        });
      }),
  },

  // --- Schemas ---
  schemas: {
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        data: CreateSchemaSchema
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) throw new Error("Project not found or access denied");

        return ctx.db.insert(schemas).values({
          ...input.data,
          projectId: input.projectId,
        });
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
          where: and(
            eq(projects.id, input.projectId),
            eq(projects.ownerId, ctx.session.user.id)
          )
        });
        if (!project) return [];

        return ctx.db.query.schemas.findMany({
          where: eq(schemas.projectId, input.projectId),
          orderBy: desc(schemas.createdAt),
        });
      }),
  }

} satisfies TRPCRouterRecord;
