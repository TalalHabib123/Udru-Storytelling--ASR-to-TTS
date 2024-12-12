/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    // require("flowbite/plugin")({
    //   charts: true,
    // }),
  ],
  daisyui: {
    themes: [
      {
        virtualectra: {
          primary: "#D0FAFE",
          secondary: "#F1E2F8",
          accent: "#3F83F8",
          neutral: "#333333", // dark gray
          "base-100": "#FFFFFF", // white
        },
      },
    ],
  },
};