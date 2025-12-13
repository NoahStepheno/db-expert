import { relations } from "drizzle-orm";
import { user } from "../auth-schema";

import { projects } from "./project";
import { documents } from "./document";
import { requirements } from "./requirement";
import { schemas } from "./db-schema";
import { chats, chatMessages } from "./chat";

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(user, {
    fields: [projects.ownerId],
    references: [user.id],
  }),
  documents: many(documents),
  requirements: many(requirements),
  schemas: many(schemas),
  chats: many(chats),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  requirements: many(requirements),
}));

export const requirementsRelations = relations(requirements, ({ one, many }) => ({
  project: one(projects, {
    fields: [requirements.projectId],
    references: [projects.id],
  }),
  sourceDocument: one(documents, {
    fields: [requirements.sourceDocumentId],
    references: [documents.id],
  }),
  schemas: many(schemas),
}));

export const schemasRelations = relations(schemas, ({ one }) => ({
  project: one(projects, {
    fields: [schemas.projectId],
    references: [projects.id],
  }),
  requirement: one(requirements, {
    fields: [schemas.requirementId],
    references: [requirements.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  project: one(projects, {
    fields: [chats.projectId],
    references: [projects.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
}));
