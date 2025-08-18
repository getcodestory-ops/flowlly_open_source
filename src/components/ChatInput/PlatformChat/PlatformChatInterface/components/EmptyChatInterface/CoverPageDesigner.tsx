import React from "react";
import CoverPageDesignerRoot from "./CoverPageDesigner/CoverPageDesignerRoot";
import type { CoverPageDesignerProps } from "./CoverPageDesigner/types";

export default function CoverPageDesigner(props: CoverPageDesignerProps): React.JSX.Element {
	return <CoverPageDesignerRoot {...props} />;
}

// Re-export types for backward compatibility
export type { CoverElement } from "./CoverPageDesigner/types";
