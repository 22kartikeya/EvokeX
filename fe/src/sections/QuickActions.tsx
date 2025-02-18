import { motion } from "framer-motion";
import { Button } from "../ui/Button"

export const QuickActions : React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {["Power Up with Express", "Start Your Digital Journal", "Craft the Perfect First Impression", "Build Your Dream Online Store"].map((text, i) => (
              <Button
                key={i}
                variant="outline"
                className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
              >
                {text}
              </Button>
            ))}
          </motion.div>
    )
}