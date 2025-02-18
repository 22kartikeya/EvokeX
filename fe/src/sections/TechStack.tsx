import { motion } from "framer-motion";

export const TechStack: React.FC = () => {

    const technologies = [
        {
            name: "Next.js",
            icon: "/nextjs-icon.svg",
        },
        {
            name: "React",
            icon: "/react-icon.svg",
        },
        {
            name: "Node.js",
            icon: "/nodejs-icon.svg",
        },
        {
            name: "TypeScript",
            icon: "/typescript-icon.svg",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-24 w-full"
          >
            <p className="text-sm text-white/40 mb-8">or start a blank app with your favorite stack</p>
            <div className="flex justify-center items-center gap-16 flex-wrap max-w-2xl mx-auto">
              {technologies.map((tech) => (
                <div key={tech.name} className="group relative flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      width={32}
                      height={32}
                      className="opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs text-white/60 whitespace-nowrap">
                    {tech.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
    )
}