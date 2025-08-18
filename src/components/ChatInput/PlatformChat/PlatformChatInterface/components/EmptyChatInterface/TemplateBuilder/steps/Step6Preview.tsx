import React from "react";

interface Props {
	headers: string;
	style: string;
	content: string;
}

export default function Step6Preview({ headers, style, content }: Props): React.JSX.Element {
	const fullHtml = `
		<!DOCTYPE html>
		<html>
		<head>
			${headers}
			<style>
				${style}
			</style>
		</head>
		<body>
			${content}
		</body>
		</html>
	`;

	return (
		<div className="h-full flex flex-col w-[80vw]">
			<h2 className="text-2xl font-bold text-gray-900 ">Preview</h2>
			<div className="flex-1 border rounded-lg overflow-hidden shadow-lg">
				<div className="bg-white h-full">
					<iframe className="w-full h-full border-0"
						srcDoc={fullHtml}
						title="Template Preview"
					/>
				</div>
			</div>
		</div>
	);
}


