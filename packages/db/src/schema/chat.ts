import { sql } from "drizzle-orm";
import { pgTable, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projects } from "./project";

export const chats = pgTable("chats", (t) => ({
  id: t.serial().primaryKey(),
  projectId: t.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: t.varchar({ length: 256 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().$onUpdateFn(() => sql`now()`),
  deletedAt: t.timestamp(),
}), (table) => [
  index("chats_project_idx").on(table.projectId)
]);

export const chatMessages = pgTable("chat_messages", (t) => ({
  id: t.serial().primaryKey(),
  chatId: t.integer().notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: t.varchar({ length: 20 }).notNull(),
  content: t.text().notNull(),
  metaData: t.jsonb(),
  createdAt: t.timestamp().defaultNow().notNull(),
}), (table) => [
  index("chat_messages_chat_idx").on(table.chatId)
]);

export const CreateChatSchema = createInsertSchema(chats, {
  title: z.string().max(256).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CreateChatMessageSchema = createInsertSchema(chatMessages, {
  role: z.string().max(20),
}).omit({
  id: true,
  createdAt: true,
});
