"use client";
import { useEffect } from "react";
import AssignmentHome from "@/components/WorkflowComponents/Assignment";
import { useStore } from "@/utils/store";

export default function ConstructionDashboardHome() {
	const { setAppView } = useStore((state) => ({
		setAppView: state.setAppView,
	}));

	useEffect(() => {
		setAppView("workflows");
	}, []);
	return <AssignmentHome />;
}
