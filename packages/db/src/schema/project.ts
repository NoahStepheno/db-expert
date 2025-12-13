import { sql } from "drizzle-orm";
import { pgTable, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { user } from "../auth-schema";

export const projects = pgTable("projects", (t) => ({
  id: t.serial().primaryKey(),
  ownerId: t.text().notNull().references(() => user.id),
  name: t.varchar({ length: 256 }).notNull(),
  description: t.text(),
  status: t.varchar({ length: 50 }).default('active'),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().$onUpdateFn(() => sql`now()`),
  deletedAt: t.timestamp(),
}), (table) => [
  index("projects_owner_idx").on(table.ownerId)
]);

export const CreateProjectSchema = createInsertSchema(projects, {
  name: z.string().max(256),
  status: z.string().max(50).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  ownerId: true,
});
