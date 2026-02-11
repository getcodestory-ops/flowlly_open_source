"use client";

import React, { useState } from "react";
import { X, Sparkles, Zap } from "lucide-react";
import { newUserTips } from "@/utils/newUserTips";

interface NewUserTipsProps {
	onDismiss: () => void;
	onTryPrompt?: (prompt: string) => void;
}

export default function NewUserTips({ onDismiss, onTryPrompt }: NewUserTipsProps) {
	const [isClosing, setIsClosing] = useState(false);

	const handleDismiss = () => {
		setIsClosing(true);
		setTimeout(() => onDismiss(), 300);
	};

	return (
		<div
			className={`w-full rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-5 shadow-sm transition-all duration-300 ${
				isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
			}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
						<Sparkles className="h-4 w-4 text-indigo-600" />
					</div>
					<h3 className="text-sm font-semibold text-slate-800">
						Try these new advanced capabilities with Flowlly
					</h3>
				</div>
				<button
					aria-label="Dismiss tips"
					className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					onClick={handleDismiss}
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Tip cards — clickable */}
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{newUserTips.map((tip, i) => (
					<button
						className="group flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-white/70 px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-indigo-200 hover:bg-white hover:shadow-md"
						key={i}
						onClick={() => onTryPrompt?.(tip.prompt)}
					>
						<div className="flex items-center gap-1.5">
							<span className="text-base leading-none">{tip.emoji}</span>
							<span className="text-[11px] font-semibold leading-tight text-slate-700">
								{tip.label}
							</span>
						</div>
						<span className="text-[10px] leading-snug text-slate-400">
							{tip.description}
						</span>
					</button>
				))}
			</div>

			{/* Model recommendation */}
			<div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-500/80">
				<Zap className="h-3 w-3" />
				<span>
					Use <span className="font-semibold">Claude 4.6</span> or <span className="font-semibold">Flowlly Agent</span> model for best results
				</span>
			</div>
		</div>
	);
}
