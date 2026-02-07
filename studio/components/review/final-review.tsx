'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Check, ExternalLink, ArrowLeft, RefreshCw, Smartphone, Monitor, Eye, PenLine, Sparkles, FileText, Image as ImageIcon, Share2, CheckCircle, PartyPopper } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { DraftResult } from '@/lib/ai/writing'
import type { GeneratedImage } from '@/lib/ai/image-generation'

interface FinalReviewProps {
    draft: DraftResult
    socialPost: string
    generatedImage: GeneratedImage | null
    onBack: () => void
    onStartOver: () => void
    onUpdateDraft?: (content: string) => void
    onUpdateSocialPost?: (content: string) => void
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
}

export function FinalReview({
    draft,
    socialPost,
    generatedImage,
    onBack,
    onStartOver,
    onUpdateDraft,
    onUpdateSocialPost
}: FinalReviewProps) {
    const [activeTab, setActiveTab] = useState<'preview' | 'article'>('preview')
    const [copiedSection, setCopiedSection] = useState<string | null>(null)
    const [isEditingPost, setIsEditingPost] = useState(false)
    const [isEditingArticle, setIsEditingArticle] = useState(false)
    const [editedPost, setEditedPost] = useState(socialPost)
    const [editedArticle, setEditedArticle] = useState(draft.content)

    const handleCopy = async (text: string, section: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedSection(section)
        setTimeout(() => setCopiedSection(null), 2000)
    }

    const handleDownloadImage = () => {
        if (!generatedImage) return

        const link = document.createElement('a')
        link.href = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`
        link.download = `linkedin-post-image-${Date.now()}.${generatedImage.mediaType.split('/')[1]}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSavePost = () => {
        if (onUpdateSocialPost) {
            onUpdateSocialPost(editedPost)
        }
        setIsEditingPost(false)
    }

    const handleSaveArticle = () => {
        if (onUpdateDraft) {
            onUpdateDraft(editedArticle)
        }
        setIsEditingArticle(false)
    }

    return (
        <motion.div
            key={draft.title + socialPost.substring(0, 20)} // Unique key to force re-animation
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Success Banner */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 p-6 border border-primary/20"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full -z-10" />
                <div className="flex items-center gap-4">
                    <motion.div
                        className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <PartyPopper className="h-7 w-7 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="font-serif text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Your Content Package is Ready!
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Review everything below, then copy assets to publish on LinkedIn.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Header with Actions */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div className="flex gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" onClick={onBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Assets
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" onClick={onStartOver} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Start New
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'article')}>
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-12 p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger
                            value="preview"
                            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                        >
                            <Share2 className="h-4 w-4" />
                            Post Preview
                        </TabsTrigger>
                        <TabsTrigger
                            value="article"
                            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                        >
                            <FileText className="h-4 w-4" />
                            Full Article
                        </TabsTrigger>
                    </TabsList>

                    {/* LinkedIn Post Preview Tab */}
                    <TabsContent value="preview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: The Post (Image + Text) */}
                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {/* Edit/Preview Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">LinkedIn Post Preview</span>
                                    <motion.div
                                        className="flex items-center bg-muted/50 rounded-lg p-1"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Button
                                            variant={!isEditingPost ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setIsEditingPost(false)}
                                            className="h-8 px-3 gap-2 rounded-md"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview
                                        </Button>
                                        <Button
                                            variant={isEditingPost ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setIsEditingPost(true)}
                                            className="h-8 px-3 gap-2 rounded-md"
                                        >
                                            <PenLine className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </motion.div>
                                </div>

                                <Card variant="elevated" className="overflow-hidden">
                                    {/* LinkedIn-style header */}
                                    <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                                                <Share2 className="h-5 w-5 text-blue-500/70" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="h-3.5 w-32 bg-muted rounded skeleton-shimmer" />
                                                <div className="h-2.5 w-20 bg-muted rounded skeleton-shimmer" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* Post Text - Editable */}
                                        <div className="p-4">
                                            <AnimatePresence mode="wait">
                                                {isEditingPost ? (
                                                    <motion.div
                                                        key="edit"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="space-y-3"
                                                    >
                                                        <Textarea
                                                            value={editedPost}
                                                            onChange={(e) => setEditedPost(e.target.value)}
                                                            className="min-h-[200px] text-sm leading-relaxed resize-none"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setEditedPost(socialPost)
                                                                    setIsEditingPost(false)
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={handleSavePost}
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="preview"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="whitespace-pre-wrap text-sm leading-relaxed"
                                                    >
                                                        {editedPost || "No social post generated."}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Post Image */}
                                        {generatedImage ? (
                                            <motion.div
                                                className="relative aspect-video w-full bg-muted overflow-hidden"
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <img
                                                    src={`data:${generatedImage.mediaType};base64,${generatedImage.base64}`}
                                                    alt="Generated content"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                                            </motion.div>
                                        ) : (
                                            <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-2">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                                <span className="text-muted-foreground text-sm">No image generated</span>
                                            </div>
                                        )}

                                        {/* Link Preview Mockup */}
                                        <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-4 border-t">
                                            <div className="font-semibold text-sm truncate">{draft.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                linkedin.com/pulse/...
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Right Column: Actions & Details */}
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card variant="glass">
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Sparkles className="h-5 w-5 text-primary" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-lg">Publishing Assets</CardTitle>
                                                <CardDescription>Copy these directly to LinkedIn</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        {/* Image Action */}
                                        <motion.div
                                            className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-background to-muted/30 group hover:border-primary/30 transition-all"
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    <Monitor className="h-5 w-5 text-purple-500" />
                                                </motion.div>
                                                <div>
                                                    <div className="font-medium">Image Asset</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {generatedImage ? (
                                                            <span className="text-emerald-500">Ready to download</span>
                                                        ) : (
                                                            'Not available'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="sm"
                                                    variant={generatedImage ? "default" : "outline"}
                                                    disabled={!generatedImage}
                                                    onClick={handleDownloadImage}
                                                    className="gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </motion.div>
                                        </motion.div>

                                        {/* Post Text Action */}
                                        <motion.div
                                            className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-background to-muted/30 group hover:border-primary/30 transition-all"
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                                </motion.div>
                                                <div>
                                                    <div className="font-medium">Social Post</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {editedPost.length} characters
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="sm"
                                                    variant={copiedSection === 'post' ? "default" : "outline"}
                                                    onClick={() => handleCopy(editedPost, 'post')}
                                                    className="gap-2"
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {copiedSection === 'post' ? (
                                                            <motion.div
                                                                key="check"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="copy"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    {copiedSection === 'post' ? 'Copied!' : 'Copy Text'}
                                                </Button>
                                            </motion.div>
                                        </motion.div>

                                        {/* Article Link Action */}
                                        <motion.div
                                            className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-background to-muted/30 group hover:border-primary/30 transition-all"
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    <ExternalLink className="h-5 w-5 text-emerald-500" />
                                                </motion.div>
                                                <div>
                                                    <div className="font-medium">Article Content</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Ready to paste as Article
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setActiveTab('article')}
                                                    className="gap-2"
                                                >
                                                    View Article
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </CardContent>
                                </Card>

                                {/* Quick Tips Card */}
                                <Card variant="glass" className="border-dashed">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 flex-shrink-0">
                                                <Sparkles className="h-4 w-4 text-amber-500" />
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Pro tip:</span> Post your social content first, then link to the full article in the comments for maximum engagement.
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </TabsContent>

                    {/* Full Article Tab */}
                    <TabsContent value="article" className="mt-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card variant="elevated">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b bg-gradient-to-r from-muted/30 to-transparent">
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-serif">{draft.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {draft.wordCount} words • Markdown format
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Edit/Preview Toggle for Article */}
                                        <motion.div
                                            className="flex items-center bg-muted/50 rounded-lg p-1"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <Button
                                                variant={!isEditingArticle ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setIsEditingArticle(false)}
                                                className="h-8 px-3 gap-2 rounded-md"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Preview
                                            </Button>
                                            <Button
                                                variant={isEditingArticle ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setIsEditingArticle(true)}
                                                className="h-8 px-3 gap-2 rounded-md"
                                            >
                                                <PenLine className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant={copiedSection === 'article' ? "default" : "outline"}
                                                onClick={() => handleCopy(editedArticle, 'article')}
                                                className="gap-2"
                                            >
                                                <AnimatePresence mode="wait">
                                                    {copiedSection === 'article' ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Copied
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="copy"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Copy Markdown
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Button>
                                        </motion.div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <AnimatePresence mode="wait">
                                        {isEditingArticle ? (
                                            <motion.div
                                                key="edit"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-6"
                                            >
                                                <Textarea
                                                    value={editedArticle}
                                                    onChange={(e) => setEditedArticle(e.target.value)}
                                                    className="min-h-[600px] font-mono text-sm leading-relaxed resize-none"
                                                />
                                                <div className="flex gap-2 justify-end mt-4">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditedArticle(draft.content)
                                                            setIsEditingArticle(false)
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveArticle}>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="preview"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-8 md:p-12"
                                            >
                                                <article className="prose prose-lg max-w-none dark:prose-invert font-serif prose-headings:font-serif prose-p:leading-relaxed prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                                                    <ReactMarkdown>{editedArticle}</ReactMarkdown>
                                                </article>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    )
}
