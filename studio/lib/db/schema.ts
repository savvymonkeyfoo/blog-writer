import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
    id: text('id').primaryKey(),
    type: text('type', { enum: ['image', 'social_post', 'article'] }).notNull(),
    content: text('content').notNull(), // Base64 for images, text for posts
    prompt: text('prompt').notNull(),
    metadata: text('metadata'), // JSON stringified metadata
    status: text('status', { enum: ['draft', 'published'] }).default('draft').notNull(),
    groupId: text('group_id').notNull().default('legacy_migration'), // Links assets to a single session/article
    createdAt: timestamp('created_at')
        .default(sql`now()`)
        .notNull(),
}, (table) => ({
    // Index for filtering by groupId (most common query)
    groupIdIdx: index('group_id_idx').on(table.groupId),

    // Index for filtering by status
    statusIdx: index('status_idx').on(table.status),

    // Index for ordering by creation date
    createdAtIdx: index('created_at_idx').on(table.createdAt),

    // Composite index for common query pattern: get assets by group, ordered by date
    groupIdCreatedAtIdx: index('group_id_created_at_idx').on(table.groupId, table.createdAt),

    // Index for type filtering
    typeIdx: index('type_idx').on(table.type),
}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
