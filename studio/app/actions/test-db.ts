'use server';

import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';

export async function testDatabaseConnection() {
    try {
        // Try to query the database
        const result = await db.select().from(assets).limit(1);

        return {
            success: true,
            message: 'Database connection successful',
            tableExists: true,
            rowCount: result.length,
            data: result
        };
    } catch (error) {
        console.error('Database connection test failed:', error);

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error: String(error)
        };
    }
}

export async function testInsertAsset() {
    try {
        const testAsset = {
            id: `test-${Date.now()}`,
            groupId: 'test-group',
            type: 'article' as const,
            content: 'Test content',
            prompt: 'Test prompt',
            status: 'draft' as const,
            metadata: JSON.stringify({ test: true })
        };

        await db.insert(assets).values(testAsset);

        // Try to read it back
        const result = await db.select().from(assets).limit(5);

        return {
            success: true,
            message: 'Insert successful',
            insertedId: testAsset.id,
            totalAssets: result.length,
            recentAssets: result
        };
    } catch (error) {
        console.error('Test insert failed:', error);

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error: String(error)
        };
    }
}
