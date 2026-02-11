"use client";

import { useState, useEffect } from "react";
import {
	NEW_USER_TIPS_MESSAGE_ID,
	shouldShowTips,
	markMessageAsDismissed,
} from "@/utils/newUserTips";

export function useNewUserTips() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		setShow(shouldShowTips(NEW_USER_TIPS_MESSAGE_ID));
	}, []);

	const dismiss = () => {
		markMessageAsDismissed(NEW_USER_TIPS_MESSAGE_ID);
		setShow(false);
	};

	return { show, dismiss };
}
