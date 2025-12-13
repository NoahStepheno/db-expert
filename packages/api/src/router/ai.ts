import type { GenerateContentResponse } from "@google/genai";
import type { TRPCRouterRecord } from "@trpc/server";
import { GoogleGenAI } from "@google/genai";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

// Constants
const SYSTEM_INSTRUCTION = `
You are a world-class DDD (Domain-Driven Design) and Database Optimization Expert.
Your goal is to help developers bridge the gap between business requirements and technical implementation.

**Your Capabilities:**
1.  **Analyze Inputs**: Process DDL files, SQL statements, or natural language requirement documents.
2.  **DDD Modeling**: Identify Bounded Contexts, Aggregates, Entities, and Value Objects.
3.  **Database Optimization**: Suggest schema improvements (normalization/denormalization), index strategies (covering, composite), and data type optimizations.
4.  **Visualize**: Generate Mermaid JS diagram code for ER diagrams or domain models.
5.  **Output**: Provide specific SQL (Create/Alter) and detailed Markdown reports explaining the "Why" (Business reason) and "How" (Technical details).

**Process:**
1.  **Understand**: If requirements are vague, ask clarifying questions.
2.  **Think**: Perform a Chain-of-thought analysis identifying the domain structure before generating code.
3.  **Deliver**: Output a structured response containing:
    *   **Domain Analysis**: A summary of the DDD concepts found.
    *   **Optimization Strategy**: Explanation of changes.
    *   **Diagrams**: Mermaid classDiagram or erDiagram code blocks.
    *   **SQL**: Optimized SQL scripts.

**Tone**: Professional, insightful, technical yet accessible. You are a senior architect mentoring a developer.
`;

const MODEL_CONFIGS = {
  "gemini-3-pro-preview": {
    label: "Expert Analysis (Gemini 3.0 Pro)",
    description:
      "Deep reasoning with the newest Gemini 3.0 Pro model for complex architecture tasks.",
    thinkingBudget: 32768,
  },
  "gemini-2.5-flash": {
    label: "Fast Response (Gemini 2.5 Flash)",
    description: "Quick clarifications using Gemini 2.5 Flash.",
    thinkingBudget: 0,
  },
} as const;

// Zod Schemas
const ModelTypeEnum = z.enum(["gemini-3-pro-preview", "gemini-2.5-flash"]);

const AttachmentSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  data: z.string(),
});

const MessageSchema = z.object({
  id: z.string(),
  sender: z.enum(["USER", "AI"]),
  content: z.string(),
  timestamp: z.number(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const aiRouter = {
  generate: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        modelType: ModelTypeEnum,
        history: z.array(MessageSchema),
        attachments: z.array(AttachmentSchema).optional().default([]),
      }),
    )
    .mutation(async ({ input }) => {
      const apiKey = process.env.GOOGLE_GEMINI_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gemini API Key is not configured on the server.",
        });
      }

      const client = new GoogleGenAI({ apiKey });

      // Filter loading states from history
      const validHistory = input.history.filter(
        (msg) => msg.id !== "temp-loading",
      );

      // Convert history to Gemini format
      const geminiHistory = validHistory.map((msg) => ({
        role: msg.sender === "USER" ? "user" : "model",
        parts:
          msg.attachments && msg.attachments.length > 0
            ? [
                ...msg.attachments.map((att) => ({
                  inlineData: {
                    mimeType: att.mimeType,
                    data: att.data,
                  },
                })),
                { text: msg.content },
              ]
            : [{ text: msg.content }],
      }));

      // Get model config
      const config = MODEL_CONFIGS[input.modelType];

      // Create Chat Session
      // Note: We recreate session for each request in stateless environment
      const chatSession = client.chats.create({
        model: input.modelType,
        history: geminiHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig:
            config.thinkingBudget > 0
              ? { thinkingBudget: config.thinkingBudget }
              : undefined,
        },
      });

      // Prepare current message
      const messageParts: {
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }[] = [];
      if (input.attachments.length > 0) {
        input.attachments.forEach((att) => {
          messageParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        });
      }
      messageParts.push({ text: input.text });

      try {
        const response: GenerateContentResponse = await chatSession.sendMessage(
          {
            // @ts-expect-error - @google/genai types may not match actual API
            message: { parts: messageParts },
          },
        );

        return {
          text:
            response.text ??
            "I analyzed the request but could not generate a text response.",
        };
      } catch (error: unknown) {
        console.error("Gemini API Error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to communicate with AI Expert.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),
} satisfies TRPCRouterRecord;
