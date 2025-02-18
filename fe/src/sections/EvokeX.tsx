import { Sparkles, Globe, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export const EvokeX : React.FC = () => {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-32 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-gradient">About EvokeX</h2>
            <p className="text-lg text-white/60 mb-8">
              EvokeX is the ultimate AI-driven platform that redefines web development—effortlessly design, build, and deploy high-performance applications in minutes. Supercharge your workflow, scale with ease, and bring your ideas to life at lightning speed!
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "Web Apps",
                  description: "Build responsive and modern web applications",
                },
                {
                  icon: <Terminal className="w-6 h-6" />,
                  title: "Full Stack",
                  description: "Generate both frontend and backend code",
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  title: "AI Powered",
                  description: "Leverage AI to accelerate development",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
    )
}