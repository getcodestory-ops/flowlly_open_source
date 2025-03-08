import { Modal } from "react-bootstrap";

import { useStore } from "@/utils/store";
//
import { TeamDetail } from "./TeamDetail";

interface MembersModalProps {
  onCancel: () => void;
  isOpen: boolean;
  projectAccessId?: string;
}

export function MembersModal({
	onCancel,
	isOpen,
	projectAccessId,
}: MembersModalProps) {
	const { members } = useStore((state) => ({
		members: state.members,
	}));
	return (
		<Modal
			backdrop
			centered
			onHide={onCancel}
			show={isOpen}
		>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<TeamDetail
					members={members}
					onCancel={onCancel}
					projectAccessId={projectAccessId}
				/>
			</div>
		</Modal>
	);
}
