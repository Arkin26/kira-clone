import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mulish: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      colors: {
        kbg: "#020202",
        sage: "#B2C8BC",
        forest: "#84A794",
      },
    },
  },
  plugins: [],
};
export default config;
