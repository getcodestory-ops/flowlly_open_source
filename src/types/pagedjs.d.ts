declare module "pagedjs" {
	export class Previewer {
		preview(
			content: string | HTMLElement,
			stylesheets: string[],
			renderTo: HTMLElement
		): Promise<{
			total: number;
			performance: string;
		}>;
	}

	export class Chunker {
		flow(content: HTMLElement, renderTo: HTMLElement): Promise<void>;
	}

	export class Polisher {
		add(...args: unknown[]): Promise<void>;
	}

	export function initializeHandlers(chunker: Chunker, polisher: Polisher, caller: unknown): void;
	export function registerHandlers(...args: unknown[]): void;
}
