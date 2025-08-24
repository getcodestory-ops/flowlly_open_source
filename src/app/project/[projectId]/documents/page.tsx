"use client";
import { DocumentFolderModule } from "@/components/Dailies/DocumentModule";
import { useEffect } from "react";
import { useStore } from "@/utils/store";

export default function ConstructionDashboardHome() {
	const { setAppView } = useStore((state) => ({
		setAppView: state.setAppView,
	}));

	useEffect(() => {
		setAppView("updates");
	}, []);
	return <DocumentFolderModule />;
}
