import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXing } from "@fortawesome/free-brands-svg-icons";
import { Button } from "../ui/Button"
import { Github } from "lucide-react";

export const AppBar: React.FC = () => {
    return (
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-2 backdrop-blur-md bg-background/50 border-b border-white/10 z-50">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faXing} className="w-6 h-6" />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-type-slide-in">
            EvokeX
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-sm">
            <Github className="w-4 h-4 mr-2" />
            Sign in with GitHub
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity"
          >
            Get Started
          </Button>
        </div>
      </header>
    )
}