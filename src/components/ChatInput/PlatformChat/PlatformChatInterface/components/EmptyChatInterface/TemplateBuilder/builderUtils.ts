import type { CoverElement } from "../CoverPageDesigner";
import { CLASSIC_A4_CSS, MODERN_A4_CSS, headerBase } from "./styles";
import type { MarginBoxConfig } from "./useTemplateBuilderState";

export function buildMarginBoxCSS(marginBoxes: Record<string, MarginBoxConfig>): string {
	const marginBoxCSS: string[] = [];
	Object.entries(marginBoxes).forEach(([boxName, config]) => {
		if (config.type === "none") return;
		let content = "";
		switch (config.type) {
			case "text":
				content = `"${config.content.replace(/"/g, "\\\"")}"`;
				break;
			case "page-counter":
				content = "counter(page)";
				break;
			case "page-counter-total": {
				let pageContent = config.content;
				pageContent = pageContent.replace(/\{page\}/g, "\" counter(page) \"");
				pageContent = pageContent.replace(/\{total\}/g, "\" counter(pages) \"");
				content = `"${pageContent}"`;
				break;
			}
			case "running-header":
				if (config.runningSelector) content = `string(${config.runningSelector})`;
				break;
			case "image":
				content = `url("${config.content}")`;
				break;
		}
		if (content) marginBoxCSS.push(`@${boxName} { content: ${content}; }`);
	});
	return marginBoxCSS.join("\n");
}

export function buildStyle(preset: "modern" | "classic", brand: string, text: string, headerBg: string, marginBoxes: Record<string, MarginBoxConfig>, headerLogoUrl: string, topLeftHeader: string): string {
	const base = preset === "modern" ? MODERN_A4_CSS : CLASSIC_A4_CSS;
	let topLeftContent = "";
	if (headerLogoUrl) topLeftContent = `url("${headerLogoUrl}")`;
	else if (topLeftHeader) topLeftContent = `"${topLeftHeader.replace(/"/g, "\\\"")}"`;
	const customVars = `
:root {
	--custom-brand: ${brand};
	--custom-text: ${text};
	--custom-header-bg: ${headerBg};
	--top-left-content: ${topLeftContent};
}`;
	const marginBoxCss = buildMarginBoxCSS(marginBoxes);
	const pageCSS = marginBoxCss ? `@page {\n${marginBoxCss}\n}` : "";
	return `${customVars}\n${base}\n${pageCSS}`.trim();
}

export function buildHeader(): string {
	return `${headerBase}`.trim();
}

export function buildCompleteTemplate(
	templateData: {
		stylePreset: "modern" | "classic";
		brandColor: string;
		textColor: string;
		headerBgColor: string;
		marginBoxes: any;
		includeCover: boolean;
		coverDesignMode: "simple" | "advanced";
		coverElements: CoverElement[];
		coverFields: {
			title: string;
			subtitle: string;
			logo: string;
			preparedFor: string;
			preparedBy: string;
			dateText: string;
			fallbackTitle: string;
		};
		editorHtml: string;
	},
): { style: string; headers: string; content: string } {
	// Build base style
	const baseStyle = buildStyle(
		templateData.stylePreset,
		templateData.brandColor,
		templateData.textColor,
		templateData.headerBgColor,
		templateData.marginBoxes,
		"",
		"",
	);

	// Build headers
	const headers = buildHeader();

	// Build cover
	const coverResult = buildCover(
		templateData.includeCover,
		templateData.coverDesignMode,
		templateData.coverElements,
		templateData.coverFields,
	);

	// Combine styles (base + cover-specific CSS)
	const style = coverResult.css ? `${baseStyle}\n${coverResult.css}` : baseStyle;

	// Build content
	const contentStart = templateData.includeCover ? "<div class=\"content-start\">" : "";
	const contentEnd = templateData.includeCover ? "</div>" : "";
	const content = `${coverResult.html}${contentStart}${templateData.editorHtml}${contentEnd}`;

	return { style, headers, content };
}

