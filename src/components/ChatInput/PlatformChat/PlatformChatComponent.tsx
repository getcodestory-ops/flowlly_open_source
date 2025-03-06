"use client";

import PlatformChatSelector from "./PlatformChatSelector";
import PlatformChatInterface from "./PlatformChatInterface";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
  Settings,
  Plus,
  PenBox,
} from "lucide-react";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { getPlatformChatEntities } from "@/api/agentRoutes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const models = [
  { id: "gemini-2.0-flash", name: "Gemini Flash" },
  { id: "gemini-2.0-pro-exp-02-05", name: "Gemini Pro" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "gpt-4o", name: "GPT-4.0" },
];

const titleMap: Record<string, string> = {
  document: "Source for answers",
  schedule: "Interact with ",
  "document-edit": "Document Editor",
  workflow: " ",
};

// Simple history item component
const HistoryItem = ({
  title,
  isActive = false,
  onClick,
}: {
  title: string;
  isActive?: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-3 border-b border-slate-100 cursor-pointer ${
      isActive ? "bg-indigo-50" : "hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2 ">
      <MessageSquare className="h-4 w-4 text-slate-500" />
      <h4 className={`text-sm ${isActive ? "font-medium" : ""} truncate`}>
        {title}
      </h4>
    </div>
  </div>
);

// Updated ChatSettings component to use state
const ChatSettings = ({
  selectedModel,
  setSelectedModel,
  includeContext,
  setIncludeContext,
}: {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  includeContext: boolean;
  setIncludeContext: (include: boolean) => void;
}) => (
  <div className="p-4">
    <h3 className="text-md font-medium mb-4">Chat Settings</h3>

    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-1">Model</Label>
        <Select
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block text-sm font-medium mb-1">Temperature</Label>
        <Slider
          min={0}
          max={1}
          step={0.1}
          defaultValue={[0.7]}
          className="w-full"
        />
      </div>

      <div className="flex items-center">
        <Checkbox
          id="memory"
          className="mr-2"
          checked={includeContext}
          onCheckedChange={(checked) => setIncludeContext(checked as boolean)}
        />
        <Label htmlFor="memory" className="text-sm">
          Include project context
        </Label>
      </div>
    </div>
  </div>
);

export default function PlatformChatComponent({
  folderId,
  folderName,
  chatTarget,
  onContentUpdate,
}: {
  folderId: string;
  folderName: string;
  chatTarget:
    | "workflow"
    | "editor"
    | "schedule"
    | "project"
    | "agent"
    | "folder";
  onContentUpdate?: (newContent: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "settings">(
    "chat"
  );
  // Add state for model and includeContext
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-2.0-flash");
  const [includeContext, setIncludeContext] = useState<boolean>(false);

  // Get store data for chat entities
  const {
    activeChatEntity,
    setActiveChatEntity,
    activeProject,
    session,
    setLocalChats,
  } = useStore((state) => ({
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    activeProject: state.activeProject,
    session: state.session,
    setLocalChats: state.setLocalChats,
  }));

  // Query chat entities
  const { data: chatEntities, isLoading: chatsLoading } = useQuery({
    queryKey: ["documentChatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getPlatformChatEntities(
        session,
        activeProject.project_id,
        folderId,
        chatTarget
      );
    },
  });

  // Set first chat entity as active on initial load
  useEffect(() => {
    setLocalChats([]);
    setActiveChatEntity(null);
  }, []);

  const handleCreateNewChat = () => {
    setActiveChatEntity(null);
    setLocalChats([]);
  };

  const handleSelectChatEntity = (chatEntity: any) => {
    setActiveChatEntity(chatEntity);
    setActiveTab("chat");
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "history":
        return (
          <div className="h-full flex flex-col">
            <div className="p-3 flex justify-between items-center border-b">
              <h3 className="font-medium">Chat History</h3>
              <Button
                variant="outline"
                className="text-xs  flex items-center"
                onClick={handleCreateNewChat}
              >
                <Plus size={14} className="mr-1" /> New Chat
              </Button>
            </div>
            <ScrollArea className="flex-grow m-2 ">
              {chatEntities && chatEntities.length > 0 ? (
                chatEntities
                  .toReversed()
                  .map((chatEntity) => (
                    <HistoryItem
                      key={chatEntity.id}
                      title={chatEntity.chat_name}
                      isActive={chatEntity.id === activeChatEntity?.id}
                      onClick={() => handleSelectChatEntity(chatEntity)}
                    />
                  ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  {chatsLoading ? "Loading chats..." : "No chat history found"}
                </div>
              )}
            </ScrollArea>
          </div>
        );
      case "settings":
        return (
          <ChatSettings
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            includeContext={includeContext}
            setIncludeContext={setIncludeContext}
          />
        );
      case "chat":
      default:
        return (
          <PlatformChatInterface
            folderId={folderId}
            chatTarget={chatTarget}
            onContentUpdate={onContentUpdate}
            selectedModel={selectedModel}
            includeContext={includeContext}
          />
        );
    }
  };

  return (
    <div className="container mx-auto h-full">
      <div className="flex h-[calc(100vh-20px)] bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Left sidebar for chat controls */}
        <div
          className={`flex flex-col border-r border-slate-200 transition-all duration-300 ${
            sidebarOpen ? "w-60" : "w-12"
          }`}
        >
          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 hover:bg-gray-100 text-gray-600 self-end rounded-lg mb-6"
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* New Chat button at the top of sidebar */}
          <Button
            onClick={handleCreateNewChat}
            className={`p-2 mx-1 rounded-lg mb-4 text-white bg-indigo-600 hover:bg-indigo-700 flex items-center  ${
              sidebarOpen ? "justify-start pl-4" : "justify-center"
            }`}
          >
            <PenBox size={16} />
            {sidebarOpen && <span className="ml-2">New Chat</span>}
          </Button>

          {/* Sidebar tabs */}
          <div className="flex flex-col items-center py-2 space-y-6 mx-1">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("chat")}
              className={`p-2 rounded-lg ${
                activeTab === "chat"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              } flex items-center w-full ${
                sidebarOpen ? "justify-start pl-4" : "justify-center"
              }`}
            >
              <MessageSquare size={20} />
              {sidebarOpen && <span className="ml-2">Chat</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("history")}
              className={`p-2 rounded-lg ${
                activeTab === "history"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              } flex items-center w-full ${
                sidebarOpen ? "justify-start pl-4" : "justify-center"
              }`}
            >
              <History size={20} />
              {sidebarOpen && <span className="ml-2">History</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("settings")}
              className={`p-2 rounded-lg ${
                activeTab === "settings"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              } flex items-center w-full ${
                sidebarOpen ? "justify-start pl-4" : "justify-center"
              }`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="ml-2">Settings</span>}
            </Button>
          </div>

          {/* Chat selector when sidebar is open */}
          {sidebarOpen && (
            <div className="mt-auto p-3 border-t border-slate-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {titleMap[chatTarget]} {folderName}
              </h3>
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {/* Only show compact top bar when sidebar is collapsed */}

          {/* Dynamic content based on active tab */}
          <div className="flex-grow overflow-hidden">{renderMainContent()}</div>
        </div>
      </div>
    </div>
  );
}
