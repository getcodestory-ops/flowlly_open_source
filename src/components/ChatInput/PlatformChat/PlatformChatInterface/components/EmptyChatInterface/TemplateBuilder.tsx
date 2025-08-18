import React from "react";
import type { StorageResourceEntity } from "@/api/templateRoutes";
import TemplateBuilderRoot from "./TemplateBuilder/TemplateBuilderRoot";

interface TemplateBuilderProps {
	onCreated: (template: StorageResourceEntity) => void;
}

export default function TemplateBuilder({ onCreated }: TemplateBuilderProps): React.JSX.Element {
	return <TemplateBuilderRoot onCreated={onCreated} />;
}
