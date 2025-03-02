import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  title?: string;
  openText?: string;
  icon?: React.ReactNode;
  className?: string;
  fixed?: boolean;
  position?: {
    bottom?: number | string;
    right?: number | string;
    left?: number | string;
    top?: number | string;
  };
}

const ChatButton: React.FC<ChatButtonProps> = ({
  isOpen,
  onClick,
  title = isOpen ? "Close chat assistant" : "Chat with Flowlly AI",
  openText = "Chat",
  icon = <MessageCircle className="h-5 w-5" />,
  className = "",
  fixed = true,
  position = { bottom: "1rem", right: "1rem" },
}) => {
  const positionStyles: React.CSSProperties = {
    bottom: position.bottom,
    right: position.right,
    left: position.left,
    top: position.top,
  };

  return (
    <Button
      className={`shadow-md bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 transition-all duration-200 border-0 z-10 ${
        fixed ? "fixed" : ""
      } ${className}`}
      onClick={onClick}
      title={title}
      style={fixed ? positionStyles : undefined}
    >
      {isOpen ? (
        <>
          <X className="h-5 w-5" />
          <span className="hidden sm:inline">Close chat</span>
        </>
      ) : (
        <>
          {icon}
          <span className="hidden sm:inline">{openText}</span>
        </>
      )}
    </Button>
  );
};

export default ChatButton;
