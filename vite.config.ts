import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@/components/ui": path.resolve(__dirname, "./src/components/ui"),
      "@/components/management": path.resolve(__dirname, "./src/components/school-dashboard/management"),
      "@/components/chat": path.resolve(__dirname, "./src/components/student-dashboard/chat"),
      "@/components/personalized": path.resolve(__dirname, "./src/components/student-dashboard/personalized"),
      "@/components/games": path.resolve(__dirname, "./src/components/student-dashboard/cognitive-games"),
      "@/components/mood": path.resolve(__dirname, "./src/components/student-dashboard/mood"),
      "@/components/journal": path.resolve(__dirname, "./src/components/student-dashboard/journal"),
      "@/components/goals": path.resolve(__dirname, "./src/components/student-dashboard/goals"),
      "@/components/gamification": path.resolve(__dirname, "./src/components/student-dashboard/cognitive-games/gamification-badges"),
      "@/components/progress": path.resolve(__dirname, "./src/components/school-dashboard/progress"),
      "@/components/shared": path.resolve(__dirname, "./src/components/shared"),
      "@/components/Footer": path.resolve(__dirname, "./src/components/shared/Footer"),
      "@/services/schoolDataService": path.resolve(__dirname, "./src/services/schoolDataService"),
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
