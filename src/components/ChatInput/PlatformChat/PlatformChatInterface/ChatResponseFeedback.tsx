import { Button } from "@/components/ui/button";
import { HandHelping, ThumbsUp, ThumbsDown, Mail, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/utils/store";
import { requestHelp, updateChatEntityMetadata } from "@/api/agentRoutes";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ChatResponseFeedbackProps {
    isStreaming?: boolean;
}

export default function ChatResponseFeedback({ isStreaming = false }: ChatResponseFeedbackProps) {
    const { toast } = useToast();
    const session = useStore((state) => state.session);
    const activeProject = useStore((state) => state.activeProject);
    const activeChatEntity = useStore((state) => state.activeChatEntity);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    
    // Email notification state
    const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(false);
    const [isEnablingEmailNotification, setIsEnablingEmailNotification] = useState(false);

    // Initialize email notification state from existing metadata
    useEffect(() => {
        if (activeChatEntity?.metadata?.notify_email) {
            setEmailNotificationEnabled(true);
        } else {
            setEmailNotificationEnabled(false);
        }
    }, [activeChatEntity?.metadata?.notify_email, activeChatEntity?.id]);

    // Reset email notification state when streaming ends (backend resets notify_email after sending)
    useEffect(() => {
        if (!isStreaming) {
            setEmailNotificationEnabled(false);
        }
    }, [isStreaming]);

    // Handle email notification opt-in
    const handleEmailNotificationToggle = async() => {
        if (!session || !activeChatEntity?.id || emailNotificationEnabled) return;
        
        setIsEnablingEmailNotification(true);
        try {
            // Get current metadata and preserve existing tags
            const currentTags = activeChatEntity.metadata?.tags || [];
            
            await updateChatEntityMetadata(session, activeChatEntity.id, {
                tags: currentTags,
                notify_email: true,
            });
            
            setEmailNotificationEnabled(true);
            toast({
                title: "Email Notification Enabled",
                description: "You'll receive an email when this chat completes.",
            });
        } catch (error) {
            console.error("Failed to enable email notification:", error);
            toast({
                title: "Error",
                description: "Failed to enable email notification. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsEnablingEmailNotification(false);
        }
    };

    const handleFeedback = async(feedback: string, helpful: boolean) => {
        try {
            if (!session || !activeProject) {
                toast({
                    title: "Error",
                    description: "No session or active project available",
                    variant: "destructive",
                });
                return;
            }
            
            await requestHelp(session, activeProject.project_id, activeChatEntity?.id ?? "", feedback, helpful);
            let message = "The Flowlly team has been notified and will assist you shortly.";

            switch (feedback) {
                case "thumbs up":
                    message = "Thank you for your feedback!";
                    break;
                case "thumbs down":
                    message = "Sorry to hear that.If you need help, please use the Get Human to Help button to request human assistance.";
                    break;
                default:
                    message = "Our team will manually review and fix the work. You'll be notified once complete.";
            }
            
        

            toast({
                title: feedbackText.trim() ? "Manual Review Requested" : "Help Request Sent",
                description: message,
                duration: 3000,
            });
            setIsDialogOpen(false);
            setFeedbackText("");
        } catch (error) {
            console.error("Failed to request help:", error);
            toast({
                title: "Request Failed",
                description: "Failed to send help request. Please try again.",
                variant: "destructive",
            });
        }
    }


    return ( 
        <div className="flex justify-start px-2 py-2 gap-2">
            {/* Email notification button - only visible when streaming */}
            {isStreaming ? (
                <Button
                    className={`text-xs transition-colors px-2 py-1 gap-1 h-auto border-none ${
                        emailNotificationEnabled
                            ? "text-green-500 hover:text-green-600 hover:bg-green-50/50"
                            : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50"
                    }`}
                    disabled={emailNotificationEnabled || isEnablingEmailNotification}
                    onClick={handleEmailNotificationToggle}
                    size="sm"
                    variant="ghost"
                >
                    {isEnablingEmailNotification ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : emailNotificationEnabled ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <Mail className="w-4 h-4" />
                    )}
                    <span title="Receive an email notification when this long-running chat completes">
                        {emailNotificationEnabled ? "Email notification enabled" : "Email me when complete"}
                    </span>
                </Button>
            ) : (
                <>
                    <Button
                        className="text-xs text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-none px-2 py-1 gap-1 h-auto transition-colors"
                        onClick={() => {
                            handleFeedback("thumbs up", true);
                        }}
                        size="sm"
                        variant="ghost"
                    >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful</span>
                    </Button>
                    <Button
                        className="text-xs text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-none px-2 py-1 gap-1 h-auto transition-colors"
                        onClick={() => {
                            handleFeedback("thumbs down", false);
                        }}
                        size="sm"
                        variant="ghost"
                    >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Not Helpful</span>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button
                            className="text-xs text-slate-400 text-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-none px-2 py-1 gap-1 h-auto transition-colors"
                            onClick={() => setIsDialogOpen(true)}
                            size="sm"
                            variant="ghost"
                        >
                            <HandHelping className="w-4 h-4" />
                            <span title="Flowlly team will review the chat and complete the task !">Get manual review & fix</span>
                        </Button>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader className="space-y-3 pb-2">
                                <DialogTitle className="text-lg">Request Manual Review & Fix</DialogTitle>
                                <DialogDescription className="text-sm leading-relaxed">
                                    Our team will manually review the work manually and fix any issues. You'll be notified by email once the review is complete, typically within 2-4 hours.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-2">
                                <div className="space-y-3">
                                    <label htmlFor="feedback" className="text-sm font-medium text-foreground block">
                                        What needs to be fixed or corrected?
                                    </label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Describe what's incorrect or what changes you'd like our team to make..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        className="min-h-[120px] resize-none text-sm leading-relaxed"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setFeedbackText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleFeedback(feedbackText, false)}
                                    disabled={!feedbackText.trim()}
                                >
                                    Request Manual Fix
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    )
}