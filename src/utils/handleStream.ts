// import { useChatContext } from "@/lib/context";

// import { ChatMessage } from "../types";

export const handleStreams = () => {
	//   const { updateStreamingHistory } = useChatContext();

	const handleStream = async(
		reader: ReadableStreamDefaultReader<Uint8Array>,
	): Promise<void> => {
		const decoder = new TextDecoder("utf-8");

		const handleStreamRecursively = async() => {
			const { done, value } = await reader.read();

			if (done) {
				return;
			}

			const dataStrings = decoder
				.decode(value)
				.trim()
				.split("data: ")
				.filter(Boolean);

			dataStrings.forEach((data) => {
				const parsedData = JSON.parse(data);
				// updateStreamingHistory(parsedData);
			});

			await handleStreamRecursively();
		};

		await handleStreamRecursively();
	};

	return {
		handleStream,
	};
};
