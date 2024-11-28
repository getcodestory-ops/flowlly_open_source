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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function DailyJournalForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [name, setName] = useState("");
  const [journalPrompt, setJournalPrompt] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string>("morning");
  const [isFormValid, setIsFormValid] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { mutate } = useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Daily journal created successfully!",
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
    const isValid =
      name !== "" &&
      journalPrompt !== "" &&
      timeOfDay !== "" &&
      startDate !== "";
    setIsFormValid(isValid);
  }, [name, journalPrompt, timeOfDay, startDate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !activeProject) {
      console.error("Session or active project not available");
      return;
    }
    console.log("Form submitted:");
    // Implement the actual submission logic here
  };

  return (
    <ScrollArea className="w-full h-[calc(100vh-150px)]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Daily Journal</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journalPrompt">Journal Prompt</Label>
              <Textarea
                id="journalPrompt"
                value={journalPrompt}
                onChange={(e) => setJournalPrompt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeOfDay">Time of Day</Label>
              <Select
                name="timeOfDay"
                value={timeOfDay}
                onValueChange={setTimeOfDay}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!isFormValid}>
              Create Daily Journal
            </Button>
          </CardFooter>
        </form>
      </Card>
    </ScrollArea>
  );
}
