import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface MeetingDocumentEditorProps {
  type: "agenda" | "template";
  eventId: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export default function MeetingDocumentEditor({
	type,
	eventId,
	onSave,
	onClose,
}: MeetingDocumentEditorProps) : JSX.Element {
	const [editedContent, setEditedContent] = useState("");

	const handleSave = (): void => {
		onSave(editedContent);
		onClose();
	};

	return (
		<Card className="w-full shadow-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>
					{type === "agenda" ? "Meeting Agenda" : "Meeting Template"}
				</CardTitle>
				<Button onClick={onClose}
					size="icon"
					variant="ghost"
				>
					<X className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="content">
							{type === "agenda"
								? "Enter the meeting agenda points"
								: "Enter the meeting template"}
						</Label>
						<Textarea
							className="min-h-[300px]"
							id="content"
							onChange={(e) => setEditedContent(e.target.value)}
							placeholder={
								type === "agenda"
									? "1. Introduction\n2. Project Updates\n3. Discussion Points\n4. Action Items"
									: "Meeting Title: [Title]\nDate: [Date]\nTime: [Time]\n\nAttendees:\n- [Name]\n\nAgenda:\n1. [Point 1]\n2. [Point 2]\n\nNotes:\n- [Note 1]\n- [Note 2]\n\nAction Items:\n- [Action 1]\n- [Action 2]"
							}
							value={editedContent}
						/>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-end space-x-2">
				<Button onClick={onClose} variant="outline">
          Cancel
				</Button>
				<Button onClick={handleSave}>Save</Button>
			</CardFooter>
		</Card>
	);
} 