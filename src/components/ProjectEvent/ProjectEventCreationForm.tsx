"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "../ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, PlusCircle, Link, Mic } from "lucide-react";
import { format, parse, addMinutes, roundToNearestMinutes } from "date-fns";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { CreateEvent } from "@/types/projectEvents";
import { createNewProjectEvent } from "@/api/taskQueue";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  language?: string;
  phoneNumber?: string;
}

interface Event {
  id: string;
  name: string;
  participants: Participant[];
  recurrence: string;
  startDate: string;
  endDate: string;
  startTime: string;
  duration: string;
  participationLink?: string;
}

function ParticipantSelector({
  participants,
  setParticipants,
  selectedParticipants,
  setSelectedParticipants,
}: {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  selectedParticipants: string[];
  setSelectedParticipants: (selectedParticipants: string[]) => void;
}) {
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>(
    {}
  );

  const handleAddParticipant = () => {
    if (
      newParticipant.firstName &&
      newParticipant.lastName &&
      newParticipant.email
    ) {
      const participant = {
        ...newParticipant,
        id: Date.now().toString(), // Simple unique ID generation
      } as Participant;
      setParticipants([...participants, participant]);
      setSelectedParticipants([...selectedParticipants, participant.id]);
      setNewParticipant({});
      setIsAddParticipantOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Participants / Attendees</Label>
      <div className="flex space-x-2">
        <MultiSelect
          options={participants.map((p) => ({
            label: `${p.firstName} ${p.lastName}`,
            value: p.id,
          }))}
          defaultValue={selectedParticipants}
          onValueChange={setSelectedParticipants}
          className="flex-grow"
        />
        <Dialog
          open={isAddParticipantOpen}
          onOpenChange={setIsAddParticipantOpen}
        >
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="new_user creation dialogure">
            <DialogHeader>
              <DialogTitle>Add Participant</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newParticipant.firstName || ""}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newParticipant.lastName || ""}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newParticipant.email || ""}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (Optional)</Label>
                <Input
                  id="role"
                  value={newParticipant.role || ""}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language (Optional)</Label>
                <Input
                  id="language"
                  value={newParticipant.language || ""}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      language: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  value={newParticipant.phoneNumber || ""}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddParticipant}>
              Add Participant
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function ProjectEventCreationForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const members = useStore((state) => state.members);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [participants, setParticipants] = useState<Participant[]>(
    members.map((m) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      email: m.email,
    }))
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [meetingName, setMeetingName] = useState("");
  const [recurrence, setRecurrence] = useState<string>("once");
  const [startTime, setStartTime] = useState(
    format(roundToNearestMinutes(new Date(), { nearestTo: 30 }), "HH:mm")
  );
  const [duration, setDuration] = useState("60");
  const [participationLink, setParticipationLink] = useState("");
  const [autoJoin, setAutoJoin] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [weeklyRecurrenceDay, setWeeklyRecurrenceDay] = useState(
    format(new Date(), "EEEE")
  );
  const [participationOption, setParticipationOption] = useState<
    "join" | "record"
  >("join");
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isJoining, setIsJoining] = useState(false);

  // Mock existing events (replace with actual data fetching in a real application)
  const existingEvents: Event[] = [
    // {
    //   id: "1",
    //   name: "Team Meeting",
    //   participants: [
    //     {
    //       id: "101",
    //       firstName: "John",
    //       lastName: "Doe",
    //       email: "john@example.com",
    //     },
    //     {
    //       id: "102",
    //       firstName: "Jane",
    //       lastName: "Smith",
    //       email: "jane@example.com",
    //     },
    //   ],
    //   recurrence: "weekly",
    //   startDate: "2023-06-15",
    //   endDate: "2023-12-31",
    //   startTime: "09:00",
    //   duration: "60",
    //   participationLink: "https://meet.example.com/team-meeting",
    // },
    // {
    //   id: "2",
    //   name: "Project Review",
    //   participants: [
    //     {
    //       id: "103",
    //       firstName: "Alice",
    //       lastName: "Johnson",
    //       email: "alice@example.com",
    //     },
    //     {
    //       id: "104",
    //       firstName: "Bob",
    //       lastName: "Brown",
    //       email: "bob@example.com",
    //     },
    //   ],
    //   recurrence: "monthly",
    //   startDate: "2023-06-20",
    //   endDate: "2024-06-20",
    //   startTime: "14:00",
    //   duration: "90",
    //   participationLink: "https://meet.example.com/project-review",
    // },
  ];

  const { mutate } = useMutation({
    mutationFn: createNewProjectEvent,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Event created successfully!",
        duration: 9000,
      });
      queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        duration: 9000,
      });
    },
  });

  useEffect(() => {
    if (selectedEvent) {
      const event = existingEvents.find((e) => e.id === selectedEvent);
      if (event) {
        setMeetingName(event.name);
        setParticipants(event.participants);
        setSelectedParticipants(event.participants.map((p) => p.id));
        setRecurrence(event.recurrence);
        setStartDate(parse(event.startDate, "yyyy-MM-dd", new Date()));
        setEndDate(parse(event.endDate, "yyyy-MM-dd", new Date()));
        setStartTime(event.startTime);
        setDuration(event.duration);
        setParticipationLink(event.participationLink || "");
        setParticipationOption(event.participationLink ? "join" : "record");
      }
    } else {
      // Reset form when no event is selected
      setMeetingName("");
      setParticipants(
        members.map((m) => ({
          id: m.id,
          firstName: m.first_name,
          lastName: m.last_name,
          email: m.email,
        }))
      );
      setSelectedParticipants([]);
      setRecurrence("once");
      setStartDate(new Date());
      setEndDate(undefined);
      setStartTime(
        format(roundToNearestMinutes(new Date(), { nearestTo: 30 }), "HH:mm")
      );
      setDuration("60");
      setParticipationLink("");
      setParticipationOption("join");
    }
  }, [selectedEvent]);

  useEffect(() => {
    const isValid =
      meetingName !== "" &&
      selectedParticipants.length > 0 &&
      startTime !== "" &&
      duration !== "" &&
      (participationOption === "join" ? participationLink !== "" : true);
    setIsFormValid(isValid);
  }, [
    meetingName,
    selectedParticipants,
    startDate,
    endDate,
    startTime,
    duration,
    participationLink,
    participationOption,
  ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !activeProject) {
      console.error("Session or active project not available");
      return;
    }
    const submissionData: CreateEvent = {
      project_event: {
        id: selectedEvent || undefined,
        name: meetingName,
        event_type: "meeting",
        metadata: {
          online_link: participationLink,
          frequency: recurrence,
          time: startTime,
          duration: parseInt(duration ?? 0),
          recurrence_day: weeklyRecurrenceDay,
        },
      },
      event_participants: selectedParticipants.map((p) => {
        return {
          role: "member",
          identification: "directory_id",
          metadata: {
            directory_id: p,
          },
        };
      }),
      recurrence,
      time_zone: timeZone,
      start_date: startDate
        ? format(startDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      start_time: startTime,
      duration: parseInt(duration ?? 0),
      participation_link:
        participationOption === "join" ? participationLink : undefined,
      auto_join: participationOption === "join" ? autoJoin : false,
      is_recording: participationOption === "record",
      join_now: isJoining,
    };
    console.log("Form submitted:", submissionData);

    mutate({
      session,
      projectId: activeProject.project_id,
      projectEvent: submissionData,
    });
  };

  const handleStartParticipation = () => {
    if (participationOption === "join") {
      // Logic to start participation (e.g., redirect to meeting link)
      window.open(participationLink, "_blank");
    } else {
      // Logic to start recording
      console.log("Starting audio recording...");
    }
  };

  return (
    <ScrollArea className="w-full max-h-[calc(100vh-150px)] ">
      <div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Join meeting <br />
              <span className="text-sm mt-2 font-thin">
                {new Date().toLocaleTimeString()} {timeZone}
              </span>
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="existingEvent">
                  Select from existing meetings or create a new
                </Label>
                <Select
                  value={selectedEvent || ""}
                  onValueChange={(value) =>
                    setSelectedEvent(
                      value === "create_new_event" ? null : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Create New Meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_new_event">
                      Create New Meeting
                    </SelectItem>
                    {existingEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingName">Meeting Name</Label>
                <Input
                  id="meetingName"
                  name="meetingName"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <ParticipantSelector
                  participants={participants}
                  setParticipants={setParticipants}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                />
              </div>
              <div className="space-y-2 m-2 p-2 bg-secondary rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Repeat</Label>
                  <Select
                    name="recurrence"
                    value={recurrence}
                    defaultValue="once"
                    onValueChange={setRecurrence}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select repeat frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Does not repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {recurrence === "weekly" && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="weeklyRecurrenceDay">On</Label>
                      <Select
                        value={weeklyRecurrenceDay}
                        onValueChange={setWeeklyRecurrenceDay}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2 ">
                    <Label className="mr-2">
                      {recurrence === "once" ? "Meeting Date" : "Start Date"}{" "}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={!startDate ? "text-muted-foreground" : ""}
                        >
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => setStartDate(date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {recurrence !== "once" && (
                    <div className="space-y-2">
                      <Label className="mr-2">End Date </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={!endDate ? "text-muted-foreground" : ""}
                          >
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => setEndDate(date as Date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Meeting Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 48 }, (_, i) => {
                        const date = addMinutes(
                          new Date().setHours(0, 0, 0, 0),
                          i * 30
                        );
                        return (
                          <SelectItem key={i} value={format(date, "HH:mm")}>
                            {format(date, "h:mm a")}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Participation Option</Label>
                <RadioGroup
                  value={participationOption}
                  onValueChange={(value) =>
                    setParticipationOption(value as "join" | "record")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="join" id="join" />
                    <Label htmlFor="join">Join using link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="record" id="record" />
                    <Label htmlFor="record">Audio recording</Label>
                  </div>
                </RadioGroup>
              </div>

              {participationOption === "join" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="participationLink">
                      Participation Link
                    </Label>
                    <Input
                      id="participationLink"
                      name="participationLink"
                      value={participationLink}
                      onChange={(e) => setParticipationLink(e.target.value)}
                      placeholder="https://meet.example.com/your-meeting"
                    />
                  </div>
                  {recurrence !== "once" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoJoin"
                        checked={autoJoin}
                        onCheckedChange={(checked) =>
                          setAutoJoin(checked as boolean)
                        }
                      />
                      <Label htmlFor="autoJoin">
                        Auto-join at corresponding times
                      </Label>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="joinNow"
                  checked={isJoining}
                  onCheckedChange={(checked) =>
                    setIsJoining(checked as boolean)
                  }
                />
                <Label htmlFor="joinNow">Join Now</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!isFormValid}>
                {selectedEvent ? "Update Event" : "Create Event"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ScrollArea>
  );
}
