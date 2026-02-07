'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'shimmer' | 'pulse'
}

function Skeleton({ className, variant = 'shimmer', ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-lg bg-muted",
                variant === 'shimmer' && "skeleton-shimmer",
                variant === 'pulse' && "skeleton",
                variant === 'default' && "animate-pulse",
                className
            )}
            {...props}
        />
    )
}

// Pre-built skeleton patterns
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
            <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

function SkeletonText({
    lines = 3,
    className
}: {
    lines?: number
    className?: string
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === lines - 1 ? "w-2/3" : "w-full"
                    )}
                />
            ))}
        </div>
    )
}

function SkeletonAngleCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card overflow-hidden relative shadow-lg", className)}>
            {/* Electric shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

            <div className="p-6 space-y-4 relative z-10">
                {/* Title */}
                <div className="space-y-2">
                    <Skeleton variant="shimmer" className="h-6 w-4/5" />
                    <Skeleton variant="shimmer" className="h-3 w-1/3" />
                </div>

                {/* Hook blockquote */}
                <div className="border-l-4 border-primary/30 pl-4 py-2">
                    <Skeleton variant="shimmer" className="h-4 w-full" />
                    <Skeleton variant="shimmer" className="h-4 w-3/4 mt-2" />
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                    <Skeleton variant="shimmer" className="h-3 w-full" />
                    <Skeleton variant="shimmer" className="h-3 w-full" />
                    <Skeleton variant="shimmer" className="h-3 w-1/2" />
                </div>

                {/* Button */}
                <Skeleton variant="shimmer" className="h-10 w-full rounded-lg" />
            </div>
        </div>
    )
}

function SkeletonResearch({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-8", className)}>
            {/* Header */}
            <div className="text-center space-y-2 pb-6 border-b">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-8 w-96 mx-auto" />
            </div>

            {/* Summary Card */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>

            {/* Two column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Citations */}
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="border-l-2 border-muted pl-3 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Button */}
            <div className="flex justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        </div>
    )
}

function SkeletonArticle({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Title */}
            <Skeleton className="h-10 w-3/4" />

            {/* Meta */}
            <Skeleton className="h-4 w-32" />

            {/* Content */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                <Skeleton className="h-7 w-1/2" />

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <Skeleton className="h-7 w-2/3" />

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    )
}

function SkeletonImagePrompt({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
            {/* Image placeholder */}
            <Skeleton className="h-48 w-full rounded-none" />

            <div className="p-6 space-y-4">
                {/* Title and badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>
        </div>
    )
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonText,
    SkeletonAngleCard,
    SkeletonResearch,
    SkeletonArticle,
    SkeletonImagePrompt
}
