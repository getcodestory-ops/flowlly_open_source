"use client";

import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { distributeEmails } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

interface EmailModalProps {
  content?: string;
  sessionToken?: Session;
  editor?: any;
  subject?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({
  content,
  sessionToken,
  editor,
  subject = "Minutes of the Meeting",
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleDistributeEmails = () => {
    if (!sessionToken || emails.length === 0) return;
    if (content) distributeEmails(sessionToken, content, emails, subject);
    else if (editor)
      distributeEmails(sessionToken, editor.getHTML(), emails, subject);
    else {
      toast({
        title: "Error",
        description: "No content found to send",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Emails sent",
      description: "The minutes of the meeting have been sent to the emails",
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen((state) => !state)}>
        <IoMdSend className="mr-2" />
        Distribute {subject}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add User Emails</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
                className="col-span-3"
              />
            </div>
            <Button onClick={handleAddEmail} className="ml-auto">
              Add Email
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {emails.map((email) => (
              <Badge key={email} variant="secondary">
                {email}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => handleRemoveEmail(email)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={emails.length === 0}
              onClick={handleDistributeEmails}
            >
              Distribute Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailModal;
