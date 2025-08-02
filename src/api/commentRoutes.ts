import axios from "axios";
import { useStore } from "@/utils/store";

// Backend API interfaces matching the Pydantic models
export interface Comment {
  id: string;
  content: string;
  author?: string;
  created_at?: string; // ISO string format from backend
  data?: Record<string, any>;
}

export interface Thread {
  id: string;
  comments: Comment[];
  resolved_at?: string; // ISO string format from backend  
  created_at: string; // ISO string format from backend
  selected_text?: string;
  from_position?: number;
  to_position?: number;
}

// Request interfaces
export interface CreateThreadRequest {
  thread: Thread;
  resource_id: string;
}

export interface AddCommentRequest {
  resource_id: string;
  thread_id: string;
  comment: Comment;
}

export interface UpdateCommentRequest {
  resource_id: string;
  thread_id: string;
  comment_id: string;
  content?: string;
  resolved_at?: string;
}

export interface DeleteThreadRequest {
  resource_id: string;
  thread_id: string;
}

// API service functions
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export class CommentAPI {
	private static getHeaders() {
		// Get auth token from the store session
		const session = useStore.getState().session;
		const token = session?.access_token;
		return {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		};
	}

	/**
   * Get all comment threads for a document resource
   */
	static async getDocumentThreads(
		projectAccessId: string,
		resourceId: string,
	): Promise<Thread[]> {
		try {
			const response = await axios.get(
				`${BASE_URL}/storage/threads/${projectAccessId}/${resourceId}`,
				{ headers: this.getHeaders() },
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching document threads:", error);
			throw error;
		}
	}

	/**
   * Create a new comment thread for a document resource
   */
	static async createDocumentThread(
		projectAccessId: string,
		request: CreateThreadRequest,
	): Promise<any> {
		try {
			const response = await axios.post(
				`${BASE_URL}/storage/thread/${projectAccessId}`,
				request,
				{ headers: this.getHeaders() },
			);
			return response.data;
		} catch (error) {
			console.error("Error creating document thread:", error);
			throw error;
		}
	}

	/**
   * Add a comment to an existing thread
   */
	static async addCommentToThread(
		projectAccessId: string,
		request: AddCommentRequest,
	): Promise<any> {
		try {
			const response = await axios.post(
				`${BASE_URL}/storage/thread/comment/${projectAccessId}`,
				request,
				{ headers: this.getHeaders() },
			);
			return response.data;
		} catch (error) {
			console.error("Error adding comment to thread:", error);
			throw error;
		}
	}

	/**
   * Update a comment in a thread (including resolving the thread)
   */
	static async updateDocumentComment(
		projectAccessId: string,
		request: UpdateCommentRequest,
	): Promise<any> {
		try {
			const response = await axios.put(
				`${BASE_URL}/storage/thread/comment/${projectAccessId}`,
				request,
				{ headers: this.getHeaders() },
			);
			return response.data;
		} catch (error) {
			console.error("Error updating document comment:", error);
			throw error;
		}
	}

	/**
   * Delete a thread from a document resource
   */
	static async deleteDocumentThread(
		projectAccessId: string,
		request: DeleteThreadRequest,
	): Promise<any> {
		try {
			const response = await axios.delete(
				`${BASE_URL}/storage/thread/${projectAccessId}`,
				{ 
					headers: this.getHeaders(),
					data: request,
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting document thread:", error);
			throw error;
		}
	}
}

// Utility functions to convert between frontend and backend formats
export const convertBackendThreadToFrontend = (backendThread: Thread): Thread => {
	return {
		...backendThread,
		created_at: backendThread.created_at,
		resolved_at: backendThread.resolved_at,
		comments: backendThread.comments.map((comment) => ({
			...comment,
			created_at: comment.created_at,
		})),
	};
};

export const convertFrontendThreadToBackend = (frontendThread: Thread): Thread => {
	return {
		...frontendThread,
		created_at: frontendThread.created_at,
		resolved_at: frontendThread.resolved_at,
		comments: frontendThread.comments.map((comment) => ({
			...comment,
			created_at: comment.created_at,
		})),
	};
}; 