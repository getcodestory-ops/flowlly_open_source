"use client";

import { useState } from "react";
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
  const [isConnected, setIsConnected] = useState(false);
  const [syncProjects, setSyncProjects] = useState(false);
  const [syncInterval, setSyncInterval] = useState("60");

  const handleConnect = () => {
    // In a real implementation, this would initiate the OAuth flow with Procore
    setIsConnected(!isConnected);
  };

  const handleSave = () => {
    // In a real implementation, this would save the settings to your backend
    console.log("Settings saved:", { syncProjects, syncInterval });
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-3xl ">
        <CardHeader>
          <CardTitle>Procore Integration</CardTitle>
          <CardDescription>
            Connect and manage your Procore account integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {isConnected
                ? "Connected to Procore"
                : "Not connected to Procore"}
            </span>
          </div>
          <Button
            onClick={handleConnect}
            variant={isConnected ? "destructive" : "default"}
          >
            {isConnected ? "Disconnect from Procore" : "Connect to Procore"}
          </Button>
          {isConnected && (
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
        <CardFooter>
          <Button onClick={handleSave} disabled={!isConnected}>
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
