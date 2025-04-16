export const basePrompt = `<boltArtifact id="project-import" title="Project Files">
<boltAction type="file" filePath="pages/index.tsx">export default function Home() {\n  return (\n    <div className="flex items-center justify-center min-h-screen">\n      <p>Welcome to Next.js 12 with TypeScript!</p>\n    </div>\n  );\n}\n</boltAction>
<boltAction type="file" filePath="pages/_app.tsx">import '../styles/globals.css';\nimport type { AppProps } from 'next/app';\n\nexport default function MyApp({ Component, pageProps }: AppProps) {\n  return <Component {...pageProps} />;\n}\n</boltAction>
<boltAction type="file" filePath="styles/globals.css">@tailwind base;\n@tailwind components;\n@tailwind utilities;\n</boltAction>
<boltAction type="file" filePath="components.json">[]</boltAction>
<boltAction type="file" filePath="hooks/index.ts">export {};</boltAction>
<boltAction type="file" filePath="lib/utils.ts">export function cn(...classes: string[]) {\n  return classes.filter(Boolean).join(" ");\n}\n</boltAction>
<boltAction type="file" filePath=".eslintrc.json">{
  "extends": "next/core-web-vitals"
}</boltAction>
<boltAction type="file" filePath=".gitignore">.next/\ndist/\nnode_modules/\n.env\n</boltAction>
<boltAction type="file" filePath="next-env.d.ts"></boltAction>
<boltAction type="file" filePath="next.config.js">/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  output: 'export',\n  eslint: {\n    ignoreDuringBuilds: true,\n  },  images: { unoptimized: true },\n};\nmodule.exports = nextConfig;\n</boltAction>
<boltAction type="file" filePath="package.json">{
  "name": "nextjs12-typescript-app",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "12.3.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}</boltAction>
<boltAction type="file" filePath="package-lock.json">{}</boltAction>
<boltAction type="file" filePath="postcss.config.js">module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};</boltAction>
<boltAction type="file" filePath="tailwind.config.ts">import type { Config } from 'tailwindcss';\n
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;\n</boltAction>
<boltAction type="file" filePath="tsconfig.json">{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}</boltAction>
</boltArtifact>`;