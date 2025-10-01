import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Download, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface CalendarConnectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMeetings: () => void;
  onSkip: () => void;
}

function CalendarConnectionSuccessDialog({ 
	isOpen, 
	onClose, 
	onImportMeetings, 
	onSkip, 
}: CalendarConnectionSuccessDialogProps): React.ReactNode {
	const { toast } = useToast();

	const handleImportNow = (): void => {
		onImportMeetings();
		onClose();
	};

	const handleSkipForNow = (): void => {
		toast({
			title: "Calendar Connected",
			description: "You can import meetings anytime from the Calendar Connected menu.",
		});
		onSkip();
		onClose();
	};

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CheckCircle2 className="h-6 w-6 text-green-500" />
            Microsoft Calendar Connected!
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="text-center">
						<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<Calendar className="h-8 w-8 " />
						</div>
						<p className="text-sm text-muted-foreground">
              All newly added or edited meetings will be synced to your project timeline.
						</p>
					</div>
					<div className=" border border-blue-200 rounded-lg p-4">
						<h3 className="font-medium  mb-2">Whats&apos;s Next?</h3>
						<p className="text-sm  mb-3">
              To add past meetings, you can import from your calendar.
						</p>
					</div>
				</div>
				<DialogFooter className="flex items-center justify-between">
					<Button onClick={handleSkipForNow} variant="outline">
            Skip for Now
					</Button>
					<Button className="bg-indigo-500 hover:bg-indigo-600" onClick={handleImportNow}>
						<Download className="mr-2 h-4 w-4" />
            Import Meetings
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CalendarConnectionSuccessDialog;
