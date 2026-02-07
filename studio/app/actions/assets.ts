'use server';

import { db } from '@/lib/db';
import { assets, NewAsset } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { generateImageFromPrompt, AspectRatio, ImageModel } from '@/lib/ai/image-generation';
import { generateImagePrompts } from '@/lib/ai/assets';
import type { DraftResult } from '@/lib/ai/writing';
import { withRateLimit } from '@/lib/rate-limit/middleware';

async function generateImageHandler(prompt: string, options: { aspectRatio: AspectRatio, model: ImageModel }) {
    try {
        const image = await generateImageFromPrompt(prompt, options);
        return { success: true, image };
    } catch (error) {
        console.error('Failed to generate image:', error);
        return { success: false, error: 'Failed to generate image' };
    }
}

export const generateImageAction = withRateLimit('image')(generateImageHandler);

async function generateImagePromptsHandler(draft: DraftResult) {
    try {
        const prompts = await generateImagePrompts(draft);
        return { success: true, prompts };
    } catch (error) {
        console.error('Failed to generate image prompts:', error);
        return { success: false, error: 'Failed to generate image prompts' };
    }
}

export const generateImagePromptsAction = withRateLimit('writing')(generateImagePromptsHandler);

export async function saveAsset(asset: NewAsset) {
    try {
        await db.insert(assets).values(asset);
        revalidatePath('/assets');
        return { success: true };
    } catch (error) {
        console.error('Failed to save asset:', error);
        return { success: false, error: 'Failed to save asset' };
    }
}

export async function getAssets() {
    try {
        const allAssets = await db.select().from(assets).orderBy(desc(assets.createdAt));
        return { success: true, data: allAssets };
    } catch (error) {
        console.error('Failed to get assets:', error);
        return { success: false, error: 'Failed to get assets' };
    }
}

export async function updateAssetStatus(id: string, status: 'draft' | 'published') {
    try {
        await db.update(assets).set({ status }).where(eq(assets.id, id));
        revalidatePath('/assets');
        return { success: true };
    } catch (error) {
        console.error('Failed to update asset status:', error);
        return { success: false, error: 'Failed to update asset status' };
    }
}

export async function deleteAsset(id: string) {
    try {
        await db.delete(assets).where(eq(assets.id, id));
        revalidatePath('/assets');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete asset:', error);
        return { success: false, error: 'Failed to delete asset' };
    }
}

export async function getGroupedAssets() {
    try {
        const allAssets = await db.select().from(assets).orderBy(desc(assets.createdAt));

        // Group by groupId
        const groups: Record<string, typeof allAssets> = {};
        allAssets.forEach(asset => {
            if (!groups[asset.groupId]) {
                groups[asset.groupId] = [];
            }
            groups[asset.groupId].push(asset);
        });

        // Convert to array of groups for easier consumption
        // Sort groups by the most recent asset in them
        const groupArray = Object.entries(groups).map(([groupId, items]) => ({
            groupId,
            items,
            latestAt: items[0]?.createdAt // Assumes items are sorted by desc createdAt
        })).sort((a, b) => {
            const timeA = a.latestAt ? new Date(a.latestAt).getTime() : 0;
            const timeB = b.latestAt ? new Date(b.latestAt).getTime() : 0;
            return timeB - timeA;
        });

        return { success: true, data: groupArray };
    } catch (error) {
        console.error('Failed to get grouped assets:', error);
        return { success: false, error: 'Failed to get grouped assets' };
    }
}
