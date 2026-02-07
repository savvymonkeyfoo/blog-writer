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

        // Check if it's a PostgreSQL error with more details
        const pgError = error as any;
        const errorDetails = {
            message: pgError.message || 'Unknown error',
            code: pgError.code,
            detail: pgError.detail,
            hint: pgError.hint,
            table: pgError.table_name,
            column: pgError.column_name,
            constraint: pgError.constraint_name,
            fullError: String(error)
        };

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error: JSON.stringify(errorDetails, null, 2)
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

        console.log('[testInsertAsset] Attempting to insert:', testAsset);
        await db.insert(assets).values(testAsset);
        console.log('[testInsertAsset] Insert successful');

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

        // Check if it's a PostgreSQL error with more details
        const pgError = error as any;
        const errorDetails = {
            message: pgError.message || 'Unknown error',
            code: pgError.code,
            detail: pgError.detail,
            hint: pgError.hint,
            table: pgError.table_name,
            fullError: String(error)
        };

        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error: JSON.stringify(errorDetails, null, 2)
        };
    }
}
