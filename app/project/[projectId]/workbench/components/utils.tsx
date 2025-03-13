import { Clock, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";
import { cn } from "@/lib/utils";
import type { ColorMapping } from "./types";

export const colorMapping: ColorMapping = {
	pending: {
		icon: <Clock className="text-blue-500" size={20} />,
		border: "border-2 border-blue-500",
	},
	completed: {
		icon: <CheckCircle className="text-green-500" size={20} />,
		border: "border-2 border-green-500",
	},
	running: {
		icon: <RefreshCw className="text-yellow-500 animate-spin" size={20} />,
		border: "border-2 border-yellow-500",
	},
	failed: {
		icon: <XCircle className="text-red-500" size={20} />,
		border: "border-2 border-red-500",
	},
	skipped: {
		icon: <XCircle className="text-gray-500" size={20} />,
		border: "border-2 border-gray-500",
	},
	cancelled: {
		icon: <XCircle className="text-gray-500" size={20} />,
		border: "border-2 border-gray-500",
	},
	retry: {
		icon: <RefreshCw className="text-yellow-500" size={20} />,
		border: "border-2 border-yellow-500",
	},
};

export const renderJsonValue = (value: any, depth = 0): JSX.Element => {
	if (typeof value === "object" && value !== null) {
		// Filter out empty values and clean up the entries
		const entries = Object.entries(value).filter(
			([_, v]) =>
				v !== null &&
        v !== undefined &&
        (typeof v !== "string" || v.trim() !== ""),
		);

		if (entries.length === 0) return <></>;

		return (
			<div className={cn("space-y-2", depth > 0 && "ml-4")}>
				{entries.map(([key, subValue]) => {
					// Skip rendering if the key is a numeric string
					if (!isNaN(Number(key))) {
						return renderJsonValue(subValue, depth);
					}

					return (
						<div
							className={cn(
								"p-4 rounded-lg",
								depth === 0 ? "text-lg" : "bg-white/50 border rounded-lg",
							)}
							key={key}
						>
							<h4
								className={cn(
									"font-medium capitalize mb-2",
									depth === 0
										? "text-lg text-black"
										: "text-xs text-gray-700",
								)}
							>
								{key.replace(/_/g, " ")}
							</h4>
							<div className="text-sm text-gray-700">
								{renderJsonValue(subValue, depth + 1)}
							</div>
						</div>
					);
				})}
			</div>
		);
	} else if (Array.isArray(value)) {
		// Filter out empty array items
		const filteredItems = value.filter(
			(item) =>
				item !== null &&
        item !== undefined &&
        (typeof item !== "string" || item.trim() !== ""),
		);

		if (filteredItems.length === 0) return <></>;

		return (
			<div className="space-y-2">
				{filteredItems.map((item) => renderJsonValue(item, depth + 1))}
			</div>
		);
	} else {
		// Clean up string values
		const stringValue = String(value).trim();
		if (!stringValue) return <></>;

		const hasMarkdownSyntax =
      /[#*`\[\]_~]/.test(stringValue) ||
      stringValue.includes("\n") ||
      /\d\.\s/.test(stringValue);

		if (hasMarkdownSyntax) {
			return <MarkDownDisplay content={stringValue} />;
		}

		return <p className="text-sm text-gray-700">{stringValue}</p>;
	}
};

export const truncateObject = (obj: any, maxEntries: number = 5): any => {
	if (!obj || typeof obj !== "object") return obj;

	if (Array.isArray(obj)) {
		return obj.slice(0, maxEntries);
	}

	const entries = Object.entries(obj);
	if (entries.length <= maxEntries) return obj;

	return Object.fromEntries([
		...entries.slice(0, maxEntries),
		["...", `${entries.length - maxEntries} more items`],
	]);
};
