import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Loader2, CheckCircle2, AlertCircle, CalendarDays, Repeat, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getCalendarEvents, importCalendarEvents } from "@/api/integration_routes";
import { FormattedCalendarEvent, CalendarRecurrence } from "@/types/calendar";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface ImportMeetingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function ImportMeetingsDialog({ isOpen, onClose }: ImportMeetingsDialogProps): React.ReactNode {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
		const today = new Date();
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		return {
			from: today,
			to: nextWeek,
		};
	});

	const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
	const [hasSearched, setHasSearched] = useState(false);

	// Fetch calendar events
	const { 
		data: calendarData, 
		isLoading: isLoadingEvents, 
		refetch: refetchEvents,
		error: eventsError, 
	} = useQuery({
		queryKey: ["calendarEvents", activeProject?.project_id, dateRange?.from, dateRange?.to],
		queryFn: () => {
			if (!dateRange?.from || !dateRange?.to) return Promise.reject("Date range required");
			return getCalendarEvents(
				session!, 
				activeProject?.project_id!, 
				format(dateRange.from, "yyyy-MM-dd"), 
				format(dateRange.to, "yyyy-MM-dd"),
			);
		},
		enabled: false, // Only fetch when user clicks search
	});

	// Import selected events mutation
	const { mutate: importEvents, isPending: isImporting } = useMutation({
		mutationFn: () => importCalendarEvents(session!, activeProject?.project_id!, {
			resource_ids: Array.from(selectedEvents),
		}),
		onSuccess: async() => {
			// Invalidate and refetch project events to show newly imported meetings
			await queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
			
			toast({
				title: "Import Successful!",
				description: "Successfully imported meetings.",
			});
			onClose();
			setSelectedEvents(new Set());
			setHasSearched(false);
		},
		onError: (error: unknown) => {
			const errorMessage = error && typeof error === "object" && "response" in error && 
				error.response && typeof error.response === "object" && "data" in error.response &&
				error.response.data && typeof error.response.data === "object" && "detail" in error.response.data
				? String(error.response.data.detail)
				: "Failed to import meetings. Please try again.";
			
			toast({
				title: "Import Failed",
				description: errorMessage,
				variant: "destructive",
			});
		},
	});

	const handleSearch = (): void => {
		if (!dateRange?.from || !dateRange?.to) {
			toast({
				title: "Invalid Date Range",
				description: "Please select both start and end dates.",
				variant: "destructive",
			});
			return;
		}

		if (dateRange.from > dateRange.to) {
			toast({
				title: "Invalid Date Range",
				description: "Start date must be before end date.",
				variant: "destructive",
			});
			return;
		}

		setHasSearched(true);
		refetchEvents();
	};

	const handleEventToggle = (eventId: string): void => {
		const newSelected = new Set(selectedEvents);
		if (newSelected.has(eventId)) {
			newSelected.delete(eventId);
		} else {
			newSelected.add(eventId);
		}
		setSelectedEvents(newSelected);
	};

	const handleSelectAll = (): void => {
		if (!calendarData?.events) return;
    
		if (selectedEvents.size === calendarData.events.length) {
			setSelectedEvents(new Set());
		} else {
			setSelectedEvents(new Set(calendarData.events.map((event) => event.id)));
		}
	};

	const formatDateTime = (dateTimeStr?: string, eventTimezone?: string): string => {
		if (!dateTimeStr) return "No time specified";
    
		try {
			// Get user's local timezone
			const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			
			// Backend sends datetime in UTC or event's timezone
			// The datetime string comes without 'Z' but represents UTC time
			const sourceTimezone = eventTimezone || "UTC";
			
			// Parse the datetime as if it's in the source timezone (UTC)
			// Add 'Z' to indicate UTC if timezone is UTC and no 'Z' present
			let dateStr = dateTimeStr;
			if (sourceTimezone === "UTC" && !dateTimeStr.endsWith("Z")) {
				dateStr = dateTimeStr + "Z";
			}
			
			// Create date object from the string
			const date = new Date(dateStr);
			
			// Format in user's timezone
			const formatted = formatInTimeZone(
				date,
				userTimezone,
				"EEE, MMM d, h:mm a",
			);
			
			// Show timezone abbreviation if different from event timezone
			if (sourceTimezone !== userTimezone) {
				// Get timezone abbreviation for user's timezone
				const tzAbbr = new Date()
					.toLocaleTimeString("en-US", {
						timeZone: userTimezone,
						timeZoneName: "short",
					})
					.split(" ")
					.pop();
				
				return `${formatted} ${tzAbbr}`;
			}
			
			return formatted;
		} catch (error) {
			console.error("Error formatting datetime:", error, dateTimeStr);
			return dateTimeStr;
		}
	};

	const getMeetingTypeBadge = (event: FormattedCalendarEvent): React.ReactNode => {
		if (event.type === "seriesMaster") {
			return (
				<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100" variant="secondary">
					<Repeat className="mr-1 h-3 w-3" />
					Recurring
				</Badge>
			);
		}
		if (event.type === "exception") {
			return (
				<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100" variant="secondary">
					<AlertTriangle className="mr-1 h-3 w-3" />
					Exception
				</Badge>
			);
		}
		if (event.type === "occurrence") {
			return (
				<Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100" variant="secondary">
					<Repeat className="mr-1 h-3 w-3" />
					Instance
				</Badge>
			);
		}
		return null;
	};

	const formatRecurrencePattern = (recurrence: CalendarRecurrence): string => {
		if (!recurrence || !recurrence.pattern) return "";
		
		const pattern = recurrence.pattern;
		const type = pattern.type || "";
		const interval = pattern.interval || 1;
		
		// Format based on recurrence type
		if (type === "daily") {
			return interval === 1 ? "Daily" : `Every ${interval} days`;
		}
		if (type === "weekly") {
			const days = pattern.daysOfWeek?.join(", ") || "";
			return interval === 1 
				? `Weekly${days ? ` on ${days}` : ""}` 
				: `Every ${interval} weeks${days ? ` on ${days}` : ""}`;
		}
		if (type === "absoluteMonthly" || type === "relativeMonthly") {
			return interval === 1 ? "Monthly" : `Every ${interval} months`;
		}
		if (type === "absoluteYearly" || type === "relativeYearly") {
			return interval === 1 ? "Yearly" : `Every ${interval} years`;
		}
		
		return "Recurring";
	};

	const formatDuration = (start?: string, end?: string): string => {
		if (!start || !end) return "";
    
		try {
			const startDate = new Date(start);
			const endDate = new Date(end);
			const diffMs = endDate.getTime() - startDate.getTime();
			const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
			const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
			if (diffHours > 0) {
				return `${diffHours}h ${diffMinutes}m`;
			}
			return `${diffMinutes}m`;
		} catch {
			return "";
		}
	};

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CalendarIcon className="h-5 w-5" />
            Import Calendar Meetings
					</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-hidden flex flex-col space-y-4">
					{/* Date Range Selection */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Select Date Range</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									className={cn(
										"w-full justify-start text-left font-normal",
										!dateRange && "text-muted-foreground",
									)}
									id="date"
									variant="outline"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "LLL dd, y")} -{" "}
												{format(dateRange.to, "LLL dd, y")}
											</>
										) : (
											format(dateRange.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent align="start" className="w-auto p-0">
								<Calendar
									defaultMonth={dateRange?.from}
									initialFocus
									mode="range"
									numberOfMonths={2}
									onSelect={setDateRange}
									selected={dateRange}
								/>
							</PopoverContent>
						</Popover>
					</div>
					{/* Search Button */}
					<Button 
						className="w-full" 
						disabled={isLoadingEvents}
						onClick={handleSearch}
					>
						{isLoadingEvents ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
							</>
						) : (
							<>
								<CalendarDays className="mr-2 h-4 w-4" />
                Search Meetings
							</>
						)}
					</Button>
					{/* Results Section */}
					{hasSearched && (
						<div className="flex-1 overflow-hidden flex flex-col">
							{eventsError ? (
								<div className="flex items-center justify-center p-8 text-center">
									<div className="space-y-2">
										<AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
										<p className="text-sm text-muted-foreground">
                      Failed to load calendar events. Please check your Microsoft integration.
										</p>
									</div>
								</div>
							) : calendarData?.events && calendarData.events.length > 0 ? (
								<>
									{/* Select All / Results Header */}
									<div className="flex items-center justify-between py-2 border-b">
										<div className="flex items-center space-x-2">
											<Checkbox
												checked={selectedEvents.size === calendarData.events.length && calendarData.events.length > 0}
												onCheckedChange={handleSelectAll}
											/>
											<span className="text-sm font-medium">
                        Select All ({calendarData.events.length} meetings found)
											</span>
										</div>
										<span className="text-sm text-muted-foreground">
											{selectedEvents.size} selected
										</span>
									</div>
									{/* Events List */}
									<div className="flex-1 overflow-y-auto space-y-2 py-2">
										{calendarData.events.map((event: FormattedCalendarEvent) => (
											<div
												className={`border rounded-lg p-4 cursor-pointer transition-colors ${
													selectedEvents.has(event.id) 
														? "border-blue-500 bg-blue-50" 
														: "border-gray-200 hover:border-gray-300"
												}`}
												key={event.id}
												onClick={() => handleEventToggle(event.id)}
											>
												<div className="flex items-start space-x-3">
													<Checkbox
														checked={selectedEvents.has(event.id)}
														onCheckedChange={() => handleEventToggle(event.id)}
														onClick={(e) => e.stopPropagation()}
													/>
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<div className="flex-1 min-w-0">
																<h3 className="font-medium text-sm truncate pr-2">
																	{event.subject}
																</h3>
																{/* Meeting Type Badge */}
																<div className="flex items-center gap-2 mt-1">
																	{getMeetingTypeBadge(event)}
																	<div className="flex items-center space-x-1 text-xs text-muted-foreground">
																		{event.is_online_meeting && (
																			<Video className="h-3 w-3" />
																		)}
																		{event.location && (
																			<MapPin className="h-3 w-3" />
																		)}
																	</div>
																</div>
															</div>
														</div>
														<div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
															<div className="flex items-center space-x-1">
																<Clock className="h-3 w-3" />
																<span>{formatDateTime(event.start, event.timezone)}</span>
																{formatDuration(event.start, event.end) && (
																	<span className="text-gray-400">
                                    ({formatDuration(event.start, event.end)})
																	</span>
																)}
															</div>
															{event.attendees.length > 0 && (
																<div className="flex items-center space-x-1">
																	<Users className="h-3 w-3" />
																	<span>{event.attendees.length} attendees</span>
																</div>
															)}
														</div>
														{event.location && (
															<div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
																<MapPin className="h-3 w-3" />
																<span className="truncate">{event.location}</span>
															</div>
														)}
														{/* Show recurrence info for recurring meetings */}
														{event.recurrence && formatRecurrencePattern(event.recurrence) && (
															<div className="flex items-center space-x-1 mt-1 text-xs text-blue-600">
																<Repeat className="h-3 w-3" />
																<span className="truncate">{formatRecurrencePattern(event.recurrence)}</span>
															</div>
														)}
														{/* Show exception info */}
														{event.type === "exception" && event.original_start && (
															<div className="flex items-center space-x-1 mt-1 text-xs text-orange-600">
																<AlertTriangle className="h-3 w-3" />
																<span className="truncate">
																	Modified from {formatDateTime(event.original_start, event.timezone)}
																</span>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							) : (
								<div className="flex items-center justify-center p-8 text-center">
									<div className="space-y-2">
										<CalendarIcon className="h-8 w-8 text-gray-400 mx-auto" />
										<p className="text-sm text-muted-foreground">
                       No meetings found in the selected date range.
										</p>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
				<DialogFooter className="flex items-center justify-between">
					<Button onClick={onClose} variant="outline">
            Cancel
					</Button>
					{hasSearched && calendarData?.events && calendarData.events.length > 0 && (
						<Button
							className="bg-indigo-500 hover:bg-indigo-600"
							disabled={selectedEvents.size === 0 || isImporting}
							onClick={() => importEvents()}
						>
							{isImporting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
                  Import {selectedEvents.size} Meeting{selectedEvents.size !== 1 ? "s" : ""}
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ImportMeetingsDialog;
