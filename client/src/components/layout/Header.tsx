import { useState } from "react";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Helper function to convert paths to page titles
  const getPageTitle = (path: string) => {
    switch(path) {
      case "/": return "Dashboard";
      case "/chat-monitor": return "Chat Monitor";
      case "/analytics": return "Analytics";
      case "/stored-data": return "Stored Data";
      case "/user-analysis": return "User Analysis";
      case "/search-export": return "Search & Export";
      case "/api-settings": return "API Settings";
      default: return "Page Not Found";
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium">{getPageTitle(location)}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
            <Input
              placeholder="Search..."
              className="pl-9 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
