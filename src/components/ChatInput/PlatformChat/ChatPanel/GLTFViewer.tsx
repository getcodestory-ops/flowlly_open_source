"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { Loader2, Box } from "lucide-react";

// Types for the lazily-loaded Three.js modules
interface ThreeModules {
	Canvas: React.ComponentType<any>;
	OrbitControls: React.ComponentType<any>;
	Stage: React.ComponentType<any>;
	Center: React.ComponentType<any>;
	useGLTF: (url: string) => any;
}

interface GLTFViewerProps {
	url: string;
	fileName?: string;
}

/**
 * Build a same-origin URL for Three.js to load the model.
 * - Blob URLs (from sandbox binary fetch) are already same-origin, use directly.
 * - GCS signed URLs need to be proxied through /api/proxy-model to avoid CORS.
 */
const getModelUrl = (url: string): string => {
	if (url.startsWith("blob:")) {
		return url;
	}
	return `/api/proxy-model?url=${encodeURIComponent(url)}`;
};

// Inner scene component that renders the 3D model
// This is separated so useGLTF (a React hook) can be called inside the Canvas context
const ModelScene: React.FC<{
	url: string;
	modules: ThreeModules;
}> = ({ url, modules }) => {
	const { OrbitControls, Stage, Center, useGLTF } = modules;
	const { scene } = useGLTF(url);

	return (
		<>
			<Stage
				adjustCamera={1.5}
				environment="city"
				intensity={0.5}
			>
				<Center>
					<primitive object={scene} />
				</Center>
			</Stage>
			<OrbitControls
				autoRotate={false}
				enableDamping
				enablePan
				enableZoom
				makeDefault
			/>
		</>
	);
};

// Error boundary for catching Three.js / model loading errors
class ModelErrorBoundary extends React.Component<
	{ children: React.ReactNode; fileName?: string },
	{ hasError: boolean; error: string | null }
> {
	constructor(props: { children: React.ReactNode; fileName?: string }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error: error.message };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="h-full w-full flex items-center justify-center">
					<div className="flex flex-col items-center gap-2 p-4 text-center">
						<Box className="h-12 w-12 text-gray-400" />
						<p className="text-sm text-gray-600">Failed to load 3D model</p>
						{this.state.error && (
							<p className="text-xs text-gray-400 max-w-xs">{this.state.error}</p>
						)}
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

const GLTFViewer: React.FC<GLTFViewerProps> = ({ url, fileName }) => {
	const [threeModules, setThreeModules] = useState<ThreeModules | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Proxy GCS URLs; use blob URLs directly
	const modelUrl = useMemo(() => getModelUrl(url), [url]);

	useEffect(() => {
		// Dynamically import Three.js modules on client side only
		const loadThree = async () => {
			try {
				const [fiber, drei] = await Promise.all([
					import("@react-three/fiber"),
					import("@react-three/drei"),
				]);
				setThreeModules({
					Canvas: fiber.Canvas,
					OrbitControls: drei.OrbitControls,
					Stage: drei.Stage,
					Center: drei.Center,
					useGLTF: drei.useGLTF,
				});
			} catch (error) {
				console.error("Failed to load Three.js modules:", error);
				setLoadError(
					error instanceof Error ? error.message : "Failed to load 3D viewer"
				);
			}
		};
		loadThree();
	}, []);

	if (loadError) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-2 p-4 text-center">
					<Box className="h-12 w-12 text-gray-400" />
					<p className="text-sm text-gray-600">Unable to load 3D viewer</p>
					<p className="text-xs text-gray-400">{loadError}</p>
				</div>
			</div>
		);
	}

	if (!threeModules) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
					<p className="text-sm text-gray-600">Loading 3D viewer...</p>
				</div>
			</div>
		);
	}

	const { Canvas } = threeModules;

	return (
		<div className="h-full w-full relative bg-gray-50 rounded-lg overflow-hidden">
			<ModelErrorBoundary fileName={fileName}>
				<Canvas
					camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 2, 5] }}
					className="h-full w-full"
					dpr={[1, 2]}
					shadows
				>
					<Suspense fallback={null}>
						<ModelScene modules={threeModules} url={modelUrl} />
					</Suspense>
				</Canvas>
			</ModelErrorBoundary>
			{/* File name label */}
			{fileName && (
				<div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
					{fileName}
				</div>
			)}
		</div>
	);
};

export default GLTFViewer;
