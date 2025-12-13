import { pgTable, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { projects } from "./project";
import { requirements } from "./requirement";

export const schemas = pgTable("schemas", (t) => ({
  id: t.serial().primaryKey(),
  projectId: t.integer().notNull().references(() => projects.id, { onDelete: "cascade" }),
  requirementId: t.integer().references(() => requirements.id, { onDelete: "set null" }),
  ddlScript: t.text(),
  mermaidDiagram: t.text(),
  designReport: t.text(),
  version: t.integer().default(1),
  createdAt: t.timestamp().defaultNow().notNull(),
}), (table) => [
  index("schemas_project_idx").on(table.projectId)
]);

export const CreateSchemaSchema = createInsertSchema(schemas).omit({
  id: true,
  createdAt: true,
});
