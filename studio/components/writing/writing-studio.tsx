'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Copy, Check, RefreshCw, PenLine, Eye, FileText, Sparkles, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { MultimodalInput } from '@/components/ui/multimodal-ai-chat-input'
import type { DraftResult } from '@/lib/ai/writing'

interface WritingStudioProps {
    draft: DraftResult | null
    isLoading: boolean
    onRefine?: (instruction: string, content: string) => void
    onRegenerate?: () => void
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
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

export function WritingStudio({
    draft,
    isLoading,
    onRefine,
    onRegenerate
}: WritingStudioProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [articleContent, setArticleContent] = useState('')
    const [copied, setCopied] = useState(false)

    // Sync state with props when draft changes
    useEffect(() => {
        if (draft) setArticleContent(draft.content)
    }, [draft])

    const handleCopy = async () => {
        if (!articleContent) return
        await navigator.clipboard.writeText(articleContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setArticleContent(e.target.value)
    }

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24"
            >
                {/* Animated writing loader */}
                <motion.div className="relative mb-8">
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 blur-2xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                        className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/20"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <PenLine className="h-12 w-12 text-primary" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.h3
                    className="text-xl font-semibold mb-2 gradient-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Crafting your article...
                </motion.h3>

                {/* Progress indicators */}
                <motion.div
                    className="flex flex-col items-center gap-3 text-sm text-muted-foreground mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs">Structuring content</span>
                        </motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground/70">This may take up to a minute</p>
                </motion.div>
            </motion.div>
        )
    }

    if (!draft) return null

    return (
        <motion.div
            key={draft.title + draft.wordCount} // Unique key to force re-animation
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header & Controls */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-transparent"
            >
                <div>
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3"
                        whileHover={{ scale: 1.05 }}
                    >
                        <BookOpen className="h-3 w-3" />
                        Article Draft
                    </motion.div>
                    <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {draft.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {draft.wordCount} words
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span>Ready to review</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View/Edit Toggle - Enhanced */}
                    <motion.div
                        className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/50"
                        whileHover={{ scale: 1.02 }}
                    >
                        <Button
                            variant={!isEditing ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className={`h-9 px-4 gap-2 rounded-lg transition-all ${!isEditing ? 'shadow-sm' : ''}`}
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            variant={isEditing ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className={`h-9 px-4 gap-2 rounded-lg transition-all ${isEditing ? 'shadow-sm' : ''}`}
                        >
                            <PenLine className="h-4 w-4" />
                            Edit
                        </Button>
                    </motion.div>

                    {/* Copy Button - Enhanced */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className={`h-9 gap-2 transition-all ${copied ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
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
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div variants={itemVariants}>
                        <Card variant="elevated" className="overflow-hidden">
                            <CardContent className="p-0">
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div
                                            key="edit"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-6"
                                        >
                                            <div className="relative">
                                                <Textarea
                                                    value={articleContent}
                                                    onChange={handleContentChange}
                                                    maxLength={50000}
                                                    className="min-h-[500px] font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 resize-none bg-transparent"
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                                                    {articleContent.length.toLocaleString()} / 50,000
                                                </div>
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
                                                <ReactMarkdown>{articleContent}</ReactMarkdown>
                                            </article>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
            </motion.div>

            {/* AI Refinement Tools - Enhanced */}
            {onRefine && (
                <motion.div variants={itemVariants}>
                    <Card variant="glass" className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <motion.div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </motion.div>
                                <div>
                                    <span>Refine This Draft</span>
                                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                        Ask AI to improve specific sections or adjust the tone
                                    </p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <MultimodalInput
                                chatId="refine-draft"
                                isGenerating={isLoading}
                                onSendMessage={({ input }) => onRefine(input, articleContent)}
                                selectedVisibilityType="private"
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    )
}
