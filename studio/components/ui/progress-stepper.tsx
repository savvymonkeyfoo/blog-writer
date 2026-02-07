'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Step {
    id: string
    label: string
    description?: string
}

interface ProgressStepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
    className?: string
}

export function ProgressStepper({
    steps,
    currentStep,
    onStepClick,
    className
}: ProgressStepperProps) {
    const progress = ((currentStep) / (steps.length - 1)) * 100

    return (
        <div className={cn("w-full", className)}>
            {/* Desktop Stepper */}
            <div className="hidden md:block">
                <div className="relative flex items-center justify-between">
                    {/* Progress Line Background */}
                    <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-border rounded-full" />

                    {/* Progress Line Fill - Electric gradient */}
                    <motion.div
                        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-primary via-blue-600 to-[#FF3366] rounded-full shadow-lg shadow-primary/30"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />

                    {/* Steps */}
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isActive = index === currentStep
                        const isPending = index > currentStep

                        return (
                            <div
                                key={step.id}
                                className="relative flex flex-col items-center"
                            >
                                {/* Step Circle */}
                                <motion.button
                                    onClick={() => onStepClick?.(index)}
                                    disabled={isPending || !onStepClick}
                                    className={cn(
                                        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 font-mono",
                                        isCompleted && "border-2 border-primary bg-primary text-white shadow-xl shadow-primary/40",
                                        isActive && "border-[3px] border-primary text-white shadow-[0_0_0_2px_#0066FF,0_0_20px_rgba(0,102,255,0.6),0_0_40px_rgba(255,51,102,0.3)] ring-2 ring-[#FF3366]/50",
                                        isPending && "border-2 border-border/50 bg-muted text-muted-foreground",
                                        !isPending && onStepClick && "cursor-pointer hover:scale-110"
                                    )}
                                    style={isActive ? {
                                        backgroundColor: '#0A1628'
                                    } : {}}
                                    animate={isActive ? {
                                        boxShadow: [
                                            "0 0 0 2px #0066FF, 0 0 20px rgba(0, 102, 255, 0.6), 0 0 40px rgba(255, 51, 102, 0.3)",
                                            "0 0 0 2px #0066FF, 0 0 30px rgba(0, 102, 255, 0.8), 0 0 60px rgba(255, 51, 102, 0.5)",
                                            "0 0 0 2px #0066FF, 0 0 20px rgba(0, 102, 255, 0.6), 0 0 40px rgba(255, 51, 102, 0.3)"
                                        ]
                                    } : {}}
                                    transition={isActive ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    } : {}}
                                    whileHover={!isPending && onStepClick ? { scale: 1.1, rotate: 5 } : {}}
                                    whileTap={!isPending && onStepClick ? { scale: 0.95 } : {}}
                                >
                                    <span className="relative z-10 font-bold">
                                        {index + 1}
                                    </span>
                                </motion.button>

                                {/* Step Label */}
                                <div className="absolute top-16 flex flex-col items-center">
                                    <span
                                        className={cn(
                                            "text-sm font-bold whitespace-nowrap transition-colors uppercase tracking-wider font-mono",
                                            isActive && "text-primary text-base",
                                            isCompleted && "text-foreground",
                                            isPending && "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {step.description && (
                                        <span className="text-xs text-muted-foreground mt-1 hidden lg:block font-sans normal-case">
                                            {step.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                        {steps[currentStep]?.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>

                {/* Mobile Progress Bar */}
                <div className="relative h-2 w-full bg-border rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-600 to-[#FF3366] rounded-full shadow-lg shadow-primary/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {/* Mobile Step Indicators */}
                <div className="flex justify-between mt-2">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep
                        const isActive = index === currentStep

                        return (
                            <button
                                key={step.id}
                                onClick={() => onStepClick?.(index)}
                                disabled={index > currentStep || !onStepClick}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-all",
                                    isCompleted && "bg-primary",
                                    isActive && "bg-primary w-4",
                                    index > currentStep && "bg-border"
                                )}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// Compact variant for inline use
export function ProgressStepperCompact({
    steps,
    currentStep,
    className
}: Omit<ProgressStepperProps, 'onStepClick'>) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep
                const isActive = index === currentStep

                return (
                    <React.Fragment key={step.id}>
                        <div
                            className={cn(
                                "flex items-center gap-1.5 text-sm",
                                isActive && "text-primary font-medium",
                                isCompleted && "text-primary font-medium",
                                index > currentStep && "text-muted-foreground/50"
                            )}
                        >
                            <span
                                className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                                    isActive && "bg-primary text-primary-foreground",
                                    isCompleted && "bg-primary text-primary-foreground",
                                    index > currentStep && "bg-muted text-muted-foreground"
                                )}
                            >
                                {index + 1}
                            </span>
                            <span className="hidden sm:inline">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-px w-4 sm:w-8",
                                    index < currentStep ? "bg-primary" : "bg-border"
                                )}
                            />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
