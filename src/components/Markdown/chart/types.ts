export interface ChartElement {
	label: string;
	group?: string;
	value: number;
}

export interface PieChartElement {
	label: string;
	angle: number;
	radius: number;
}

export interface LineChartElement {
	label: string;
	points: [number, number][]; // Array of [x, y] coordinates
}

export interface BaseChartProps {
	title: string;
	elements: ChartElement[];
	x_label?: string;
	y_label?: string;
	x_unit?: string | null;
	y_unit?: string | null;
}

export interface PieChartProps {
	title: string;
	elements: PieChartElement[];
	x_label?: string;
	y_label?: string;
}

export interface LineChartProps {
	title: string;
	elements: LineChartElement[];
	x_label?: string;
	y_label?: string;
	x_unit?: string | null;
	y_unit?: string | null;
	x_ticks?: number[];
	x_tick_labels?: string[];
	x_scale?: string;
	y_ticks?: number[];
	y_tick_labels?: string[];
	y_scale?: string;
}

export interface ChartData extends BaseChartProps {
	type: string;
}

export interface PieChartData {
	type: string;
	title: string;
	elements: PieChartElement[];
	x_label?: string;
	y_label?: string;
}

export interface LineChartData {
	type: string;
	title: string;
	elements: LineChartElement[];
	x_label?: string;
	y_label?: string;
	x_unit?: string | null;
	y_unit?: string | null;
	x_ticks?: number[];
	x_tick_labels?: string[];
	x_scale?: string;
	y_ticks?: number[];
	y_tick_labels?: string[];
	y_scale?: string;
}

export type ChartType = "bar" | "pie" | "line";

export interface ChartComponentProps {
	data: string;
} 