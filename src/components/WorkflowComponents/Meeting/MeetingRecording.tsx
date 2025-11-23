import React, { useState, useMemo, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Video, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";
import { MinutesContentViewer } from "./MinutesContentViewer";
import { renderJsonValue } from "../utils";
import type { NodeData, EventResult } from "../types";

interface MeetingRecordingProps {
  recordingNode?: NodeData;
  currentResult?: EventResult;
  minutesNode?: NodeData;
}

export const MeetingRecording: React.FC<MeetingRecordingProps> = ({
	recordingNode,
	currentResult,
	minutesNode,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [activeTranscriptTab, setActiveTranscriptTab] = useState<"transcript" | "analysis">("transcript");
  
	const hasVideo = recordingNode?.output?.video?.url || recordingNode?.output?.url;
	const hasRawTranscript = recordingNode?.output?.raw_transcript_data;
  
	// Get enhanced transcript from transcribe_meeting node
	const enhancedTranscript = useMemo(() => {
		if (!currentResult?.nodes) return null;
		const transcribeNode = currentResult.nodes.find((node: any) => 
			node.id.toLowerCase().includes("transcribe_meeting"),
		);
		return transcribeNode?.output;
	}, [currentResult?.nodes]);
  
	if (!hasVideo && !hasRawTranscript && !enhancedTranscript) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				<div className="text-center">
					<Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
					<p>Meeting recording not available</p>
				</div>
			</div>
		);
	}

	const handleTranscriptClick = (timestamp: number) => {
		if (videoRef.current) {
			videoRef.current.currentTime = timestamp;
			videoRef.current.play();
		}
	};

	const formatTimestamp = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};
  
	const hasMinutes = minutesNode?.output?.resource_id;

	return (
		<div className="flex flex-col lg:flex-row h-full gap-6 max-w-screen-2xl mx-auto w-full">
			<div className={`flex flex-col gap-6 w-1/2`}>
			{hasVideo && (
				<div className="flex-shrink-0 w-2/3 mx-auto">
					<div className="w-full">
						<AspectRatio className="bg-gray-100 rounded-lg overflow-hidden" ratio={16 / 9}>
							<video
								className="w-full h-full"
								controls
								ref={videoRef}
								>
								<source src={recordingNode?.output?.video?.url || recordingNode?.output?.url} type="video/mp4" />
                Your browser does not support the video tag
							</video>
						</AspectRatio>
					</div>
				</div>
			)}

			{(hasRawTranscript || enhancedTranscript) && (
								<div className={`flex flex-col w-full min-h-0`}>
									<div className="flex flex-col mb-3 flex-shrink-0">
										<div className="flex border-b border-gray-200">
											{hasRawTranscript && (
												<button
													className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
														activeTranscriptTab === "transcript"
															? "border-blue-500 text-blue-600"
															: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
													}`}
													onClick={() => setActiveTranscriptTab("transcript")}
												>
													Transcript
												</button>
											)}

											{enhancedTranscript && (
												<button
													className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
														activeTranscriptTab === "analysis"
															? "border-blue-500 text-blue-600"
															: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
													}`}
													onClick={() => setActiveTranscriptTab("analysis")}
												>
													Video Analysis
												</button>
											)}
										</div>
									</div>
									<ScrollArea className="flex-1 border rounded-lg min-h-0">
										<div className="p-4 h-full overflow-auto">
											{activeTranscriptTab === "transcript" && hasRawTranscript && (
												<div className="space-y-4">
													{(() => {
														// Group consecutive segments by the same participant
														const groupedSegments: any[] = [];
														let currentGroup: any = null;

														recordingNode?.output?.raw_transcript_data?.forEach((entry: any) => {
															const participantId = entry.participant.id;
								
															if (!currentGroup || currentGroup.participantId !== participantId) {
																// Start a new group
																currentGroup = {
																	participantId,
																	participant: entry.participant,
																	segments: [],
																	startTime: null,
																	endTime: null,
																};
																groupedSegments.push(currentGroup);
															}
								
															// Add all word segments from this entry to the current group
															entry.words.forEach((word: any) => {
																currentGroup.segments.push(word);
								
																// Update time range
																if (!currentGroup.startTime || word.start_timestamp.relative < currentGroup.startTime) {
																	currentGroup.startTime = word.start_timestamp.relative;
																}
																if (!currentGroup.endTime || word.end_timestamp.relative > currentGroup.endTime) {
																	currentGroup.endTime = word.end_timestamp.relative;
																}
															});
														});

														return groupedSegments.map((group, groupIndex) => (
															<div className="border-l-2 border-blue-200 pl-3" key={groupIndex}>
																<div className="text-xs text-gray-500 mb-2">
																	<span className="font-medium">{group.participant.name}</span>
																	{group.participant.is_host && <span className="ml-1">(Host)</span>}
																	<span className="ml-2 text-gray-400">
										[{formatTimestamp(group.startTime)}:{formatTimestamp(group.endTime)}]
																	</span>
																</div>
																<div className="flex flex-wrap gap-1 leading-relaxed">
																	{group.segments.map((segment: any, segmentIndex: number) => (
																		<button
																			className="text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-800 rounded px-1 py-0.5 transition-colors cursor-pointer inline-flex items-center gap-1 group"
																			key={segmentIndex}
																			onClick={() => handleTranscriptClick(segment.start_timestamp.relative)}
																			title={`Jump to ${formatTimestamp(segment.start_timestamp.relative)}`}
																		>
																			<span>{segment.text}</span>
																		</button>
																	))}
																</div>
															</div>
														));
													})()}
												</div>
											)}
											{activeTranscriptTab === "analysis" && enhancedTranscript && (
												<div className="h-full">
													{typeof enhancedTranscript === "string" ? (
														<div className="text-sm text-gray-700 whitespace-pre-line">
															<MarkDownDisplay content={enhancedTranscript} />
														</div>
													) : (
														<div className="text-sm text-gray-700">{renderJsonValue(enhancedTranscript)}</div>
													)}
												</div>
											)}
										</div>
									</ScrollArea>
								</div>
							)}

			</div>

			{hasMinutes && (
						<div className="flex-1 rounded-lg min-h-0 overflow-hidden w-1/2">
							<MinutesContentViewer 
								resource_id={minutesNode.output.resource_id} 
								showComments={false}
								onTimestampClick={handleTranscriptClick}
							/>
					</div>
				)}


		</div>
	);
};

export default MeetingRecording; 