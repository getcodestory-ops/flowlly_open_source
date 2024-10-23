"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  SunIcon,
  CloudRainIcon,
  HardHatIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  CircleIcon,
  ReplaceAllIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlarmClockCheckIcon,
  MessageCircleQuestionIcon,
  TriangleAlertIcon,
  TrafficConeIcon,
  LandPlotIcon,
} from "lucide-react";
import ScheduleNotifications from "../Notifications/ScheduleNotifications";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  change_orders,
  delay_factors,
  rfi,
  risk_register,
  task_progress,
  trade_assessment,
  weekly_priorities,
} from "@/demo/demo_data";
import DashboardRightPanel from "./LeftPanel";

export default function ConstructionDashboard() {
  const [selectedWeek, setSelectedWeek] = useState("38");
  interface ChangeOrder {
    date: string;
    description: string;
  }

  interface ChangeOrdersByWeek {
    [key: string]: ChangeOrder[];
  }

  const [changeOrdersByWeek, setChangeOrdersByWeek] =
    useState<ChangeOrdersByWeek>({});
  const [delayFactors, setDelayFactors] = useState<typeof delay_factors>({});
  const [weeklyRFI, setWeeklyRFI] = useState<typeof rfi>({});
  const [riskRegister, setRiskRegister] = useState<typeof risk_register>({});
  const [taskProgress, setTaskProgress] = useState<typeof task_progress>({});
  const [tradesAssessment, setTradesAssessment] = useState<
    typeof trade_assessment
  >({});
  const [weeklyPriorities, setWeeklyPriorities] = useState<
    typeof weekly_priorities
  >({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

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

  const weeks_in_number = [
    { week: "38", week_name: "September 17 - September 23" },
    { week: "39", week_name: "September 24 - October 1" },
    { week: "40", week_name: "October 2 - October 8" },
    { week: "41", week_name: "October 9 - October 15" },
    { week: "42", week_name: "October 16 - October 22" },
  ];

  const handleWeekChange = (value: any) => {
    setSelectedWeek(value);
  };
  const selectedWeekObj = weeks_in_number.find(
    (week) => week.week === selectedWeek
  );

  const extractChangeOrdersByWeek = (weekNumber: string) => {
    console.log("change_orders", change_orders);
    const result: { [key: string]: { date: string; description: string }[] } =
      {};

    for (const changeOrderKey in change_orders) {
      const orders = change_orders[changeOrderKey];
      const filteredOrders = orders.filter((order) => {
        // Type checking
        if (typeof order.week !== typeof weekNumber) {
          console.warn(
            `Type mismatch: order.week is ${typeof order.week}, but weekNumber is ${typeof weekNumber}`
          );
          return false;
        }
        return order.week === weekNumber;
      });

      result[changeOrderKey] = filteredOrders.map((order) => ({
        date: order.date,
        description: order["change order"].description,
      }));
    }

    return result;
  };

  const filterByWeek = (data: any, weekNumber: string) => {
    // Create a new object to store the filtered data
    const filteredData: any = {};

    // Iterate over the weeks in the data
    for (const week in data) {
      // If the current week matches the provided weekNumber, add it to the filteredData
      if (week === weekNumber) {
        filteredData[week] = data[week];
      }
    }

    // Return the filtered data
    return filteredData;
  };

  useEffect(() => {
    console.log("run");
    const updatedChangeOrders = extractChangeOrdersByWeek(selectedWeek);
    setChangeOrdersByWeek(updatedChangeOrders);
    const updatedDelayFactors = filterByWeek(delay_factors, selectedWeek);
    setDelayFactors(updatedDelayFactors);
    const updatedRFIs = filterByWeek(rfi, selectedWeek);
    setWeeklyRFI(updatedRFIs);
    const updatedRisks = filterByWeek(risk_register, selectedWeek);
    setRiskRegister(updatedRisks);
    const updatedTaskProgress = filterByWeek(task_progress, selectedWeek);
    setTaskProgress(updatedTaskProgress);
    const updatedTradesAssessment = filterByWeek(
      trade_assessment,
      selectedWeek
    );
    setTradesAssessment(updatedTradesAssessment);
    const updateWeeklyPriorities = filterByWeek(
      weekly_priorities,
      selectedWeek
    );
    setWeeklyPriorities(updateWeeklyPriorities);
  }, [selectedWeek]);

  useEffect(() => {
    console.log("change_orders_by_week", changeOrdersByWeek);
    console.log("delay_factors", delayFactors);
    console.log("weekly_rfi", weeklyRFI);
    console.log("risk_register", riskRegister);
    console.log("task_progress", taskProgress);
    console.log("trades_assessment", tradesAssessment);
    console.log("weekly_priorities", weeklyPriorities);
  }, [changeOrdersByWeek]);

  return (
    <>
      {/* <div>
        {" "}
         <button onClick={toggleDrawer}>Toggle Drawer</button>
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-lg transition-transform transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DashboardRightPanel />
        </div>
      </div> */}
      <div className="p-8 min-h-screen w-full">
        <h1 className="text-3xl font-bold mb-6">
          Construction Project Dashboard
        </h1>
        <div className="flex flex-row">
          <h1 className="text-2xl font-bold mb-6 mr-4 ml-4">Week:</h1>

          <Select
            onValueChange={(value) => {
              handleWeekChange(value);
            }}
          >
            <SelectTrigger className="w-fit">
              <SelectValue
                placeholder={
                  selectedWeekObj ? selectedWeekObj.week_name : "Select a week"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {weeks_in_number.map((week) => (
                  <SelectItem key={week.week} value={week.week}>
                    {week.week_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TriangleAlertIcon className="h-6 w-6" />
                Risks Register
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {riskRegister && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>Risk</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Impact Potential</TableHead>
                        <TableHead>Likelihood</TableHead>{" "}
                        {/* Added Likelihood column */}
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm  ">
                      {Object.keys(riskRegister).map((week) =>
                        Object.keys(riskRegister[week]).map((date) =>
                          riskRegister[week][date].map((risk, index) => (
                            <TableRow key={index}>
                              <TableCell>{risk.Risk}</TableCell>
                              <TableCell>{`${risk[
                                "Impact Potential"
                              ].description.substring(0, 25)}${
                                risk["Impact Potential"].description.length > 25
                                  ? "..."
                                  : ""
                              }`}</TableCell>
                              <TableCell>
                                {risk["Impact Potential"].score}
                              </TableCell>
                              <TableCell>{risk.Likelihood.score}</TableCell>{" "}
                              {/* Added Likelihood score */}
                              <TableCell>{date}</TableCell>
                            </TableRow>
                          ))
                        )
                      )}
                      {Object.keys(risk_register).map(
                        (week) =>
                          week === "Ongoing" // Use a ternary operator for conditional rendering
                            ? risk_register &&
                              risk_register[week].Risks.map((risk, index) => (
                                <TableRow key={index}>
                                  <TableCell>{risk.Risk}</TableCell>
                                  <TableCell>
                                    {`${risk[
                                      "Impact Potential"
                                    ].description.substring(0, 25)}${
                                      risk["Impact Potential"].description
                                        .length > 25
                                        ? "..."
                                        : ""
                                    }`}
                                  </TableCell>
                                  <TableCell>
                                    {risk["Impact Potential"].score}
                                  </TableCell>
                                  <TableCell>{risk.Likelihood.score}</TableCell>
                                  <TableCell>{week}</TableCell>
                                </TableRow>
                              ))
                            : null // Render nothing if week is not "Ongoing"
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LandPlotIcon className="h-6 w-6" />
                Week Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {weeklyPriorities && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>Priority</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {Object.keys(weeklyPriorities).map((week) => (
                        // Assuming week is the key for each week's data, like "38"
                        <React.Fragment key={week}>
                          {weeklyPriorities[week].priorities.map(
                            (priority, index) => (
                              <TableRow key={index}>
                                <TableCell>{priority.topic}</TableCell>
                                <TableCell>{priority.description}</TableCell>
                              </TableRow>
                            )
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHatIcon className="h-6 w-6" />
                Tasks Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {taskProgress && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>Task</TableHead>
                        <TableHead>Latest Update</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {Object.keys(taskProgress).map((week) =>
                        Object.keys(taskProgress[week]).map((date) =>
                          taskProgress[week][date].map(
                            (order: any, index: any) => (
                              <TableRow key={index}>
                                <TableCell>{order.Task}</TableCell>
                                <TableCell>{`${order.description.substring(
                                  0,
                                  25
                                )}${
                                  order.description.length > 25 ? "..." : ""
                                }`}</TableCell>
                                <TableCell>{date}</TableCell>{" "}
                                {/* Use date from the inner loop */}
                              </TableRow>
                            )
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestionIcon className="h-6 w-6" />
                RFI's
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {weeklyRFI && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>RFI</TableHead>
                        <TableHead>Latest Update</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {Object.keys(weeklyRFI).map((week) =>
                        Object.keys(weeklyRFI[week]).map((date) =>
                          weeklyRFI[week][date].map(
                            (order: any, index: any) => (
                              <TableRow key={index}>
                                <TableCell>{order.RFI}</TableCell>
                                <TableCell>{`${order.description.substring(
                                  0,
                                  25
                                )}${
                                  order.description.length > 25 ? "..." : ""
                                }`}</TableCell>
                                <TableCell>{date}</TableCell>{" "}
                                {/* Use date from the inner loop */}
                              </TableRow>
                            )
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReplaceAllIcon className="h-6 w-6" />
                Change Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {changeOrdersByWeek && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm  ">
                        <TableHead>Change Order</TableHead>
                        <TableHead>Latest Update</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm ">
                      {Object.keys(changeOrdersByWeek).map((changeOrder) =>
                        changeOrdersByWeek[changeOrder].map(
                          (order: any, index: any) => (
                            <TableRow key={index}>
                              <TableCell>{changeOrder}</TableCell>
                              <TableCell>{`${order.description.substring(
                                0,
                                25
                              )}${
                                order.description.length > 25 ? "..." : ""
                              }`}</TableCell>
                              <TableCell>{order.date}</TableCell>
                            </TableRow>
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlarmClockCheckIcon className="h-6 w-6" />
                Delay Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {delayFactors && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>Factor</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {Object.keys(delayFactors).map((week) =>
                        Object.keys(delayFactors[week]).map((date) =>
                          delayFactors[week][date].map(
                            (order: any, index: any) => (
                              <TableRow key={index}>
                                <TableCell>{order.factor}</TableCell>
                                <TableCell>{`${order.description.substring(
                                  0,
                                  25
                                )}${
                                  order.description.length > 25 ? "..." : ""
                                }`}</TableCell>
                                <TableCell>{date}</TableCell>{" "}
                                {/* Use date from the inner loop */}
                              </TableRow>
                            )
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrafficConeIcon className="h-6 w-6" />
                Trades Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-auto ">
              <div>
                {tradesAssessment && (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-sm ">
                        <TableHead>Trade</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {Object.keys(tradesAssessment).map((week) =>
                        Object.keys(tradesAssessment[week]).map((date) =>
                          tradesAssessment[week][date].map(
                            (order: any, index: any) => (
                              <TableRow key={index}>
                                <TableCell>{order.Trade}</TableCell>
                                <TableCell>{order["Risk score"]}</TableCell>
                                <TableCell>
                                  {`${order.Rationale.substring(0, 25)}${
                                    order.Rationale.length > 25 ? "..." : ""
                                  }`}
                                </TableCell>
                              </TableRow>
                            )
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// <div className="p-8 min-h-screen w-full">
//   <h1 className="text-3xl font-bold mb-6">
//     Construction Project Dashboard
//   </h1>
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//     {/* Weather Card */}
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           {weatherData.condition === "Partly Cloudy" ? (
//             <SunIcon className="h-6 w-6" />
//           ) : (
//             <CloudRainIcon className="h-6 w-6" />
//           )}
//           Today&apos;s Weather
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-3xl font-bold">{weatherData.temperature}°F</p>
//         <p>{weatherData.condition}</p>
//       </CardContent>
//     </Card>

//     {/* Safety Metrics Card */}
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <HardHatIcon className="h-6 w-6" />
//           Safety Metrics
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-2">
//           <p>Incident-free Days: {safetyMetrics.incidentFreedays}</p>
//           <p>Safety Score: {safetyMetrics.safetyScore}%</p>
//           <p>Open Safety Issues: {safetyMetrics.openIssues}</p>
//         </div>
//       </CardContent>
//     </Card>

//     {/* Schedule Overview Card */}
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <CalendarIcon className="h-6 w-6" />
//           Schedule Overview
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {scheduleData.map((item, index) => (
//             <div key={index}>
//               <div className="flex justify-between mb-1">
//                 <span>{item.task}</span>
//                 <span>{item.progress}%</span>
//               </div>
//               <Progress value={item.progress} className="w-full" />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>

//     {/* Meetings Card */}
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <CalendarIcon className="h-6 w-6" />
//           Meetings
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="upcoming" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//             <TabsTrigger value="completed">Completed</TabsTrigger>
//           </TabsList>
//           <TabsContent value="upcoming">
//             <ul className="space-y-2">
//               {meetings.upcoming.map((meeting) => (
//                 <li
//                   key={meeting.id}
//                   className="bg-white p-3 rounded-md shadow"
//                 >
//                   <p className="font-semibold">{meeting.title}</p>
//                   <p className="text-sm text-gray-500">
//                     {meeting.date} at {meeting.time}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </TabsContent>
//           <TabsContent value="completed">
//             <ul className="space-y-2">
//               {meetings.completed.map((meeting) => (
//                 <li
//                   key={meeting.id}
//                   className="bg-white p-3 rounded-md shadow"
//                 >
//                   <p className="font-semibold">{meeting.title}</p>
//                   <p className="text-sm text-gray-500">
//                     {meeting.date} at {meeting.time}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>

//     {/* Tasks Card */}
//     <Card className="md:col-span-2 lg:col-span-2">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <ClipboardCheckIcon className="h-6 w-6" />
//           Tasks
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="pending" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="pending">Pending</TabsTrigger>
//             <TabsTrigger value="completed">Completed</TabsTrigger>
//           </TabsList>
//           <TabsContent value="pending">
//             <ul className="space-y-2">
//               {tasks.pending.map((task) => (
//                 <li
//                   key={task.id}
//                   className="flex items-center justify-between bg-white p-3 rounded-md shadow"
//                 >
//                   <span className="flex items-center gap-2">
//                     <CircleIcon className="h-4 w-4 text-yellow-500" />
//                     {task.title}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     Due: {task.dueDate}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </TabsContent>
//           <TabsContent value="completed">
//             <ul className="space-y-2">
//               {tasks.completed.map((task) => (
//                 <li
//                   key={task.id}
//                   className="flex items-center justify-between bg-white p-3 rounded-md shadow"
//                 >
//                   <span className="flex items-center gap-2">
//                     <CheckCircleIcon className="h-4 w-4 text-green-500" />
//                     {task.title}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     Completed: {task.completedDate}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>

//     <Card className="md:col-span-2 lg:col-span-3">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <UsersIcon className="h-6 w-6" />
//           Action Items
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-wrap gap-4">
//           <ScheduleNotifications />
//         </div>
//       </CardContent>
//     </Card>

//     {/* Collaborators Card */}
//     <Card className="md:col-span-2 lg:col-span-3">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <UsersIcon className="h-6 w-6" />
//           Collaborators
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-wrap gap-4">
//           {collaborators.map((collaborator) => (
//             <div
//               key={collaborator.id}
//               className="flex items-center gap-3 bg-white p-3 rounded-md shadow"
//             >
//               <Avatar>
//                 <AvatarImage
//                   src={collaborator.avatar}
//                   alt={collaborator.name}
//                 />
//                 <AvatarFallback>
//                   {collaborator.name
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="font-semibold">{collaborator.name}</p>
//                 <p className="text-sm text-gray-500">{collaborator.role}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>

//     {/* Overall Progress Card */}
//     <Card className="md:col-span-2 lg:col-span-3">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <ClipboardCheckIcon className="h-6 w-6" />
//           Overall Project Progress
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center gap-4">
//           <Progress value={overallProgress} className="w-full" />
//           <span className="text-2xl font-bold">{overallProgress}%</span>
//         </div>
//       </CardContent>
//     </Card>
//   </div>
// </div>
