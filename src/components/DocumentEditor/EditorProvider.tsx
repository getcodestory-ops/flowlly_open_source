import { type Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";

interface EditorProviderProps {
    editor: Editor
}

const EditorProvider = ({ editor }: EditorProviderProps ) : React.ReactNode => {
	return (
		<div className="flex-grow bg-gray-50 overflow-auto rounded-b-lg border w-full" style={{ maxHeight: "calc(100% - 40px)" }}>
			<div className="px-10 py-6 w-[768px] mx-auto bg-white my-0 border-l border-r border-gray-200">
				<EditorContent
					className="
                            text-sm font-arial leading-normal
                            prose-hr:my-4
                            prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:ml-[-10px] prose-h1:mb-6
                            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:ml-[-8px] prose-h2:mb-5
                            prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:ml-[-6px] prose-h3:mb-4
                            prose-h4:text-lg prose-h4:font-bold prose-h4:mt-5 prose-h4:ml-[-4px] prose-h4:mb-3
                            prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-900 prose-li:text-sm prose-li:ml-5 prose-li:mb-2 prose-li:mt-4
                            prose-p:leading-normal prose-p:text-gray-900 
                            prose-strong:text-gray-900 prose-strong:font-semibold
                            prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:cursor-pointer prose-img:transition-all prose-img:duration-200 hover:prose-img:shadow-lg
                            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                            prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:p-2 prose-table:ml-4 prose-table:mb-8 prose-table:mt-4 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden
                            prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-gray-200 prose-th:font-bold prose-th:p-3 prose-th:text-gray-700
                            prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-td:text-gray-600 hover:prose-td:bg-gray-50 prose-td:transition-colors
                            [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-blue-500 [&_.ProseMirror-selectednode]:ring-opacity-50
                            [&_table]:border-separate [&_table]:border-spacing-0
                            [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-blue-500 [&_img.ProseMirror-selectednode]:ring-opacity-50
                            [&_img]:max-w-full [&_img]:height-auto [&_img]:display-block
                        "
					editor={editor}
				/>
			</div>
		</div>);
};

export default EditorProvider;
