"use client";
import ScheduleInterface from "@/Layouts/ScheduleInterface";
import { useStore } from "@/utils/store";
import { useEffect } from "react";

export default function ConstructionDashboardHome() {
	const { setAppView } = useStore((state) => ({
		setAppView: state.setAppView,
	}));

	useEffect(() => {
		setAppView("schedule");
	}, []);
	return <ScheduleInterface />;
}
