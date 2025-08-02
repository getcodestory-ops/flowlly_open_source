import React from "react";

interface MeetingTemplateProps {}

export const MeetingTemplate: React.FC<MeetingTemplateProps> = () => {
	return (
		<div className="flex items-center justify-center h-full text-gray-500">
			<div className="text-center">
				<p className="text-lg">template</p>
			</div>
		</div>
	);
};

export default MeetingTemplate; 