export function buildCover(includeCover: boolean, mode: "simple" | "advanced", elements: CoverElement[], fields: { title: string; subtitle: string; logo: string; preparedFor: string; preparedBy: string; dateText: string; fallbackTitle: string }): { html: string; css: string } {
	if (!includeCover) return { html: "", css: "" };
	// Use canvas elements if they exist (for both simple and advanced modes)
	if (elements.length > 0) {
		let css = "";
		const html = elements
			.sort((a, b) => a.zIndex - b.zIndex)
			.map((element, index) => {
				const className = `cover-element-${index}`;
				const baseStyle = [
					`left:${element.x}%`,
					`top:${element.y}%`,
					`width:${element.width}%`,
					`height:${element.height}%`,
					element.rotation ? `transform: rotate(${element.rotation}deg)` : "",
					`z-index:${element.zIndex}`,
					element.backgroundColor && element.backgroundColor !== "transparent" ? `background-color:${element.backgroundColor}` : "",
					element.borderWidth ? `border:${element.borderWidth}px solid ${element.borderColor || "#cccccc"}` : "",
					element.borderRadius ? `border-radius:${element.borderRadius}px` : "",
					element.opacity !== undefined && element.opacity !== 1 ? `opacity:${element.opacity}` : "",
				].filter(Boolean).join(";");
				
				if (element.type === "text") {
					const textStyle = [
						`font-size:${element.fontSize || 16}px`,
						`font-family:${element.fontFamily || "Arial, sans-serif"}`,
						`font-weight:${element.fontWeight || "normal"}`,
						`font-style:${element.fontStyle || "normal"}`,
						`text-decoration:${element.textDecoration || "none"}`,
						`text-align:${element.textAlign || "center"}`,
						`color:${element.color || "#000000"}`,
						`justify-content:${element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center"}`,
					].join(";");
					css += `.${className} { ${baseStyle};${textStyle} }\n`;
					return `<div class="cover-element cover-text ${className}">${element.text || ""}</div>`;
				}
				
				if ((element.type === "image" || element.type === "logo") && element.src) {
					const imageStyle = `object-fit:${element.objectFit || "contain"};`.replace(/\s+/g, " ").trim();
					css += `.${className} { ${baseStyle};${imageStyle} }\n`;
					return `<img class="cover-element cover-image ${className}" src="${element.src}" alt="${element.alt || ""}" />`;
				}
				
				return "";
			})
			.filter(Boolean)
			.join("");
		return { html: `<div class="cover" style="position: relative;">${html}</div>`, css };
	}
	
	// Fallback to simple template if no canvas elements exist
	const preparedForBlock = fields.preparedFor ? `<p><strong>Prepared for:</strong><br/>${fields.preparedFor}</p>` : "";
	const preparedByBlock = fields.preparedBy ? `<p style=\"margin-top:12pt\"><strong>Prepared by:</strong><br/>${fields.preparedBy}</p>` : "";
	const dateBlock = fields.dateText ? `<p style=\"font-size: 12pt; margin-top: 16pt\">${fields.dateText}</p>` : "";
	const logo = fields.logo ? `<img src=\"${fields.logo}\" alt=\"logo\" style=\"max-width:180px;height:auto;margin-bottom:10pt;\"/>` : "";
	const html = `
<div class=\"cover\">
	<div>
		${logo}
		<h1>${fields.title || fields.fallbackTitle || "Report"}</h1>
		${fields.subtitle ? `<h2 style=\"margin-top: 8pt; color: var(--muted);\">${fields.subtitle}</h2>` : ""}
		${dateBlock}
		<div style=\"margin-top: 24pt; text-align: left\">${preparedForBlock}${preparedByBlock}</div>
	</div>
</div>`;
	return { html, css: "" };
}


