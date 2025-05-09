import React from "react";
import { useLocation, Link } from "wouter";
import {
  FolderIcon,
  ShareIcon,
  CloudIcon,
  SettingsIcon,
  PlusIcon,
  HardDrive,
  Globe,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import ProviderIcon from "@/components/common/ProviderIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: userProviders = [] } = useQuery({
    queryKey: ["/api/providers/user-connected"],
    queryFn: providersApi.getUserConnectedProviders,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 z-10 w-64 bg-white shadow-lg transition-all duration-300 border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">SyncVault</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <Link href="/my-drive">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === "/my-drive" || location === "/" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <FolderIcon className="h-5 w-5 mr-3" />
              My Drive
            </a>
          </Link>
          
          <Link href="/shared">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === "/shared" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <ShareIcon className="h-5 w-5 mr-3" />
              Shared
            </a>
          </Link>
          
          <Link href="/live-cloud">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === "/live-cloud" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <Globe className="h-5 w-5 mr-3" />
              Live Cloud
            </a>
          </Link>
          
          <Link href="/cloud">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === "/cloud" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <CloudIcon className="h-5 w-5 mr-3" />
              Providers
            </a>
          </Link>
          
          <Link href="/settings">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location === "/settings" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <SettingsIcon className="h-5 w-5 mr-3" />
              Settings
            </a>
          </Link>
        </div>
        
        <div className="pt-6">
          <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Connected Providers</h2>
          <div className="mt-2 space-y-1">
            {userProviders.map((connection) => (
              <Link key={connection.id} href="/cloud">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <ProviderIcon providerId={connection.provider.id} size="small" className="mr-3" />
                  {connection.provider.name}
                </a>
              </Link>
            ))}
            
            <Link href="/cloud">
              <a className="flex items-center px-3 py-2 w-full text-sm font-medium rounded-md text-primary hover:bg-gray-100 dark:hover:bg-gray-800">
                <PlusIcon className="h-5 w-5 mr-3" />
                Add New
              </a>
            </Link>
          </div>
        </div>
        
        <div className="pt-6">
          <div className="px-3 py-2">
            <Progress value={68} className="h-2.5 w-full" />
            <p className="text-xs text-gray-600 mt-2 dark:text-gray-400">68% of 100GB used</p>
          </div>
        </div>
      </nav>
      
      <Separator />
      
      <div className="p-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src=""/>
            <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-500 truncate dark:text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
