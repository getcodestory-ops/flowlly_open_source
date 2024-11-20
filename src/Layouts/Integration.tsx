"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Integration() {
  const [procoreConnected, setProcoreConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [syncProjects, setSyncProjects] = useState(false);
  const [syncInterval, setSyncInterval] = useState("60");
  const [googleConnected, setGoogleConnected] = useState(false);

  const handleProcoreConnect = () => {
    setProcoreConnected(!procoreConnected);
  };

  const handleMicrosoftConnect = async () => {
    if (!microsoftConnected) {
      // Redirect to Microsoft OAuth login
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/login`;
    } else {
      // Disconnect from Microsoft
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/disconnect`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        setMicrosoftConnected(false);
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }
  };

  // Check Microsoft connection status on component mount
  useEffect(() => {
    const checkMicrosoftConnection = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/status`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setMicrosoftConnected(data.connected);
      } catch (error) {
        console.error("Failed to check Microsoft connection:", error);
      }
    };

    checkMicrosoftConnection();
  }, []);

  const handleGoogleConnect = () => {
    setGoogleConnected(!googleConnected);
  };

  const handleSave = () => {
    // In a real implementation, this would save the settings to your backend
    console.log("Settings saved:", { syncProjects, syncInterval });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Procore Integration Card */}
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Procore Integration</CardTitle>
          <CardDescription>
            Connect and manage your Procore account integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            {procoreConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {procoreConnected
                ? "Connected to Procore"
                : "Not connected to Procore"}
            </span>
          </div>
          <Button
            onClick={handleProcoreConnect}
            variant={procoreConnected ? "destructive" : "default"}
          >
            {procoreConnected
              ? "Disconnect from Procore"
              : "Connect to Procore"}
          </Button>
          {procoreConnected && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-projects"
                  checked={syncProjects}
                  onCheckedChange={setSyncProjects}
                />
                <Label htmlFor="sync-projects">Sync Procore projects</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync interval (minutes)</Label>
                <Input
                  id="sync-interval"
                  type="number"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  min="1"
                  max="1440"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Microsoft Integration Card */}
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Microsoft Integration</CardTitle>
          <CardDescription>
            Connect and manage your Microsoft account integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            {microsoftConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {microsoftConnected
                ? "Connected to Microsoft"
                : "Not connected to Microsoft"}
            </span>
          </div>
          <Button
            onClick={handleMicrosoftConnect}
            variant={microsoftConnected ? "destructive" : "default"}
          >
            {microsoftConnected
              ? "Disconnect from Microsoft"
              : "Connect to Microsoft"}
          </Button>
          {microsoftConnected && (
            <div className="space-y-4">
              {/* Add Microsoft-specific settings here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Integration Card */}
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Google Integration</CardTitle>
          <CardDescription>
            Connect and manage your Google account integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            {googleConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {googleConnected
                ? "Connected to Google"
                : "Not connected to Google"}
            </span>
          </div>
          <Button
            onClick={handleGoogleConnect}
            variant={googleConnected ? "destructive" : "default"}
          >
            {googleConnected ? "Disconnect from Google" : "Connect to Google"}
          </Button>
          {googleConnected && (
            <div className="space-y-4">
              {/* Add Google-specific settings here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <Button
        onClick={handleSave}
        disabled={!procoreConnected && !microsoftConnected && !googleConnected}
        className="mt-4"
      >
        Save Settings
      </Button>
    </div>
  );
}
