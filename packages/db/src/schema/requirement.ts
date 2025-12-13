import { sql } from "drizzle-orm";
import { pgTable, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projects } from "./project";
import { documents } from "./document";

export const requirements = pgTable("requirements", (t) => ({
  id: t.serial().primaryKey(),
  projectId: t.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceDocumentId: t.integer().references(() => documents.id, { onDelete: "set null" }),
  title: t.varchar({ length: 256 }),
  analysisContent: t.text().notNull(),
  structuredData: t.jsonb(),
  version: t.integer().default(1),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().$onUpdateFn(() => sql`now()`),
}), (table) => [
  index("requirements_project_idx").on(table.projectId)
]);

export const CreateRequirementSchema = createInsertSchema(requirements, {
  title: z.string().max(256).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
