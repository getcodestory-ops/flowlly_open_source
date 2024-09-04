import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SunIcon,
  CloudRainIcon,
  HardHatIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  CircleIcon,
} from "lucide-react";
import ScheduleNotifications from "../Notifications/ScheduleNotifications";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function ConstructionDashboard() {
  // Mock data - replace with actual data fetching in a real application
  const weatherData = {
    temperature: 72,
    condition: "Partly Cloudy",
    icon: <SunIcon className="h-6 w-6" />,
  };

  const safetyMetrics = {
    incidentFreedays: 45,
    safetyScore: 95,
    openIssues: 3,
  };

  const scheduleData = [
    { task: "Foundation Work", progress: 100 },
    { task: "Framing", progress: 75 },
    { task: "Electrical", progress: 50 },
    { task: "Plumbing", progress: 40 },
    { task: "Interior Finishing", progress: 10 },
  ];

  const overallProgress = 55;

  const tasks = {
    pending: [
      { id: 1, title: "Review safety protocols", dueDate: "2023-06-15" },
      { id: 2, title: "Update project timeline", dueDate: "2023-06-18" },
      {
        id: 3,
        title: "Coordinate with electrical team",
        dueDate: "2023-06-20",
      },
    ],
    completed: [
      {
        id: 4,
        title: "Finalize building permits",
        completedDate: "2023-06-10",
      },
      {
        id: 5,
        title: "Order construction materials",
        completedDate: "2023-06-08",
      },
    ],
  };

  const meetings = {
    upcoming: [
      {
        id: 1,
        title: "Weekly Progress Review",
        date: "2023-06-16",
        time: "10:00 AM",
      },
      {
        id: 2,
        title: "Safety Committee Meeting",
        date: "2023-06-19",
        time: "2:00 PM",
      },
    ],
    completed: [
      {
        id: 3,
        title: "Contractor Briefing",
        date: "2023-06-12",
        time: "9:00 AM",
      },
      { id: 4, title: "Budget Review", date: "2023-06-09", time: "11:00 AM" },
    ],
  };

  const collaborators = [
    {
      id: 1,
      name: "John Doe",
      role: "Project Manager",
      avatar: "/avatars/01.png",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Lead Engineer",
      avatar: "/avatars/02.png",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Safety Officer",
      avatar: "/avatars/03.png",
    },
    {
      id: 4,
      name: "Sarah Brown",
      role: "Architect",
      avatar: "/avatars/04.png",
    },
  ];

  return (
    <div className="p-8 min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-6">
        Construction Project Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {weatherData.condition === "Partly Cloudy" ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <CloudRainIcon className="h-6 w-6" />
              )}
              Today's Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weatherData.temperature}°F</p>
            <p>{weatherData.condition}</p>
          </CardContent>
        </Card>

        {/* Safety Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHatIcon className="h-6 w-6" />
              Safety Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Incident-free Days: {safetyMetrics.incidentFreedays}</p>
              <p>Safety Score: {safetyMetrics.safetyScore}%</p>
              <p>Open Safety Issues: {safetyMetrics.openIssues}</p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduleData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span>{item.task}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meetings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <ul className="space-y-2">
                  {meetings.upcoming.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="bg-white p-3 rounded-md shadow"
                    >
                      <p className="font-semibold">{meeting.title}</p>
                      <p className="text-sm text-gray-500">
                        {meeting.date} at {meeting.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="completed">
                <ul className="space-y-2">
                  {meetings.completed.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="bg-white p-3 rounded-md shadow"
                    >
                      <p className="font-semibold">{meeting.title}</p>
                      <p className="text-sm text-gray-500">
                        {meeting.date} at {meeting.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheckIcon className="h-6 w-6" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <ul className="space-y-2">
                  {tasks.pending.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between bg-white p-3 rounded-md shadow"
                    >
                      <span className="flex items-center gap-2">
                        <CircleIcon className="h-4 w-4 text-yellow-500" />
                        {task.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due: {task.dueDate}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="completed">
                <ul className="space-y-2">
                  {tasks.completed.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between bg-white p-3 rounded-md shadow"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        {task.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        Completed: {task.completedDate}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-6 w-6" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <ScheduleNotifications />
            </div>
          </CardContent>
        </Card>

        {/* Collaborators Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-6 w-6" />
              Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-3 bg-white p-3 rounded-md shadow"
                >
                  <Avatar>
                    <AvatarImage
                      src={collaborator.avatar}
                      alt={collaborator.name}
                    />
                    <AvatarFallback>
                      {collaborator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{collaborator.name}</p>
                    <p className="text-sm text-gray-500">{collaborator.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheckIcon className="h-6 w-6" />
              Overall Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={overallProgress} className="w-full" />
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
