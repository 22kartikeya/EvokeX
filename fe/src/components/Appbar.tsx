import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXing } from "@fortawesome/free-brands-svg-icons";
import { Button } from "../ui/Button"
import { Github, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect} from "react";
import axios from "axios";

export const AppBar: React.FC = () => {
  const [githubid, setGithubid]= useState<string | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const init = async () => {
        const res = await axios.get("http://localhost:3000/auth/github", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
        if(res.username){
            setGithubid(res.username);
        }
    };
    console.log("token - " + localStorage.getItem("token"));
    init();
  }, []);

  function loginHandler(){
    console.log(githubid);
  }

  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

      if(githubid == undefined){
        return (
          <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-2 backdrop-blur-md bg-background/50 border-b border-white/10 z-50">
            <div className="flex items-center ml-4 space-x-4">
            <FontAwesomeIcon icon={faXing} className="w-8 h-7" />
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-type-slide-in">
              EvokeX
            </Link>
            </div>
            <div className="flex items-center gap-4 mr-4">
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
            >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Button variant="ghost" size="sm" className="text-sm" 
          onClick={loginHandler}>
            <Github className="w-4 h-4 mr-2" />
            Sign in with GitHub
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity mr-3"
            onClick={loginHandler}
          >
            Get Started
          </Button>
          </div>
          </div>
      </header>
      )
    }else{
      return (
        <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-2 backdrop-blur-md bg-background/50 border-b border-white/10 z-50">
      <div className="flex items-center ml-4 space-x-4">
        <FontAwesomeIcon icon={faXing} className="w-8 h-7" />
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-type-slide-in">
          EvokeX
        </Link>
      </div>



      <div className="flex items-center gap-4 mr-4">
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0">
          <button 
            type="button" 
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={toggleDropdown}
          >
            <span className="sr-only">Open user menu</span>
            <img className="w-6 h-6 rounded-full" src="https://avatars.githubusercontent.com/u/113494938?v=4" alt="user photo"/>
          </button>
          <div className={`z-50 ${dropdownOpen ? "" : "hidden"} text-base list-none bg-blue-950 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600 `} >
            <div className="px-4 py-3">
              <span className="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
              <span className="block text-sm text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
            </div>
            <ul className="py-2">
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Dashboard</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Settings</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Earnings</a></li>
              <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
      )
    }
      

}