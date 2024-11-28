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
import { useToast } from "../../ui/use-toast";
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
import { CreateEvent, IdentificationType } from "@/types/projectEvents";
import { createNewProjectEvent } from "@/api/taskQueue";
import { TriggerType } from "@/types/projectEvents";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  language?: string;
  phoneNumber?: string;
}

// Add new interfaces for node configurations
interface ValidateNodeConfig {
  validationPrompt: string;
  validationRules?: string;
  successSteps: WorkflowNode[];
  failureSteps: WorkflowNode[];
}

interface ExtractNodeConfig {
  columns: {
    name: string;
    description: string;
    dataType: "string" | "number" | "date" | "boolean";
  }[];
}

// Add new interface for condition node config
interface ConditionNodeConfig {
  conditionPrompt: string;
  trueSteps: WorkflowNode[];
  falseSteps: WorkflowNode[];
}

// Update WorkflowNode type to include specific configurations
interface WorkflowNode {
  id: string;
  type: string;
  config:
    | ValidateNodeConfig
    | ExtractNodeConfig
    | ConditionNodeConfig
    | Record<string, any>;
}

export default function CustomWorkflowForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const members = useStore((state) => state.members);

  const [users, setUsers] = useState<Participant[]>(
    members.map((m) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      email: m.email,
    }))
  );

  // Basic workflow metadata
  const [name, setName] = useState("");
  const [recurrence, setRecurrence] = useState<string>("manual");
  const [startTime, setStartTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Workflow specific states
  const [currentStep, setCurrentStep] = useState(0);
  const [triggerType, setTriggerType] = useState<TriggerType>("phone");
  const [startingPrompt, setStartingPrompt] = useState("");
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [currentNodeType, setCurrentNodeType] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [allowAnyUser, setAllowAnyUser] = useState(false);
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [workflowFor, setWorkflowFor] = useState("");

  const [isFormValid, setIsFormValid] = useState(false);

  // Add new state for trigger prompt
  const [triggerPrompt, setTriggerPrompt] = useState("");

  // Mock phone numbers (replace with your actual data source)
  const availablePhones = [
    { phoneNumber: "+17788003869", type: "reserved" },
    { phoneNumber: "+12344234145", type: "general" },
  ];

  const nodeTypes = [
    { value: "ai", label: "AI Node" },
    { value: "process", label: "Process Data" },
    { value: "validate", label: "Validate Information" },
    { value: "conversation", label: "Conversation" },
    { value: "loop", label: "Loop" },
    { value: "condition", label: "Condition" },
    { value: "extract", label: "Extract Data" },
  ];

  // Add new states for node configuration
  const [validationPrompt, setValidationPrompt] = useState("");
  const [columns, setColumns] = useState<ExtractNodeConfig["columns"]>([]);
  const [newColumn, setNewColumn] = useState({
    name: "",
    description: "",
    dataType: "string" as const,
  });

  // Add new states for condition configuration
  const [conditionPrompt, setConditionPrompt] = useState("");
  const [editingBranch, setEditingBranch] = useState<"true" | "false" | null>(
    null
  );
  const [trueSteps, setTrueSteps] = useState<WorkflowNode[]>([]);
  const [falseSteps, setFalseSteps] = useState<WorkflowNode[]>([]);

  // Add new state for validation branches
  const [validationSuccessSteps, setValidationSuccessSteps] = useState<
    WorkflowNode[]
  >([]);
  const [validationFailureSteps, setValidationFailureSteps] = useState<
    WorkflowNode[]
  >([]);
  const [editingValidationBranch, setEditingValidationBranch] = useState<
    "success" | "failure" | null
  >(null);

  // Add new state variables for branch node types
  const [validationSuccessNodeType, setValidationSuccessNodeType] =
    useState("");
  const [validationFailureNodeType, setValidationFailureNodeType] =
    useState("");

  // Add new states for editing
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);

  useEffect(() => {
    const isValid = name !== "" && startTime !== "";
    setIsFormValid(isValid);
  }, [name, startTime]);

  const { mutate } = useMutation({
    mutationFn: (createEvent: CreateEvent) => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return createNewProjectEvent({
        session,
        projectId: activeProject?.project_id,
        projectEvent: createEvent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow created successfully!",
        duration: 9000,
      });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  // Add delete handler
  const handleDeleteNode = (index: number) => {
    const newNodes = nodes.filter((_, idx) => idx !== index);
    setNodes(newNodes);
  };

  // Modify handleNext to handle editing
  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Only add trigger node if it doesn't exist already
      if (!nodes.some((node) => node.type === "trigger")) {
        const triggerNode: WorkflowNode = {
          id: `node-${nodes.length}`,
          type: "trigger",
          config: {
            triggerType,
            startingPrompt: triggerType === "ui" ? startingPrompt : "",
            triggerPrompt:
              triggerType === "phone" && selectedPhone ? triggerPrompt : "",
          },
        };
        setNodes([...nodes, triggerNode]);
      }
      setCurrentStep(2);
    } else {
      if (currentNodeType) {
        let nodeConfig = {};

        // Configure node based on type
        switch (currentNodeType) {
          case "validate":
            nodeConfig = {
              validationPrompt,
              validationRules: "",
              successSteps: validationSuccessSteps,
              failureSteps: validationFailureSteps,
            };
            setValidationPrompt("");
            setValidationSuccessSteps([]);
            setValidationFailureSteps([]);
            setEditingValidationBranch(null);
            break;
          case "extract":
            nodeConfig = {
              columns: [...columns],
            };
            setColumns([]); // Reset after adding
            break;
          case "condition":
            nodeConfig = {
              conditionPrompt,
              trueSteps,
              falseSteps,
            };
            setConditionPrompt("");
            setTrueSteps([]);
            setFalseSteps([]);
            setEditingBranch(null);
            break;
        }

        const newNode: WorkflowNode = {
          id:
            editingNodeIndex !== null
              ? nodes[editingNodeIndex].id
              : `node-${nodes.length}`,
          type: currentNodeType,
          config: nodeConfig,
        };

        if (editingNodeIndex !== null) {
          // Update existing node
          const updatedNodes = [...nodes];
          updatedNodes[editingNodeIndex] = newNode;
          setNodes(updatedNodes);
          setEditingNodeIndex(null);
        } else {
          // Add new node
          setNodes([...nodes, newNode]);
        }
        setCurrentNodeType("");
      }
    }
  };

  // Modify handleEditNode to prevent editing trigger nodes
  const handleEditNode = (index: number) => {
    const node = nodes[index];

    // Prevent editing of trigger nodes
    if (node.type === "trigger") {
      toast({
        title: "Cannot edit trigger",
        description: "Trigger configuration cannot be modified after creation.",
        variant: "destructive",
      });
      return;
    }

    setEditingNodeIndex(index);
    setCurrentNodeType(node.type);

    // Restore node-specific state based on type
    switch (node.type) {
      case "validate":
        const validateConfig = node.config as ValidateNodeConfig;
        setValidationPrompt(validateConfig.validationPrompt);
        setValidationSuccessSteps(validateConfig.successSteps);
        setValidationFailureSteps(validateConfig.failureSteps);
        break;
      case "extract":
        const extractConfig = node.config as ExtractNodeConfig;
        setColumns(extractConfig.columns);
        break;
      case "condition":
        const conditionConfig = node.config as ConditionNodeConfig;
        setConditionPrompt(conditionConfig.conditionPrompt);
        setTrueSteps(conditionConfig.trueSteps);
        setFalseSteps(conditionConfig.falseSteps);
        break;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !activeProject) return;

    const createEvent: CreateEvent = {
      project_event: {
        name,
        event_type: "custom",
        metadata: {
          nodes,
          triggerType,
          startingPrompt,
          recurrence_day: recurrence,
          time: format(startTime, "HH:mm"),
        },
      },
      event_participants: [
        ...authorizedUsers.map((userId) => ({
          role: "owner" as "owner" | "admin" | "member" | "guest",
          identification: "user_id" as IdentificationType,
          metadata: { user_id: userId },
        })),
      ],
      start_time: format(startTime, "HH:mm"),
      start_date: format(new Date(), "yyyy-MM-dd"),
      recurrence: recurrence,
      time_zone: timeZone,
      join_now: true,
    };

    mutate(createEvent);
  };

  return (
    <ScrollArea className="w-full h-full">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Create Custom Workflow</CardTitle>
          <span className="text-sm mt-2 font-thin">
            {new Date().toLocaleTimeString()} {timeZone}
          </span>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 max-w-3xl">
            {currentStep === 0 && (
              // Basic workflow metadata
              <div className="w-32">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workflowFor">Workflow For</Label>
                  <Input
                    id="workflowFor"
                    value={workflowFor}
                    onChange={(e) => setWorkflowFor(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence">Repeat</Label>
                  <Select
                    name="recurrence"
                    value={recurrence}
                    onValueChange={setRecurrence}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select repeat frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="once">Does not repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem> */}
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              // Trigger configuration
              <>
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select
                    name="triggerType"
                    value={triggerType}
                    onValueChange={(value: TriggerType) =>
                      setTriggerType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui">Via UI</SelectItem>
                      <SelectItem value="email">Via Email</SelectItem>
                      <SelectItem value="phone">Via Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {triggerType === "ui" && (
                  <div className="space-y-2">
                    <Label htmlFor="startingPrompt">Starting Prompt</Label>
                    <Textarea
                      id="startingPrompt"
                      value={startingPrompt}
                      onChange={(e) => setStartingPrompt(e.target.value)}
                      required
                    />
                  </div>
                )}

                {triggerType === "phone" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Select Phone Number</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        Users will be able to send messages to this phone number
                        to start the workflow for {workflowFor}.
                      </div>
                      <Select
                        name="phoneNumber"
                        value={selectedPhone}
                        onValueChange={setSelectedPhone}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a phone number" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePhones.map((phone) => (
                            <SelectItem
                              key={phone.phoneNumber}
                              value={phone.phoneNumber}
                            >
                              {phone.phoneNumber} ({phone.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPhone && (
                      <>
                        {availablePhones.find(
                          (p) => p.phoneNumber === selectedPhone
                        )?.type === "reserved" ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allowAnyUser"
                              checked={allowAnyUser}
                              onCheckedChange={(checked) =>
                                setAllowAnyUser(checked as boolean)
                              }
                            />
                            <Label htmlFor="allowAnyUser">
                              Allow anyone to send messages
                            </Label>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="triggerPrompt">
                              Trigger Prompt
                            </Label>
                            <div className="text-sm text-muted-foreground mb-2">
                              Start {workflowFor} by sending a message to{" "}
                              {selectedPhone} beginning with @{triggerPrompt}
                            </div>
                            <Input
                              id="triggerPrompt"
                              value={triggerPrompt}
                              onChange={(e) => setTriggerPrompt(e.target.value)}
                              placeholder="Enter trigger word (without @, example: delivery, pickup, rfi, report, schedule)"
                              required
                            />
                          </div>
                        )}
                      </>
                    )}

                    {selectedPhone &&
                      !allowAnyUser &&
                      availablePhones.find(
                        (p) => p.phoneNumber === selectedPhone
                      )?.type === "general" && (
                        <div className="space-y-2">
                          <Label>Authorized Users</Label>
                          <div className="text-sm text-muted-foreground mb-2">
                            Please select users who can trigger this workflow
                          </div>
                          <AuthorizedUserSelector
                            users={members.map((m) => ({
                              id: m.id,
                              firstName: m.first_name,
                              lastName: m.last_name,
                              email: m.email,
                            }))}
                            setUsers={setUsers}
                            selectedUsers={authorizedUsers}
                            setSelectedUsers={setAuthorizedUsers}
                          />
                        </div>
                      )}
                  </>
                )}
              </>
            )}

            {currentStep === 2 && (
              // Workflow nodes
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nodeType">Add Workflow Step</Label>
                    <Select
                      name="nodeType"
                      value={currentNodeType}
                      onValueChange={setCurrentNodeType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select node type" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add configuration options based on selected node type */}
                  {currentNodeType === "validate" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="validationPrompt">
                          Validation Instructions
                        </Label>
                        <Textarea
                          id="validationPrompt"
                          value={validationPrompt}
                          onChange={(e) => setValidationPrompt(e.target.value)}
                          placeholder="Example: Check if the message contains a complete name and place"
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Configure Validation Steps</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={
                              editingValidationBranch === "success"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setEditingValidationBranch("success")
                            }
                          >
                            If Valid Steps ({validationSuccessSteps.length})
                          </Button>
                          <Button
                            type="button"
                            variant={
                              editingValidationBranch === "failure"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setEditingValidationBranch("failure")
                            }
                          >
                            If Invalid Steps ({validationFailureSteps.length})
                          </Button>
                        </div>
                      </div>

                      {editingValidationBranch && (
                        <div className="space-y-4 border p-4 rounded">
                          <h4 className="font-medium">
                            {editingValidationBranch === "success"
                              ? "If Valid Steps"
                              : "If Invalid Steps"}
                          </h4>
                          <Select
                            value={
                              editingValidationBranch === "success"
                                ? validationSuccessNodeType
                                : validationFailureNodeType
                            }
                            onValueChange={(value) => {
                              if (editingValidationBranch === "success") {
                                setValidationSuccessNodeType(value);
                                // Add node to success steps
                                if (value) {
                                  const newNode: WorkflowNode = {
                                    id: `success-${validationSuccessSteps.length}`,
                                    type: value,
                                    config: {},
                                  };
                                  setValidationSuccessSteps([
                                    ...validationSuccessSteps,
                                    newNode,
                                  ]);
                                  setValidationSuccessNodeType(""); // Reset after adding
                                }
                              } else {
                                setValidationFailureNodeType(value);
                                // Add node to failure steps
                                if (value) {
                                  const newNode: WorkflowNode = {
                                    id: `failure-${validationFailureSteps.length}`,
                                    type: value,
                                    config: {},
                                  };
                                  setValidationFailureSteps([
                                    ...validationFailureSteps,
                                    newNode,
                                  ]);
                                  setValidationFailureNodeType(""); // Reset after adding
                                }
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select step type" />
                            </SelectTrigger>
                            <SelectContent>
                              {nodeTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="space-y-2">
                            {(editingValidationBranch === "success"
                              ? validationSuccessSteps
                              : validationFailureSteps
                            ).map((step, index) => (
                              <div key={step.id} className="p-2 border rounded">
                                {index + 1}. {step.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentNodeType === "extract" && (
                    <div className="space-y-4">
                      <Label>Data Extraction Configuration</Label>

                      {/* Display existing columns */}
                      {columns.length > 0 && (
                        <div className="space-y-2">
                          <Label>Configured Columns:</Label>
                          {columns.map((col, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 p-2 border rounded"
                            >
                              <span>
                                {col.name} ({col.dataType})
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {col.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new column form */}
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Column name"
                          value={newColumn.name}
                          onChange={(e) =>
                            setNewColumn({ ...newColumn, name: e.target.value })
                          }
                        />
                        <Select
                          value={newColumn.dataType}
                          onValueChange={(
                            value: "string" | "number" | "date" | "boolean"
                          ) =>
                            setNewColumn({
                              ...newColumn,
                              dataType: value as "string",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="col-span-2">
                          <Input
                            placeholder="Description (what information to extract)"
                            value={newColumn.description}
                            onChange={(e) =>
                              setNewColumn({
                                ...newColumn,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            if (newColumn.name && newColumn.description) {
                              setColumns([...columns, newColumn]);
                              setNewColumn({
                                name: "",
                                description: "",
                                dataType: "string",
                              });
                            }
                          }}
                          className="col-span-2"
                        >
                          Add Column
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentNodeType === "condition" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="conditionPrompt">Condition</Label>
                        <Textarea
                          id="conditionPrompt"
                          value={conditionPrompt}
                          onChange={(e) => setConditionPrompt(e.target.value)}
                          placeholder="Example: Check if the delivery address is within service area"
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Configure Branch Steps</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={
                              editingBranch === "true" ? "default" : "outline"
                            }
                            onClick={() => setEditingBranch("true")}
                          >
                            If True Steps ({trueSteps.length})
                          </Button>
                          <Button
                            type="button"
                            variant={
                              editingBranch === "false" ? "default" : "outline"
                            }
                            onClick={() => setEditingBranch("false")}
                          >
                            If False Steps ({falseSteps.length})
                          </Button>
                        </div>
                      </div>

                      {editingBranch && (
                        <div className="space-y-4 border p-4 rounded">
                          <h4 className="font-medium">
                            {editingBranch === "true"
                              ? "If True Steps"
                              : "If False Steps"}
                          </h4>
                          <Select
                            value={currentNodeType}
                            onValueChange={setCurrentNodeType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select step type" />
                            </SelectTrigger>
                            <SelectContent>
                              {nodeTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="space-y-2">
                            {(editingBranch === "true"
                              ? trueSteps
                              : falseSteps
                            ).map((step, index) => (
                              <div key={step.id} className="p-2 border rounded">
                                {index + 1}. {step.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Current Workflow Steps</Label>
                    <div className="space-y-2">
                      {nodes.map((node, index) => (
                        <div
                          key={node.id}
                          className="p-2 border rounded flex justify-between items-center"
                        >
                          <span>
                            {index + 1}. {node.type}
                            {editingNodeIndex === index && " (Editing)"}
                          </span>
                          <div className="flex space-x-2">
                            {node.type !== "trigger" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNode(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {node.type !== "trigger" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNode(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 0 && !isFormValid}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!currentNodeType}
                >
                  Add Step
                </Button>
                <Button type="submit" disabled={nodes.length === 0}>
                  Save Workflow
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </ScrollArea>
  );
}

function AuthorizedUserSelector({
  users,
  setUsers,
  selectedUsers,
  setSelectedUsers,
}: {
  users: Participant[];
  setUsers: (users: Participant[]) => void;
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
}) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<Participant>>({});

  const handleAddUser = () => {
    if (newUser.firstName && newUser.lastName && newUser.email) {
      const user = {
        ...newUser,
        id: Date.now().toString(),
      } as Participant;
      setUsers([...users, user]);
      setSelectedUsers([...selectedUsers, user.id]);
      setNewUser({});
      setIsAddUserOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <MultiSelect
          options={users.map((u) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.id,
          }))}
          defaultValue={selectedUsers}
          onValueChange={setSelectedUsers}
          className="flex-grow"
        />
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Authorized User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName || ""}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
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
                    value={newUser.lastName || ""}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
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
                  value={newUser.email || ""}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  value={newUser.phoneNumber || ""}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddUser}>
              Add User
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
