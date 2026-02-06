import React from "react";

interface FloatingSaveIndicatorProps {
	hasChanges: boolean;
	isSaving: boolean;
	onSave: () => void;
}

const FloatingSaveIndicator: React.FC<FloatingSaveIndicatorProps> = ({
	hasChanges,
	isSaving,
	onSave,
}) => {
	if (!hasChanges) return null;

	return (
		<div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg px-3 py-1.5 shadow-sm">
			<span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
			<button
				className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
				disabled={isSaving}
				onClick={onSave}
				type="button"
			>
				{isSaving ? "Saving..." : "Save"}
			</button>
		</div>
	);
};

export default FloatingSaveIndicator;
