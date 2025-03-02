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
    <div className="flex items-center gap-2">
      <MessageSquare className="h-4 w-4 text-slate-500" />
      <h4 className={`text-sm ${isActive ? "font-medium" : ""} truncate`}>
        {title}
      </h4>
    </div>
  </div>
);

// Simple settings component
const ChatSettings = () => (
  <div className="p-4">
    <h3 className="text-md font-medium mb-4">Chat Settings</h3>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option>GPT-4</option>
          <option>GPT-3.5 Turbo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Temperature</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="0.7"
          className="w-full"
        />
      </div>

      <div className="flex items-center">
        <input type="checkbox" id="memory" className="mr-2" />
        <label htmlFor="memory" className="text-sm">
          Enable context memory
        </label>
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
    if (chatEntities && chatEntities.length > 0 && !activeChatEntity) {
      setActiveChatEntity(chatEntities[chatEntities.length - 1]);
    }
  }, [chatEntities, activeChatEntity, setActiveChatEntity]);

  const handleCreateNewChat = () => {
    setActiveChatEntity(null);
    setLocalChats([]);
    setActiveTab("chat");
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
              <button
                className="text-xs text-blue-500 flex items-center"
                onClick={handleCreateNewChat}
              >
                <Plus size={14} className="mr-1" /> New Chat
              </button>
            </div>
            <ScrollArea className="flex-grow">
              {chatEntities && chatEntities.length > 0 ? (
                chatEntities.map((chatEntity) => (
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
        return <ChatSettings />;
      case "chat":
      default:
        return (
          <PlatformChatInterface
            folderId={folderId}
            chatTarget={chatTarget}
            onContentUpdate={onContentUpdate}
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
            className="p-3 hover:bg-gray-100 text-gray-600 self-end"
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* New Chat button at the top of sidebar */}
          <button
            onClick={handleCreateNewChat}
            className={`p-2 rounded-lg mb-6 text-white bg-indigo-600 hover:bg-indigo-700 flex items-center mx-2 ${
              sidebarOpen ? "justify-start pl-4" : "justify-center"
            }`}
          >
            <Plus size={20} />
            {sidebarOpen && <span className="ml-2">New Chat</span>}
          </button>

          {/* Sidebar tabs */}
          <div className="flex flex-col items-center py-2 space-y-6">
            <button
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
            </button>
            <button
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
            </button>
            <button
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
            </button>
          </div>

          {/* Chat selector when sidebar is open */}
          {sidebarOpen && (
            <div className="mt-auto p-3 border-t border-slate-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {titleMap[chatTarget]} {folderName}
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="justify-center gap-2"
                  onClick={handleCreateNewChat}
                >
                  <PenBox className="w-4 h-4" />
                  New Chat
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {/* Only show compact top bar when sidebar is collapsed */}
          {!sidebarOpen && activeTab === "chat" && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <h3 className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {titleMap[chatTarget]} {folderName}
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="justify-center gap-2"
                  onClick={handleCreateNewChat}
                >
                  <PenBox className="w-4 h-4" />
                  New Chat
                </Button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <History className="h-4 w-4" />
                  History
                </button>
              </div>
            </div>
          )}

          {/* Dynamic content based on active tab */}
          <div className="flex-grow overflow-hidden">{renderMainContent()}</div>
        </div>
      </div>
    </div>
  );
}
