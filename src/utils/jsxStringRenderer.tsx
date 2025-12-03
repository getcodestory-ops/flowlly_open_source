import React, { useState, useEffect } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample chart config
const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
};


const componentMap: Record<string, any> = {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
  ChartContainer,
  AreaChart,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ChartTooltip,
  ChartTooltipContent,
  TrendingUp,
  Area,
  React,
};



// A component that directly renders trusted JSX strings using react-jsx-parser
const TrustedJsxRenderer: React.FC<{ jsxString: string }> = ({ jsxString }) => {
  const [error, setError] = useState<string | null>(null);
  const [JsxParser, setJsxParser] = useState<any | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only import and use JsxParser on the client side
  useEffect(() => {
    setIsClient(true);
    import("react-jsx-parser").then((module) => {
      setJsxParser(() => module.default);
    }).catch((err) => {
      console.error("Failed to load JSX Parser:", err);
      setError("Failed to load JSX Parser");
    });
  }, []);

  // Create a components object for JsxParser
  const components = Object.entries(componentMap).reduce((acc, [name, component]) => {
    acc[name] = component;
    return acc;
  }, {} as Record<string, any>);

  // Show loading state or error if not ready
  if (!isClient || !JsxParser) {
    return <div>Loading component...</div>;
  }

  // If there's an error, show the error message
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to render component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">Error rendering component:</p>
            <pre className="mt-2 text-sm overflow-auto">{error}</pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    return (
      <JsxParser
        allowUnknownElements={false}
        bindings={{
          chartConfig,
        }}
        components={components}
        jsx={jsxString}
        onError={(err: Error) => {
          console.error("JSX Parser error:", err);
          setError(err.message);
        }}
        renderInWrapper={false}
      />
    );
  } catch (err) {
    console.error("Failed to render JSX string:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    setError(errorMessage);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to render component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">Error rendering component:</p>
            <pre className="mt-2 text-sm overflow-auto">{errorMessage}</pre>
          </div>
        </CardContent>
      </Card>
    );
  }
};

// Function to render a JSX string as a React component
export const renderJsxString = (jsxString: string, chartId: number): React.ReactNode => {
  // Clean up the JSX string if needed
  const cleanedJsxString = jsxString.trim();

  // If the string is empty or invalid, return a fallback component
  if (!cleanedJsxString) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chart {chartId}</CardTitle>
          <CardDescription>No chart data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            Please provide valid JSX for the chart
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use the JSX Parser for trusted sources
  return <TrustedJsxRenderer jsxString={cleanedJsxString} />;
};



export default renderJsxString; 
