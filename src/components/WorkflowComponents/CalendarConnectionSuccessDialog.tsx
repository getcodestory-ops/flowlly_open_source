import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CalendarConnectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CalendarConnectionSuccessDialog({ 
	isOpen, 
	onClose, 
}: CalendarConnectionSuccessDialogProps): React.ReactNode {
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
              All future meetings from your Microsoft Calendar will automatically appear in your Flowlly calendar.
						</p>
					</div>
					<div className=" border border-blue-200 rounded-lg p-4 bg-blue-50">
						<h3 className="font-medium mb-2">What&apos;s Next?</h3>
						<p className="text-sm text-muted-foreground">
              Your calendar is now connected and syncing. View all your meetings in the calendar view.
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button className="bg-indigo-500 hover:bg-indigo-600 w-full" onClick={onClose}>
            Got it!
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CalendarConnectionSuccessDialog;
