import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

function DashboardRightPanel() {
	return (
		<div className="w-1/3 h-full bg-pink-100">This is the right panel</div>
	);
}

export default DashboardRightPanel;
