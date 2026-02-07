'use client';

import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    type Dispatch,
    type SetStateAction,
    type ChangeEvent,
    memo,
} from 'react';

import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 as LoaderIcon, X as XIcon, Paperclip, StopCircle, ArrowUp } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');

// Type Definitions
export interface Attachment {
    url: string;
    name: string;
    contentType: string;
    size: number;
}

export interface UIMessage {
    id: string;
    content: string;
    role: string;
    attachments?: Attachment[];
}

export type VisibilityType = 'public' | 'private' | 'unlisted' | string;

// Utility Functions
const cn = (...inputs: any[]) => {
    return twMerge(clsx(inputs));
};

// Button variants using cva
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                // Primary: black background, white text
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                // Destructive: high-contrast gray outline, black text
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                // Outline: grayscale border, white background, black text
                outline:
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                // Secondary: grayscale background, gray text
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                // Ghost: hover effect, default text color (should be black)
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                // Link: black text
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

// Button component
interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? 'button' : 'button';

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

// Textarea component
const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                // Adjusted text color, placeholder color, and border/ring colors to grayscale
                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

// Sub-Components

interface SuggestedActionsProps {
    chatId: string;
    onSelectAction: (action: string) => void;
    selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
    onSelectAction,
}: SuggestedActionsProps) {
    const suggestedActions = [
        {
            title: 'Make it',
            label: 'more concise',
            action: 'Make it more concise',
        },
        {
            title: 'Add a',
            label: 'stronger opening',
            action: 'Add a stronger opening hook',
        },
        {
            title: 'Fix',
            label: 'grammar & tone',
            action: 'Fix grammar and improve tone',
        },
        {
            title: 'Optimize for',
            label: 'LinkedIn engagement',
            action: 'Optimize for LinkedIn engagement',
        },
    ];

    return (
        <div
            data-testid="suggested-actions"
            className="grid pb-2 sm:grid-cols-2 gap-2 w-full"
        >
            <AnimatePresence>
                {suggestedActions.map((suggestedAction, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: 0.05 * index }}
                        key={`suggested-action-${index}`}
                        className={index > 1 ? 'hidden sm:block' : 'block'}
                    >
                        <Button
                            variant="outline"
                            onClick={() => onSelectAction(suggestedAction.action)}
                            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
                        >
                            <span className="font-medium">{suggestedAction.title}</span>
                            <span className="text-muted-foreground font-normal">
                                {suggestedAction.label}
                            </span>
                        </Button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

const SuggestedActions = memo(
    PureSuggestedActions,
    (prevProps, nextProps) => {
        if (prevProps.chatId !== nextProps.chatId) return false;
        if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
            return false;
        return true;
    },
);


const PreviewAttachment = ({
    attachment,
    isUploading = false,
}: {
    attachment: Attachment;
    isUploading?: boolean;
}) => {
    const { name, url, contentType } = attachment;

    return (
        <div data-testid="input-attachment-preview" className="flex flex-col gap-1">
            <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center overflow-hidden border border-input">
                {contentType?.startsWith('image/') && url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={url}
                        src={url}
                        alt={name ?? 'An image attachment'}
                        className="rounded-md size-full object-cover grayscale"
                    />
                ) : (
                    <div className="flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                        File: {name?.split('.').pop()?.toUpperCase() || 'Unknown'}
                    </div>
                )}

                {isUploading && (
                    <div
                        data-testid="input-attachment-loader"
                        className="animate-spin absolute text-muted-foreground"
                    >
                        <LoaderIcon className="size-5" />
                    </div>
                )}
            </div>
            <div className="text-xs text-muted-foreground max-w-20 truncate">
                {name}
            </div>
        </div>
    );
};

function PureAttachmentsButton({
    fileInputRef,
    disabled,
}: {
    fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
    disabled: boolean;
}) {
    return (
        <Button
            data-testid="attachments-button"
            className="rounded-md rounded-bl-lg p-[7px] h-fit border border-input hover:bg-accent hover:text-accent-foreground"
            onClick={(event) => {
                event.preventDefault();
                fileInputRef.current?.click();
            }}
            disabled={disabled}
            variant="ghost"
            aria-label="Attach files"
        >
            <Paperclip size={14} />
        </Button>
    );
}

const AttachmentsButton = memo(PureAttachmentsButton, (prev, next) => prev.disabled === next.disabled);

function PureStopButton({ onStop }: { onStop: () => void }) {
    return (
        <Button
            data-testid="stop-button"
            className="rounded-full p-1.5 h-fit"
            onClick={(event) => {
                event.preventDefault();
                onStop();
            }}
            aria-label="Stop generating"
        >
            <StopCircle size={14} />
        </Button>
    );
}

const StopButton = memo(PureStopButton, (prev, next) => prev.onStop === next.onStop);

function PureSendButton({
    submitForm,
    input,
    uploadQueue,
    attachments,
    canSend,
    isGenerating,
}: {
    submitForm: () => void;
    input: string;
    uploadQueue: Array<string>;
    attachments: Array<Attachment>;
    canSend: boolean;
    isGenerating: boolean;
}) {
    const isDisabled =
        uploadQueue.length > 0 ||
        !canSend ||
        isGenerating ||
        (input.trim().length === 0 && attachments.length === 0);

    return (
        <Button
            data-testid="send-button"
            className="rounded-full p-1.5 h-fit"
            onClick={(event) => {
                event.preventDefault();
                if (!isDisabled) {
                    submitForm();
                }
            }}
            disabled={isDisabled}
            aria-label="Send message"
        >
            <ArrowUp size={14} />
        </Button>
    );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
    if (prevProps.attachments.length !== nextProps.attachments.length) return false;
    if (prevProps.attachments.length > 0 && !equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.canSend !== nextProps.canSend) return false;
    if (prevProps.isGenerating !== nextProps.isGenerating) return false;
    return true;
});


// Main Component

export interface MultimodalInputProps {
    chatId: string;
    messages?: Array<UIMessage>;
    attachments?: Array<Attachment>;
    onSendMessage: (params: { input: string; attachments: Attachment[] }) => void;
    onStopGenerating?: () => void;
    isGenerating: boolean;
    canSend?: boolean;
    className?: string;
    selectedVisibilityType?: VisibilityType;
}

export function MultimodalInput({
    chatId,
    messages = [],
    attachments: externalAttachments,
    onSendMessage,
    onStopGenerating,
    isGenerating,
    canSend = true,
    className,
    selectedVisibilityType = 'private',
}: MultimodalInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [input, setInput] = useState('');
    const [internalAttachments, setInternalAttachments] = useState<Array<Attachment>>([]);
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

    // Use external attachments if provided, otherwise internal
    const attachments = externalAttachments || internalAttachments;
    const setAttachments = externalAttachments ? () => { } : setInternalAttachments;

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight + 2}px`;
        }
    };

    const resetHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.rows = 1;
            adjustHeight();
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, [input]); // Depend only on input

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    // Placeholder File Upload Function
    const uploadFile = async (file: File): Promise<Attachment | undefined> => {
        console.log(`MOCK: Simulating upload for file: ${file.name}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // Use URL.createObjectURL for client-side preview. Remember to revoke!
                    const mockUrl = URL.createObjectURL(file);
                    const mockAttachment: Attachment = {
                        url: mockUrl,
                        name: file.name,
                        contentType: file.type || 'application/octet-stream',
                        size: file.size,
                    };
                    console.log(`MOCK: Upload successful for ${file.name}`);
                    resolve(mockAttachment);
                } catch (error) {
                    console.error('MOCK: Failed to create object URL for preview:', error);
                    resolve(undefined);
                } finally {
                    // Remove file name from upload queue
                    setUploadQueue(currentQueue => currentQueue.filter(name => name !== file.name));
                }
            }, 700); // Simulate delay
        });
    };

    const handleFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;

            // Add files to upload queue immediately by name
            setUploadQueue(currentQueue => [...currentQueue, ...files.map((file) => file.name)]);

            // Clear the file input value to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
            const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
            const invalidFiles = files.filter(file => file.size > MAX_FILE_SIZE);

            if (invalidFiles.length > 0) {
                console.warn(`Skipped ${invalidFiles.length} files larger than ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
                // Also remove invalid files from the upload queue
                setUploadQueue(currentQueue => currentQueue.filter(name => !invalidFiles.some(f => f.name === name)));
            }

            // Start uploads for valid files
            const uploadPromises = validFiles.map((file) => uploadFile(file));
            const uploadedAttachments = await Promise.all(uploadPromises);

            const successfullyUploadedAttachments = uploadedAttachments.filter(
                (attachment): attachment is Attachment => attachment !== undefined,
            );

            // Add successfully uploaded attachments to the main attachments list
            if (!externalAttachments) {
                setInternalAttachments((currentAttachments) => [
                    ...currentAttachments,
                    ...successfullyUploadedAttachments,
                ]);
            }

        },
        [externalAttachments, setInternalAttachments, uploadFile],
    );

    const handleRemoveAttachment = useCallback(
        (attachmentToRemove: Attachment) => {
            // Revoke the object URL
            if (attachmentToRemove.url.startsWith('blob:')) {
                URL.revokeObjectURL(attachmentToRemove.url);
            }

            if (!externalAttachments) {
                // Filter out the attachment
                setInternalAttachments((currentAttachments) =>
                    currentAttachments.filter(
                        (attachment) => attachment.url !== attachmentToRemove.url || attachment.name !== attachmentToRemove.name
                    )
                );
            }
            // Focus the textarea
            textareaRef.current?.focus();
        },
        [externalAttachments, setInternalAttachments, textareaRef]
    );

    const submitForm = useCallback(() => {
        if (input.trim().length === 0 && attachments.length === 0) {
            console.warn('Please enter a message or add an attachment.');
            return;
        }

        onSendMessage({ input, attachments });

        // Clear input and attachments
        setInput('');
        if (!externalAttachments) {
            setInternalAttachments([]);
        }

        // Revoke object URLs for sent attachments
        attachments.forEach(att => {
            if (att.url.startsWith('blob:')) {
                URL.revokeObjectURL(att.url);
            }
        });

        resetHeight();
        textareaRef.current?.focus();

    }, [
        input,
        attachments,
        externalAttachments,
        onSendMessage,
        setInternalAttachments,
        textareaRef,
        resetHeight,
    ]);

    const showSuggestedActions = messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0;

    const isAttachmentDisabled = isGenerating || uploadQueue.length > 0;

    return (
        <div className={cn("relative w-full flex flex-col gap-4", className)}>

            <AnimatePresence>
                {showSuggestedActions && (
                    <motion.div
                        key="suggested-actions-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SuggestedActions
                            onSelectAction={(action) => {
                                setInput(action);
                                requestAnimationFrame(() => {
                                    adjustHeight();
                                    textareaRef.current?.focus();
                                });
                            }}
                            chatId={chatId}
                            selectedVisibilityType={selectedVisibilityType}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Hidden file input */}
            <input
                type="file"
                className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                tabIndex={-1}
                disabled={isAttachmentDisabled}
                accept="image/*,video/*,audio/*,.pdf" // Example mime types
            />

            {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div
                    data-testid="attachments-preview"
                    className="flex pt-[10px] flex-row gap-3 overflow-x-auto items-end pb-2 pl-1"
                >
                    {attachments.map((attachment) => (
                        <div key={attachment.url || attachment.name} className="relative group">
                            <PreviewAttachment attachment={attachment} isUploading={false} />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-[-8px] right-[-8px] h-5 w-5 rounded-full p-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveAttachment(attachment)}
                                aria-label={`Remove ${attachment.name}`}
                            >
                                <XIcon className="size-3" />
                            </Button>
                        </div>
                    ))}
                    {uploadQueue.map((filename, index) => (
                        <PreviewAttachment
                            key={`upload-${filename}-${index}`}
                            attachment={{ url: '', name: filename, contentType: '', size: 0 }}
                            isUploading={true}
                        />
                    ))}
                </div>
            )}

            <div className="relative">
                <Textarea
                    data-testid="multimodal-input"
                    ref={textareaRef}
                    placeholder="How can I improve this draft?"
                    value={input}
                    onChange={handleInput}
                    className={cn(
                        'min-h-[50px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-2xl !text-base pb-10 pl-10 pr-12',
                        'bg-muted/50 border-input shadow-sm focus-visible:ring-1 focus-visible:ring-ring',
                        className,
                    )}
                    rows={1}
                    disabled={!canSend || isGenerating || uploadQueue.length > 0}
                    onKeyDown={(event) => {
                        if (
                            event.key === 'Enter' &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                        ) {
                            event.preventDefault();

                            const canSubmit = canSend && !isGenerating && uploadQueue.length === 0 && (input.trim().length > 0 || attachments.length > 0);

                            if (canSubmit) {
                                submitForm();
                            }
                        }
                    }}
                />

                <div className="absolute bottom-2 left-2 z-10">
                    <AttachmentsButton
                        fileInputRef={fileInputRef}
                        disabled={isAttachmentDisabled}
                    />
                </div>

                <div className="absolute bottom-2 right-2 z-10">
                    {isGenerating ? (
                        <StopButton onStop={() => onStopGenerating?.()} />
                    ) : (
                        <SendButton
                            submitForm={submitForm}
                            input={input}
                            uploadQueue={uploadQueue}
                            attachments={attachments}
                            canSend={!!canSend}
                            isGenerating={isGenerating}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
