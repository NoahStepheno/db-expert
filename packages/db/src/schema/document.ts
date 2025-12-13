import { pgTable, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projects } from "./project";

export const documents = pgTable("documents", (t) => ({
  id: t.serial().primaryKey(),
  projectId: t.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
  filename: t.varchar({ length: 256 }).notNull(),
  storagePath: t.varchar({ length: 512 }),
  fileType: t.varchar({ length: 50 }),
  content: t.text(),
  status: t.varchar({ length: 50 }).default('pending'),
  uploadedAt: t.timestamp().defaultNow().notNull(),
  deletedAt: t.timestamp(),
}), (table) => [
  index("documents_project_idx").on(table.projectId)
]);

export const CreateDocumentSchema = createInsertSchema(documents, {
  filename: z.string().max(256),
  storagePath: z.string().max(512).optional(),
  fileType: z.string().max(50).optional(),
}).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
  uploadedAt: true,
});
