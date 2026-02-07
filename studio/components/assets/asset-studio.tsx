'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Image as ImageIcon, Copy, Check, Wand2, RefreshCw, ArrowLeft, CheckCircle, Settings2, Sparkles, Palette, Zap } from 'lucide-react'
import type { ImagePrompt } from '@/lib/ai/assets'
import { generateImageAction, saveAsset } from '@/app/actions/assets'
import type { AspectRatio, ImageModel } from '@/lib/ai/image-generation'

interface GeneratedImage {
    base64: string
    mediaType: string
}

interface AssetStudioProps {
    prompts: ImagePrompt[] | null
    isLoading: boolean
    generatedImage?: GeneratedImage | null
    onImageGenerated?: (image: GeneratedImage | null) => void
    onGenerateImages?: () => void
    acceptedImages: Record<string, GeneratedImage>
    onAcceptImage: (promptId: string, image: GeneratedImage) => void
    sessionId: string
}

const styleColors = {
    professional: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    abstract: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    editorial: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    infographic: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

const styleIcons = {
    professional: '💼',
    abstract: '🎨',
    editorial: '📰',
    infographic: '📊',
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

export function AssetStudio({
    prompts,
    isLoading,
    generatedImage: propImage,
    onImageGenerated,
    acceptedImages,
    onAcceptImage,
    sessionId
}: AssetStudioProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [selectedPrompt, setSelectedPrompt] = useState<ImagePrompt | null>(null)
    const [localGeneratedImage, setLocalGeneratedImage] = useState<GeneratedImage | null>(null)
    const [imageError, setImageError] = useState<string | null>(null)

    // Use prop image if available, otherwise local state
    const generatedImage = propImage !== undefined ? propImage : localGeneratedImage
    const setGeneratedImage = onImageGenerated || setLocalGeneratedImage

    // Image Generation Options
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
    const [model, setModel] = useState<ImageModel>('standard')

    const [isGenerating, startGenerating] = useTransition()

    const handleCopyPrompt = async (prompt: ImagePrompt) => {
        await navigator.clipboard.writeText(prompt.description)
        setCopiedId(prompt.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleSelectPrompt = (prompt: ImagePrompt) => {
        setSelectedPrompt(prompt)
        setGeneratedImage(null)
        setImageError(null)
        // Check if we already have an accepted image for this prompt
        if (acceptedImages[prompt.id]) {
            setGeneratedImage(acceptedImages[prompt.id])
        }
    }

    const handleGenerateImage = () => {
        if (!selectedPrompt) return

        startGenerating(async () => {
            setImageError(null)
            const result = await generateImageAction(selectedPrompt.description, {
                aspectRatio,
                model
            })
            if (result.error) {
                setImageError(result.error)
            } else if (result.image) {
                setGeneratedImage(result.image)

                // Save to local database
                await saveAsset({
                    id: crypto.randomUUID(),
                    groupId: sessionId,
                    type: 'image',
                    content: result.image.base64,
                    prompt: selectedPrompt.description,
                    status: 'draft',
                    metadata: JSON.stringify({
                        model,
                        aspectRatio,
                        mediaType: result.image.mediaType
                    })
                })
            }
        })
    }

    const handleAcceptImage = () => {
        if (selectedPrompt && generatedImage) {
            onAcceptImage(selectedPrompt.id, generatedImage)
            setSelectedPrompt(null)
            setGeneratedImage(null)
        }
    }

    const handleTryAnother = () => {
        setSelectedPrompt(null)
        setGeneratedImage(null)
        setImageError(null)
    }

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24"
            >
                {/* Animated loading container */}
                <motion.div className="relative mb-8">
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                        className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Palette className="h-12 w-12 text-purple-500" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.h3
                    className="text-xl font-semibold mb-2 gradient-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Generating image prompts...
                </motion.h3>

                <motion.div
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <motion.div
                        className="w-2 h-2 rounded-full bg-purple-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>Analysing your article for visual opportunities</span>
                </motion.div>
            </motion.div>
        )
    }

    if (!prompts || prompts.length === 0) {
        return null
    }

    // Image Generation View
    if (selectedPrompt) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <Button variant="ghost" size="sm" onClick={handleTryAnother} className="gap-2 hover:bg-primary/5">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Prompts
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center mb-6 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent -z-10 rounded-2xl" />
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium mb-3"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles className="h-3 w-3" />
                        {selectedPrompt.id} • {selectedPrompt.style}
                    </motion.div>
                    <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Generate Image
                    </h2>
                </motion.div>

                {/* Options Panel - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card variant="glass" className="max-w-2xl mx-auto mb-6 overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <motion.div
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <Settings2 className="h-4 w-4 text-primary" />
                                </motion.div>
                                Generation Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="aspect-ratio" className="text-sm font-medium">Aspect Ratio</Label>
                                <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                                    <SelectTrigger id="aspect-ratio" className="h-11">
                                        <SelectValue placeholder="Select ratio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                        <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Model Speed</Label>
                                <RadioGroup
                                    value={model}
                                    onValueChange={(v) => setModel(v as ImageModel)}
                                    className="flex gap-4"
                                >
                                    <motion.div
                                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${model === 'standard' ? 'bg-primary/5 border-primary/30' : 'border-border hover:bg-muted/50'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setModel('standard')}
                                    >
                                        <RadioGroupItem value="standard" id="standard" />
                                        <Label htmlFor="standard" className="cursor-pointer">
                                            <span className="flex items-center gap-1.5">
                                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                                Fast
                                            </span>
                                            <span className="block text-xs text-muted-foreground mt-0.5">Gemini 2.5 Flash</span>
                                        </Label>
                                    </motion.div>
                                    <motion.div
                                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${model === 'pro' ? 'bg-primary/5 border-primary/30' : 'border-border hover:bg-muted/50'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setModel('pro')}
                                    >
                                        <RadioGroupItem value="pro" id="pro" />
                                        <Label htmlFor="pro" className="cursor-pointer">
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                                Quality
                                            </span>
                                            <span className="block text-xs text-muted-foreground mt-0.5">Gemini 3 Pro</span>
                                        </Label>
                                    </motion.div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Generate Button - Enhanced */}
                <motion.div
                    className="flex justify-center mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            size="lg"
                            variant="premium"
                            onClick={handleGenerateImage}
                            disabled={isGenerating}
                            className="w-full max-w-sm gap-3 h-14 text-lg shadow-lg shadow-primary/20"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-5 w-5" />
                                    Generate Image
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Image Display Area - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card variant="elevated" className="max-w-2xl mx-auto overflow-hidden">
                        <CardContent className="p-6">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="generating"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col items-center justify-center py-24"
                                    >
                                        <motion.div
                                            className="relative mb-6"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        >
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl" />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                                            </div>
                                        </motion.div>
                                        <p className="text-lg font-medium gradient-text">Generating your image...</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {model === 'pro' ? 'High quality mode (may take longer)' : 'Fast generation in progress'}
                                        </p>
                                    </motion.div>
                                ) : imageError ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-destructive/50" />
                                        </div>
                                        <p className="text-destructive mb-4">{imageError}</p>
                                        <Button onClick={handleGenerateImage} variant="outline" className="gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Try Again
                                        </Button>
                                    </motion.div>
                                ) : generatedImage ? (
                                    <motion.div
                                        key="image"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-6"
                                    >
                                        <motion.div
                                            className="relative rounded-xl overflow-hidden shadow-2xl"
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <img
                                                src={`data:${generatedImage.mediaType};base64,${generatedImage.base64}`}
                                                alt={selectedPrompt.description}
                                                className="w-full"
                                            />
                                            {/* Overlay gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                                        </motion.div>

                                        {/* Action Buttons - Enhanced */}
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    variant="premium"
                                                    size="lg"
                                                    className="gap-2 shadow-lg shadow-primary/20"
                                                    onClick={handleAcceptImage}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Accept Image
                                                </Button>
                                            </motion.div>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="gap-2"
                                                onClick={handleGenerateImage}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Regenerate
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="lg"
                                                className="gap-2"
                                                onClick={handleTryAnother}
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Try Another
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-24"
                                    >
                                        <motion.div
                                            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4"
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                                        </motion.div>
                                        <p className="text-muted-foreground">Click Generate to create your image</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Prompt Description - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card variant="glass" className="max-w-2xl mx-auto">
                        <CardContent className="py-4">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Prompt:</span> {selectedPrompt.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        )
    }

    // Prompt Selection View - Enhanced
    return (
        <motion.div
            key={prompts?.[0]?.id || 'assets'} // Unique key to force re-animation
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header - Enhanced */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between relative"
            >
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent -z-10 rounded-2xl" />
                <div>
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium mb-3"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Palette className="h-3 w-3" />
                        Visual Assets
                    </motion.div>
                    <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Asset Studio
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Select a prompt to generate an image for your article
                    </p>
                </div>

                {/* Accepted count badge */}
                {Object.keys(acceptedImages).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">{Object.keys(acceptedImages).length} accepted</span>
                    </motion.div>
                )}
            </motion.div>

            {/* Prompt Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {prompts.map((prompt, index) => {
                    const isAccepted = acceptedImages[prompt.id]
                    return (
                        <motion.div
                            key={prompt.id}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                variant={isAccepted ? "elevated" : "default"}
                                className={`h-full cursor-pointer transition-all duration-300 overflow-hidden group ${isAccepted
                                    ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                    : 'hover:shadow-xl hover:border-purple-500/30'
                                    }`}
                                onClick={() => handleSelectPrompt(prompt)}
                            >
                                {isAccepted ? (
                                    // Show accepted image with overlay
                                    <div className="relative">
                                        <img
                                            src={`data:${isAccepted.mediaType};base64,${isAccepted.base64}`}
                                            alt={prompt.description}
                                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <motion.div
                                            className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.div>
                                    </div>
                                ) : (
                                    // Empty state with animated icon
                                    <div className="h-48 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                                        <motion.div
                                            className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center"
                                            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        >
                                            <ImageIcon className="h-8 w-8 text-purple-500/40" />
                                        </motion.div>
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <span className="text-lg">{styleIcons[prompt.style] || '🎨'}</span>
                                            </motion.div>
                                            <CardTitle className="text-lg">{prompt.id}</CardTitle>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${styleColors[prompt.style]}`}>
                                            {prompt.style}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                        {prompt.description}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={isAccepted ? "secondary" : "premium"}
                                            size="sm"
                                            className="flex-1 gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSelectPrompt(prompt)
                                            }}
                                        >
                                            <Wand2 className="h-4 w-4" />
                                            {isAccepted ? 'View / Edit' : 'Generate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCopyPrompt(prompt)
                                            }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {copiedId === prompt.id ? (
                                                    <motion.div
                                                        key="check"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Check className="h-4 w-4 text-emerald-500" />
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
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Instructions - Enhanced */}
            <motion.div variants={itemVariants}>
                <Card variant="glass" className="border-dashed">
                    <CardContent className="py-4">
                        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Click a card to generate an image, or copy the prompt for external tools
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
