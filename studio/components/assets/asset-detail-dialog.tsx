'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Asset } from '@/lib/db/schema'
import { updateAssetStatus, deleteAsset } from '@/app/actions/assets'
import { Download, Copy, Check, FileText, Image as ImageIcon, Share2, Trash2 } from 'lucide-react'
import { marked } from 'marked'

interface AssetDetailDialogProps {
    assets: Asset[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: (updatedAssetId?: string, newStatus?: 'draft' | 'published') => void
}

export function AssetDetailDialog({ assets, open, onOpenChange, onUpdate }: AssetDetailDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [localAssetStatuses, setLocalAssetStatuses] = useState<Record<string, 'draft' | 'published'>>({})

    const imageAsset = assets.find(a => a.type === 'image')
    const articleAsset = assets.find(a => a.type === 'article')
    const socialAsset = assets.find(a => a.type === 'social_post')

    const defaultTab = imageAsset ? 'image' : (articleAsset ? 'article' : 'social')
    const [activeTab, setActiveTab] = useState(defaultTab)

    const activeAsset = activeTab === 'image' ? imageAsset : (activeTab === 'article' ? articleAsset : socialAsset)

    // Get current status (use local state if available for optimistic update)
    const getCurrentStatus = () => {
        if (!activeAsset) return 'draft'
        return localAssetStatuses[activeAsset.id] || activeAsset.status
    }

    // Reset local status when assets change
    useEffect(() => {
        setLocalAssetStatuses({})
    }, [assets])

    // Sync activeTab with available assets
    useEffect(() => {
        // If current activeAsset doesn't exist, switch to first available tab
        if (!activeAsset) {
            if (imageAsset) setActiveTab('image')
            else if (articleAsset) setActiveTab('article')
            else if (socialAsset) setActiveTab('social')
        }
    }, [activeAsset, imageAsset, articleAsset, socialAsset])

    if (!assets || assets.length === 0) return null

    const handleStatusChange = (checked: boolean) => {
        if (!activeAsset) return
        const newStatus = checked ? 'published' : 'draft'

        // Optimistic update in dialog
        setLocalAssetStatuses(prev => ({
            ...prev,
            [activeAsset.id]: newStatus
        }))

        // Immediately notify parent for optimistic update in grid
        onUpdate(activeAsset.id, newStatus)

        startTransition(async () => {
            await updateAssetStatus(activeAsset.id, newStatus)
        })
    }

    const handleCopy = async (content: string, asRichText = false) => {
        try {
            if (asRichText) {
                const html = await marked.parse(content)
                const type = "text/html"
                const blob = new Blob([html], { type })
                const textBlob = new Blob([content], { type: "text/plain" })
                const data = [new ClipboardItem({
                    [type]: blob,
                    ["text/plain"]: textBlob
                })]
                await navigator.clipboard.write(data)
            } else {
                await navigator.clipboard.writeText(content)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const handleDownload = (asset: Asset) => {
        const link = document.createElement('a')
        link.href = `data:image/png;base64,${asset.content}`
        link.download = `asset-${asset.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDelete = async () => {
        if (!activeAsset) return

        console.log('Deleting asset:', activeAsset.id)
        setIsDeleting(true)
        try {
            const result = await deleteAsset(activeAsset.id)
            console.log('Delete result:', result)
            if (result.success) {
                console.log('Asset deleted successfully, closing dialogs and refreshing')
                setShowDeleteConfirm(false)
                onOpenChange(false)
                onUpdate()
            } else {
                console.error('Delete failed:', result.error)
                alert(`Failed to delete asset: ${result.error}`)
            }
        } catch (error) {
            console.error('Failed to delete asset:', error)
            alert('An error occurred while deleting the asset')
        } finally {
            setIsDeleting(false)
        }
    }

    // Helper to render markdown content for display
    const renderMarkdown = (content: string) => {
        // synchronously parsing for display is fine here
        const html = marked.parse(content) as string
        return { __html: html }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-xl font-serif">Project Assets</DialogTitle>
                            <DialogDescription>
                                {activeAsset ? `Created ${new Date(activeAsset.createdAt).toLocaleDateString()}` : 'Project details'}
                            </DialogDescription>
                        </div>
                        {activeAsset && (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="published-mode"
                                        checked={getCurrentStatus() === 'published'}
                                        onCheckedChange={handleStatusChange}
                                        disabled={isPending}
                                    />
                                    <Label htmlFor="published-mode" className={getCurrentStatus() === 'published' ? 'font-bold text-primary' : 'text-muted-foreground'}>
                                        {getCurrentStatus() === 'published' ? 'Published' : 'Draft'}
                                    </Label>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full mt-4" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="image" disabled={!imageAsset}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Image
                        </TabsTrigger>
                        <TabsTrigger value="article" disabled={!articleAsset}>
                            <FileText className="h-4 w-4 mr-2" />
                            Article
                        </TabsTrigger>
                        <TabsTrigger value="social" disabled={!socialAsset}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Social Post
                        </TabsTrigger>
                    </TabsList>

                    {/* Image Tab */}
                    <TabsContent value="image" className="mt-4">
                        {imageAsset && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={`data:image/png;base64,${imageAsset.content}`}
                                        alt={imageAsset.prompt}
                                        className="w-full h-auto object-contain max-h-[400px]"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Prompt</h3>
                                        <p className="text-sm leading-relaxed border p-3 rounded-md bg-muted/20">
                                            {imageAsset.prompt}
                                        </p>
                                    </div>
                                    <Button onClick={() => handleDownload(imageAsset)} className="w-full gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Article Tab */}
                    <TabsContent value="article" className="mt-4">
                        {articleAsset && (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-muted/30 p-6 max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed font-serif prose dark:prose-invert prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary">
                                    {/* Render as HTML */}
                                    <div dangerouslySetInnerHTML={renderMarkdown(articleAsset.content)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => handleCopy(articleAsset.content, false)} className="gap-2">
                                        <Copy className="h-4 w-4" />
                                        Copy Markdown
                                    </Button>
                                    <Button onClick={() => handleCopy(articleAsset.content, true)} className="gap-2">
                                        {copied ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        Copy Rich Text
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Social Post Tab */}
                    <TabsContent value="social" className="mt-4">
                        {socialAsset && (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-muted/30 p-6 whitespace-pre-wrap text-sm font-medium prose dark:prose-invert prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary">
                                    {/* Render as HTML */}
                                    <div dangerouslySetInnerHTML={renderMarkdown(socialAsset.content)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => handleCopy(socialAsset.content, false)} className="gap-2">
                                        <Copy className="h-4 w-4" />
                                        Copy Text
                                    </Button>
                                    <Button onClick={() => handleCopy(socialAsset.content, true)} className="gap-2">
                                        {copied ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        Copy Rich Text
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </DialogContent>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this asset? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
