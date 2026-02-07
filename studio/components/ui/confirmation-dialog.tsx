'use client'

import * as React from 'react'
import { AlertTriangle, ImageOff } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel?: () => void
    variant?: 'warning' | 'danger' | 'info'
    icon?: React.ReactNode
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Continue',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning',
    icon
}: ConfirmationDialogProps) {
    const handleCancel = () => {
        onCancel?.()
        onOpenChange(false)
    }

    const handleConfirm = () => {
        onConfirm()
        onOpenChange(false)
    }

    const iconColors = {
        warning: 'text-amber-500',
        danger: 'text-destructive',
        info: 'text-primary'
    }

    const iconBgColors = {
        warning: 'bg-amber-500/10',
        danger: 'bg-destructive/10',
        info: 'bg-primary/10'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-3 rounded-full ${iconBgColors[variant]}`}>
                            {icon || <AlertTriangle className={`h-6 w-6 ${iconColors[variant]}`} />}
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl">{title}</DialogTitle>
                            <DialogDescription className="text-base leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Specific dialog for image generation warning
interface ImageWarningDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onContinueWithoutImage: () => void
    onGenerateImage: () => void
}

export function ImageWarningDialog({
    open,
    onOpenChange,
    onContinueWithoutImage,
    onGenerateImage
}: ImageWarningDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 rounded-full bg-amber-500/10">
                            <ImageOff className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl">No Image Generated</DialogTitle>
                            <DialogDescription className="text-base leading-relaxed">
                                You haven&apos;t generated an image for your post. LinkedIn posts with images typically get <strong className="text-foreground">2x more engagement</strong> than text-only posts.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-muted/50 rounded-lg p-4 my-4">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Tip:</strong> Select one of the AI-generated image prompts above and click &quot;Generate Image&quot; to create a custom visual for your post.
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onContinueWithoutImage}>
                        Continue without image
                    </Button>
                    <Button variant="premium" onClick={() => {
                        onGenerateImage()
                        onOpenChange(false)
                    }}>
                        Generate an image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
