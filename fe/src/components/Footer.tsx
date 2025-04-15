import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export const Footer : React.FC = () => {
    return (
        <footer className="w-full bg-background/30 backdrop-blur-md border-t border-white/10">
            <div className="container ml-auto px-4 py-2 flex justify-end items-center space-x-4 text-sm text-white/40">
                <a
                href="https://github.com/22kartikeya/minor_project"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                >
                    <FontAwesomeIcon icon={faGithub} className='w-4 h-4 mt-1 hover:text-white transition-colors' />
                </a>
                <span className='text-2xl'>•</span>
                <a href="#" className="hover:text-white transition-colors">HelpCenter</a>
                <span className='text-2xl'>•</span>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <span className='text-2xl'>•</span>
                <div className="ml-auto">
                    <span>© 2025 </span>
                    <span className="font-medium text-white/60"> EvokeX </span>
                    <span>| All rights reserved.</span>
                </div>
            </div>
        </footer>
    )
}