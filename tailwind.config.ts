import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: "2rem",
    		screens: {
    			"2xl": "1400px",
    		},
    	},
    	extend: {
    		colors: {
    			border: "hsl(var(--border))",
    			input: "hsl(var(--input))",
    			ring: "hsl(var(--ring))",
    			background: "hsl(var(--background))",
    			foreground: "hsl(var(--foreground))",
    			primary: {
    				DEFAULT: "hsl(var(--primary))",
    				foreground: "hsl(var(--primary-foreground))",
    			},
    			secondary: {
    				DEFAULT: "hsl(var(--secondary))",
    				foreground: "hsl(var(--secondary-foreground))",
    			},
    			destructive: {
    				DEFAULT: "hsl(var(--destructive))",
    				foreground: "hsl(var(--destructive-foreground))",
    			},
    			muted: {
    				DEFAULT: "hsl(var(--muted))",
    				foreground: "hsl(var(--muted-foreground))",
    			},
    			accent: {
    				DEFAULT: "hsl(var(--accent))",
    				foreground: "hsl(var(--accent-foreground))",
    			},
    			popover: {
    				DEFAULT: "hsl(var(--popover))",
    				foreground: "hsl(var(--popover-foreground))",
    			},
    			card: {
    				DEFAULT: "hsl(var(--card))",
    				foreground: "hsl(var(--card-foreground))",
    			},
    			sidebar: {
    				DEFAULT: "hsl(var(--sidebar-background))",
    				foreground: "hsl(var(--sidebar-foreground))",
    				primary: "hsl(var(--sidebar-primary))",
    				"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    				accent: "hsl(var(--sidebar-accent))",
    				"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    				border: "hsl(var(--sidebar-border))",
    				ring: "hsl(var(--sidebar-ring))",
    			},
    		},
    		borderRadius: {
    			lg: "var(--radius)",
    			md: "calc(var(--radius) - 2px)",
    			sm: "calc(var(--radius) - 4px)",
    		},
    		keyframes: {
    			"accordion-down": {
    				from: {
    					height: "0",
    				},
    				to: {
    					height: "var(--radix-accordion-content-height)",
    				},
    			},
    			"accordion-up": {
    				from: {
    					height: "var(--radix-accordion-content-height)",
    				},
    				to: {
    					height: "0",
    				},
    			},
    		},
    		animation: {
    			"accordion-down": "accordion-down 0.2s ease-out",
    			"accordion-up": "accordion-up 0.2s ease-out",
    		},
    		typography: {
    			DEFAULT: {
    				css: {
    					color: "#333",
    					a: {
    						color: "#3182ce",
    						"&:hover": {
    							color: "#2c5282",
    						},
    					},
    					h1: {
    						color: "#1a202c",
    						fontWeight: "700",
    						fontSize: "1.75rem",
    						lineHeight: "1.2",
    						marginTop: "1.25rem",
    						marginBottom: "0.75rem",
    					},
    					h2: {
    						color: "#2d3748",
    						fontWeight: "600",
    						fontSize: "1.5rem",
    						lineHeight: "1.3",
    						marginTop: "1rem",
    						marginBottom: "0.5rem",
    					},
    					h3: {
    						color: "#4a5568",
    						fontWeight: "600",
    						fontSize: "1.25rem",
    						lineHeight: "1.4",
    						marginTop: "0.75rem",
    						marginBottom: "0.5rem",
    					},
    					h4: {
    						color: "#4a5568",
    						fontWeight: "600",
    						fontSize: "1.125rem",
    						lineHeight: "1.5",
    						marginTop: "0.75rem",
    						marginBottom: "0.5rem",
    					},
    					h5: {
    						color: "#4a5568",
    						fontWeight: "600",
    						fontSize: "1rem",
    						lineHeight: "1.5",
    						marginTop: "0.625rem",
    						marginBottom: "0.375rem",
    					},
    					h6: {
    						color: "#4a5568",
    						fontWeight: "600",
    						fontSize: "0.875rem",
    						lineHeight: "1.5",
    						marginTop: "0.625rem",
    						marginBottom: "0.375rem",
    					},
    					p: {
    						fontSize: "1rem",
    						lineHeight: "1.625",
    						marginTop: "0.75rem",
    						marginBottom: "0.75rem",
    					},
    					ul: {
    						marginTop: "0.5rem",
    						marginBottom: "0.5rem",
    					},
    					ol: {
    						marginTop: "0.5rem",
    						marginBottom: "0.5rem",
    					},
    					li: {
    						fontSize: "1rem",
    						lineHeight: "1.625",
    						marginTop: "0.25rem",
    						marginBottom: "0.25rem",
    					},
    					blockquote: {
    						fontStyle: "italic",
    						color: "#718096",
    						borderLeftWidth: "4px",
    						borderLeftColor: "#e2e8f0",
    						paddingLeft: "1rem",
    					},
    					code: {
    						color: "#805ad5",
    						fontWeight: "600",
    					},
    					pre: {
    						backgroundColor: "#f7fafc",
    						padding: "1rem",
    						borderRadius: "0.375rem",
    					},
    					strong: {
    						color: "#2d3748",
    						fontWeight: "700",
    					},
    					img: {
    						marginTop: "1rem",
    						marginBottom: "1rem",
    						borderRadius: "0.375rem",
    					},
    					hr: {
    						borderColor: "#e2e8f0",
    						marginTop: "2rem",
    						marginBottom: "2rem",
    					},
    				},
    			},
    		},
    		fontFamily: {
    			sans: [
    				"Arial",
    				"sans-serif",
    			],
    			serif: [
    				"Georgia",
    				"serif",
    			],
    		},
    	},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
