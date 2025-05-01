import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Database,
  LayoutDashboard,
  MessageSquare,
  LineChart,
  Users,
  Search,
  Settings,
  LogOut,
  User,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const [location] = useLocation();

  const menuItems = [
    {
      group: "Main",
      items: [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard className="mr-3" /> },
        { name: "Chat Monitor", path: "/chat-monitor", icon: <MessageSquare className="mr-3" /> },
        { name: "Analytics", path: "/analytics", icon: <LineChart className="mr-3" /> }
      ]
    },
    {
      group: "Data Management",
      items: [
        { name: "Stored Data", path: "/stored-data", icon: <Database className="mr-3" /> },
        { name: "User Analysis", path: "/user-analysis", icon: <Users className="mr-3" /> },
        { name: "Search & Export", path: "/search-export", icon: <Search className="mr-3" /> },
        { name: "Moderation", path: "/moderation", icon: <ShieldAlert className="mr-3" /> }
      ]
    },
    {
      group: "Configuration",
      items: [
        { name: "API Settings", path: "/api-settings", icon: <Settings className="mr-3" /> }
      ]
    }
  ];

  return (
    <aside 
      className={cn(
        "bg-white shadow-md z-10 transition-all duration-300 ease-in-out flex flex-col h-screen",
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center text-white">
            <Database />
          </div>
          <h1 className="ml-3 font-semibold text-xl text-secondary">KickChat Analytics</h1>
        </div>
      </div>
      
      <nav className="p-4 flex-1 overflow-y-auto">
        {menuItems.map((group, index) => (
          <div key={index} className="mb-4">
            <p className="text-xs uppercase font-semibold text-neutral-300 mb-2">{group.group}</p>
            <ul>
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">
                  <Link 
                    href={item.path}
                    className={cn(
                      "flex items-center p-2 rounded-md", 
                      location === item.path 
                        ? "bg-primary bg-opacity-10 text-primary" 
                        : "hover:bg-neutral-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="mt-auto p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-secondary">
            <User size={18} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-neutral-300">admin@company.com</p>
          </div>
          <div className="ml-auto">
            <button className="text-secondary hover:text-primary">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
