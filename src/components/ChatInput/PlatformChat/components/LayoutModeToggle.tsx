"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { PanelLeft, PanelLeftClose, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewStore } from "@/utils/store";
import { useFocusModeNudge } from "@/hooks/useFocusModeNudge";

const CALLOUT_HEIGHT = 110; // approximate height of the callout in px
const GAP = 8; // space between button and callout

export default function LayoutModeToggle(): React.ReactElement {
	const { chatLayoutMode, setChatLayoutMode } = useViewStore();
	const isAgentMode = chatLayoutMode === "agent";
	const { show: showNudge, dismiss: dismissNudge } = useFocusModeNudge();
	const [isClosing, setIsClosing] = useState(false);
	const [mounted, setMounted] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean } | null>(null);

	// Delay entrance so it animates in
	useEffect(() => {
		if (showNudge && !isAgentMode) {
			const t = setTimeout(() => setMounted(true), 400);
			return () => clearTimeout(t);
		}
		setMounted(false);
	}, [showNudge, isAgentMode]);

	// Position the portal callout relative to the button, flipping above if no room below
	const updatePosition = useCallback(() => {
		if (!buttonRef.current) return;
		const rect = buttonRef.current.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const flipped = spaceBelow < CALLOUT_HEIGHT + GAP;

		setPos({
			top: flipped
				? rect.top - GAP       // callout bottom edge aligns here (positioned via `bottom`)
				: rect.bottom + GAP,   // callout top edge
			left: rect.left + rect.width / 2,
			flipped,
		});
	}, []);

	useEffect(() => {
		if (!showNudge || isAgentMode) return;
		updatePosition();
		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);
		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [showNudge, isAgentMode, updatePosition]);

	const handleDismiss = () => {
		setIsClosing(true);
		setTimeout(() => {
			dismissNudge();
			setIsClosing(false);
		}, 250);
	};

	const handleTryFocusMode = () => {
		setChatLayoutMode("agent");
		handleDismiss();
	};

	const nudgeVisible = showNudge && !isAgentMode && mounted && !isClosing;

	return (
		<>
			<TooltipProvider delayDuration={300}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							ref={buttonRef}
							className={`gap-1.5 text-xs transition-all duration-200 border border-slate-200 ${
								isAgentMode
									? "text-purple-600 hover:bg-purple-50"
									: "text-slate-500 hover:bg-slate-50"
							} ${nudgeVisible ? "ring-2 ring-purple-300 ring-offset-1" : ""}`}
							onClick={() => setChatLayoutMode(isAgentMode ? "split" : "agent")}
							size="sm"
							variant="ghost"
						>
							{isAgentMode ? (
								<>
									<PanelLeft className="h-3.5 w-3.5" />
									<span>Split</span>
								</>
							) : (
								<>
									<PanelLeftClose className="h-3.5 w-3.5" />
									<span>Focus</span>
								</>
							)}
						</Button>
					</TooltipTrigger>
					{!nudgeVisible && (
						<TooltipContent side="bottom" sideOffset={5}>
							<p className="text-xs">{isAgentMode ? "Switch to split view" : "Switch to focus mode"}</p>
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>

			{/* Focus mode nudge — rendered via portal, auto-flips above when near bottom */}
			{showNudge && !isAgentMode && pos &&
				createPortal(
					<div
						className={`fixed z-[9999] transition-all duration-250 ${
							nudgeVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 pointer-events-none"
						}`}
						style={
							pos.flipped
								? { bottom: window.innerHeight - pos.top, left: pos.left, transform: "translateX(-50%)" }
								: { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
						}
					>
						{/* Arrow + body — order flips depending on direction */}
						{pos.flipped ? (
							<>
								{/* Callout body */}
								<CalloutBody
									handleDismiss={handleDismiss}
									handleTryFocusMode={handleTryFocusMode}
								/>
								{/* Arrow pointing down */}
								<div className="flex justify-center">
									<div className="h-2 w-2 rotate-45 bg-purple-600 -mt-1" />
								</div>
							</>
						) : (
							<>
								{/* Arrow pointing up */}
								<div className="flex justify-center">
									<div className="h-2 w-2 rotate-45 bg-purple-600 -mb-1" />
								</div>
								{/* Callout body */}
								<CalloutBody
									handleDismiss={handleDismiss}
									handleTryFocusMode={handleTryFocusMode}
								/>
							</>
						)}
					</div>,
					document.body,
				)
			}
		</>
	);
}

/* ── Extracted callout body so we don't duplicate markup ── */
function CalloutBody({
	handleDismiss,
	handleTryFocusMode,
}: {
	handleDismiss: () => void;
	handleTryFocusMode: () => void;
}) {
	return (
		<div className="w-[260px] rounded-xl bg-purple-600 p-3 shadow-lg shadow-purple-200/50 text-white">
			<div className="flex items-start gap-2">
				<PanelLeftClose className="h-4 w-4 mt-0.5 shrink-0 opacity-80" />
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold leading-tight">
						Try Focus Mode
					</p>
					<p className="text-[11px] leading-snug opacity-80 mt-0.5">
						Full-width chat with tabbed docs, files &amp; sandbox previews
					</p>
				</div>
				<button
					aria-label="Dismiss"
					className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/20"
					onClick={(e) => {
						e.stopPropagation();
						handleDismiss();
					}}
				>
					<X className="h-3 w-3" />
				</button>
			</div>
			<button
				className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/30 active:scale-[0.97]"
				onClick={(e) => {
					e.stopPropagation();
					handleTryFocusMode();
				}}
			>
				Try it now
				<ArrowRight className="h-3 w-3" />
			</button>
		</div>
	);
}
