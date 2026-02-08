'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowRight, Loader2, Sparkles, BookOpen, TrendingUp, AlertCircle, ShieldCheck, AlertTriangle, CircleHelp, Calendar, Building } from 'lucide-react'
import type { ResearchResult } from '@/lib/ai/research'
import type { Angle } from '@/lib/ai/ideation'

interface ResearchDashboardProps {
    angle: Angle
    research: ResearchResult | null
    isLoading: boolean
    onProceed: () => void
}

// Stagger animation container
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
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

export function ResearchDashboard({ angle, research, isLoading, onProceed }: ResearchDashboardProps) {
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20"
            >
                {/* Animated loading container */}
                <motion.div
                    className="relative mb-8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-xl" />
                    <motion.div
                        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </motion.div>
                </motion.div>

                {/* Loading text with gradient */}
                <motion.h3
                    className="text-xl font-semibold mb-2 gradient-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Researching your topic...
                </motion.h3>

                {/* Progress steps */}
                <motion.div
                    className="flex flex-col items-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span>Gathering sources and evidence</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70">This may take up to 30 seconds</p>
                </motion.div>
            </motion.div>
        )
    }

    if (!research) {
        return (
            <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">No Research Data</h3>
                        <p className="text-muted-foreground">
                            Research completed but no results were returned. Please try again.
                        </p>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        Refresh Page
                    </Button>
                </div>
            </Card>
        )
    }

    // Add unique key to force animation re-trigger when research data changes
    return (
        <motion.div
            key={research.summary.substring(0, 50)} // Unique key from research data
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Angle Header - Modernized */}
            <motion.div
                variants={itemVariants}
                className="text-center pb-6 relative"
            >
                {/* Decorative background */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent -z-10 rounded-2xl" />

                <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    <Sparkles className="h-3 w-3" />
                    #{angle.id}
                </motion.div>

                <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {angle.title}
                </h2>

                <motion.div
                    className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                />
            </motion.div>

            {/* Research Summary - Glass Card */}
            <motion.div variants={itemVariants}>
                <Card variant="glass" className="overflow-hidden">
                    <CardHeader className="relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                        <CardTitle className="flex items-center gap-3 relative">
                            <motion.div
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <BookOpen className="h-5 w-5 text-primary" />
                            </motion.div>
                            <span>Research Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <motion.p
                            className="text-foreground/80 leading-relaxed whitespace-pre-line text-base"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {research.summary}
                        </motion.p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Two-column layout for Evidence Ledger and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evidence Ledger - Cards */}
                <motion.div variants={itemVariants}>
                    <Card variant="elevated" className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <motion.div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                                </motion.div>
                                <div>
                                    <span>Evidence Ledger</span>
                                    <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {research.evidenceLedger.length}
                                    </span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <AnimatePresence>
                                {research.evidenceLedger.map((evidence, index) => (
                                    <motion.div
                                        key={evidence.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                        className="group relative"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-500/30 rounded-full group-hover:w-1 transition-all" />
                                        <div className="pl-4 py-2">
                                            <a
                                                href={evidence.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-start gap-2 group/link"
                                            >
                                                <span className="flex-1">{evidence.title}</span>
                                                <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </a>
                                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                                    <Building className="h-3 w-3" />
                                                    {evidence.publisher}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {evidence.publishedDate}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {evidence.sourceTier}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                                    <CircleHelp className="h-3 w-3" />
                                                    {evidence.id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">{evidence.relevance}</p>
                                            <p className="text-xs text-foreground/80 mt-2 italic">“{evidence.quoteOrFinding}”</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Key Stats - Enhanced */}
                <motion.div variants={itemVariants}>
                    <Card variant="elevated" className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <motion.div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </motion.div>
                                <span>Key Statistics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <AnimatePresence>
                                {research.keyStats.map((stat, index) => (
                                    <motion.div
                                        key={`${stat.sourceId}-${index}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: -4 }}
                                        className="flex items-start gap-3 group"
                                    >
                                        <motion.span
                                            className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex-shrink-0"
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                        >
                                            {index + 1}
                                        </motion.span>
                                        <div className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                            <div>{stat.stat}</div>
                                            <div className="mt-1 text-[11px] text-muted-foreground">
                                                Source: {stat.sourceId}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Evidence Gaps + Confidence */}
            <motion.div variants={itemVariants}>
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <motion.div
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10"
                                whileHover={{ scale: 1.1 }}
                            >
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </motion.div>
                            <span>Evidence Gaps & Confidence</span>
                            <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {research.confidence.toUpperCase()}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {research.gaps.map((gap, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                                <span>{gap}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Proceed Button - Enhanced */}
            <motion.div
                variants={itemVariants}
                className="flex justify-center pt-6"
            >
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={onProceed}
                        variant="premium"
                        size="lg"
                        className="gap-3 px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                    >
                        <span>Proceed to Writing</span>
                        <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
