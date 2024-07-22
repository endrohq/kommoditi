import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			backgroundColor: {
				primary: "#004560",
				secondary: "#287a93",
				third: "#91d3e2",
			},
			borderColor: {
				primary: "#004560",
				secondary: "#287a93",
				third: "#91d3e2",
			},
			colors: {
				primary: "#004560",
				secondary: "#287a93",
				third: "#91d3e2",
			},
		},
	},
	plugins: [],
};
export default config;
