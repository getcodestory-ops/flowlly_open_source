"use client";

import { useState, useEffect } from "react";
import {
	FOCUS_MODE_NUDGE_ID,
	shouldShowTips,
	markMessageAsDismissed,
} from "@/utils/newUserTips";

export function useFocusModeNudge() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		setShow(shouldShowTips(FOCUS_MODE_NUDGE_ID));
	}, []);

	const dismiss = () => {
		markMessageAsDismissed(FOCUS_MODE_NUDGE_ID);
		setShow(false);
	};

	return { show, dismiss };
}
