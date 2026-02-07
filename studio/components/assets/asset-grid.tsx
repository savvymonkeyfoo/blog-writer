'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AssetDetailDialog } from './asset-detail-dialog'
import type { Asset } from '@/lib/db/schema'
import { useRouter } from 'next/navigation'
import { Layers, FileText, Image as ImageIcon } from 'lucide-react'

interface AssetGroup {
    groupId: string
    items: Asset[]
    latestAt: Date | null
}

interface AssetGridProps {
    groups: AssetGroup[]
}

export function AssetGrid({ groups }: AssetGridProps) {
    const [selectedGroup, setSelectedGroup] = useState<AssetGroup | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const handleGroupClick = (group: AssetGroup) => {
        setSelectedGroup(group)
        setIsDialogOpen(true)
    }

    const handleUpdate = () => {
        router.refresh()
        // Optimistic updates for complex groups are tricky, relying on refresh for now
    }

    if (!groups || groups.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No projects found. Start creating in the Studio!</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groups.map((group) => {
                    const imageAsset = group.items.find(a => a.type === 'image')
                    const articleAsset = group.items.find(a => a.type === 'article')
                    const socialAsset = group.items.find(a => a.type === 'social_post')

                    // Fallback title logic
                    let title = 'Untitled Project'
                    if (articleAsset?.metadata) {
                        try {
                            const meta = JSON.parse(articleAsset.metadata)
                            if (meta.title) title = meta.title
                        } catch (e) { }
                    } else if (imageAsset) {
                        title = imageAsset.prompt
                    } else if (articleAsset) {
                        title = articleAsset.content.slice(0, 50) + '...'
                    }

                    return (
                        <Card
                            key={group.groupId}
                            className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                            onClick={() => handleGroupClick(group)}
                        >
                            <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                                {imageAsset ? (
                                    <img
                                        src={`data:image/png;base64,${imageAsset.content}`}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <FileText className="h-12 w-12 mb-2 opacity-50" />
                                        <span className="text-xs">Text Only</span>
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    {/* Status Badge */}
                                    {(() => {
                                        const hasPublished = group.items.some(a => a.status === 'published')
                                        const allDraft = group.items.every(a => a.status === 'draft')
                                        if (hasPublished) {
                                            return (
                                                <Badge variant="default" className="bg-green-600/90 text-white hover:bg-green-700/90 backdrop-blur-sm">
                                                    Published
                                                </Badge>
                                            )
                                        } else if (allDraft) {
                                            return (
                                                <Badge variant="secondary" className="bg-gray-600/90 text-white hover:bg-gray-700/90 backdrop-blur-sm">
                                                    Draft
                                                </Badge>
                                            )
                                        }
                                        return null
                                    })()}
                                    {group.items.length > 1 && (
                                        <Badge variant="secondary" className="gap-1 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm">
                                            <Layers className="h-3 w-3" />
                                            {group.items.length}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm line-clamp-2 mb-2 font-medium leading-snug">
                                    {title}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {group.latestAt ? new Date(group.latestAt).toLocaleDateString() : 'Just now'}
                                    </span>
                                    <div className="flex gap-2">
                                        {articleAsset && <FileText className="h-3 w-3" />}
                                        {imageAsset && <ImageIcon className="h-3 w-3" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <AssetDetailDialog
                assets={selectedGroup?.items || []}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onUpdate={handleUpdate}
            />
        </>
    )
}
