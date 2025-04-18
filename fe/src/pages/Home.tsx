import { useState } from 'react';
import { Sparkles, ChevronRight, X, Github } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useNavigate } from 'react-router-dom';
import { GradientOrbs } from '@/components/GradientOrbs';
import { QuickActions } from '@/sections/QuickActions';
import { Footer } from '@/components/Footer';
import { EvokeX } from '@/sections/EvokeX';
import { TechStack } from '@/sections/TechStack';


interface HomeProps {
  user: {
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
  } | null;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [showLoginOverlay, setShowLoginOverlay] = useState(false); // State to show overlay
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      if (prompt.trim()) {
        navigate('/builder', { state: { prompt } });
      }
    } else {
      setShowLoginOverlay(true); // Show overlay if not logged in
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      <GradientOrbs />

      {/* Main Content */}
      <main className="w-full px-4 pt-32 pb-16 flex flex-col items-center text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/5 rounded-full text-sm mb-8 border border-white/10 hover:border-white/20 transition-colors">
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            Build your next project with AI
            <ChevronRight className="w-4 h-4 ml-2 text-white/40" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent whitespace-nowrap animate-gradient">
            What do you want to build?
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-[600px] mx-auto">
            Transform Ideas into Web Wonders. AI-powered apps made easy.
            "The best way to predict the future is to create it – Abraham Lincoln"
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-3xl relative mx-auto"
          >
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Every great project starts with a single idea. What’s yours?"
                  className="w-full h-32 p-5 text-lg backdrop-blur-sm border-gray-700 shadow-xl focus:border-purple-500/70 focus:ring-purple-500/30 
                rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 absolute right-4 bottom-4"
                  disabled={!prompt.trim()}
                >
                  <ChevronRight className="w-4 h-4 text-white/95" />
                </Button>
              </div>
            </form>
          </motion.div>

          <QuickActions />
          <TechStack />
          <EvokeX />
        </motion.div>
      </main>

      <Footer />

      {/* Show the overlay when the user is not logged in */}
      {showLoginOverlay && !user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-none flex justify-center items-center z-50">
          <div className="relative bg-black p-8 rounded-xl w-full max-w-md">
            {/* Close button */}
            <button
              onClick={() => setShowLoginOverlay(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-center">Please sign in to continue</h2>
            <Button variant="ghost" size="sm" className="text-sm bg-black" onClick={() => navigate('/auth/github')}>
                <Github className="w-4 h-4 mr-2" />
                Sign in with GitHub
              </Button>
          </div>
        </div>
      )}
    </div>
  );
};