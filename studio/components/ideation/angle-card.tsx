'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Check } from 'lucide-react'
import type { Angle } from '@/lib/ai/ideation'

interface AngleCardProps {
    angle: Angle
    index: number
    onSelect: (angle: Angle) => void
    isSelected?: boolean
}

export function AngleCard({ angle, index, onSelect, isSelected }: AngleCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
                delay: index * 0.1,
                duration: 0.4,
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
            data-testid="angle-card"
        >
            {/* Electric glow effect for selected state */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-[#FF3366]/20 to-primary/30 rounded-2xl blur-xl animate-pulse"
                    />
                )}
            </AnimatePresence>

            <Card
                variant={isSelected ? "elevated" : "default"}
                className={`relative cursor-pointer transition-all duration-300 overflow-hidden group rounded-2xl
                    ${isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-2xl shadow-primary/20 scale-[1.02]'
                        : 'hover:shadow-2xl hover:border-primary/40 hover:shadow-primary/10 border-border/50'
                    }`}
                onClick={() => onSelect(angle)}
            >
                {/* Electric shimmer effect on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full"
                    initial={false}
                    whileHover={{ translateX: '200%' }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                />

                {/* Selected badge */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0, rotate: 180 }}
                            transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                            className="absolute top-3 right-3 z-10"
                        >
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-[#FF3366] text-white text-xs font-bold shadow-xl uppercase tracking-wide">
                                <Check className="h-3.5 w-3.5" />
                                Selected
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <CardHeader className="relative">
                    <motion.div
                        className="flex items-start gap-3"
                        layout
                    >
                        <motion.div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-300 ${
                                isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                            }`}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Sparkles className="h-5 w-5" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors duration-300">
                                {angle.title}
                            </CardTitle>
                            <CardDescription className="text-xs font-mono text-primary/60 mt-1.5 font-bold">
                                #{angle.id.substring(0, 8).toUpperCase()}
                            </CardDescription>
                        </div>
                    </motion.div>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                    {/* Hook with animated border */}
                    <motion.blockquote
                        className="relative pl-4 italic text-foreground/80"
                        initial={{ borderLeftWidth: 2 }}
                        whileHover={{ borderLeftWidth: 4 }}
                    >
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                        />
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            "{angle.hook}"
                        </motion.span>
                    </motion.blockquote>

                    <motion.p
                        className="text-sm text-muted-foreground leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                    >
                        {angle.pitch}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                    >
                        <Button
                            variant={isSelected ? "default" : "outline"}
                            className={`w-full justify-between group/btn overflow-hidden relative ${
                                isSelected ? 'bg-primary hover:bg-primary/90' : ''
                            }`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelect(angle)
                            }}
                        >
                            <span className="relative z-10">
                                {isSelected ? 'Selected' : 'Select this angle'}
                            </span>
                            <motion.div
                                className="relative z-10"
                                animate={isSelected ? { x: [0, 4, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                                {isSelected ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                )}
                            </motion.div>

                            {/* Button hover gradient overlay */}
                            {!isSelected && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                />
                            )}
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
