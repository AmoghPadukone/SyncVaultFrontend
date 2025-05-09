import React from "react";
import { Link, useLocation } from "wouter";
import { BellIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "@/components/search/SearchBar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

interface TopBarProps {
  currentPath?: string;
}

const TopBar: React.FC<TopBarProps> = ({ currentPath = "" }) => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Generate avatar initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format the path for breadcrumbs
  const formatPath = (path: string) => {
    switch(path) {
      case '/':
      case '/my-drive':
        return 'My Drive';
      case '/shared':
        return 'Shared';
      case '/cloud':
        return 'Cloud';
      case '/settings':
        return 'Settings';
      case '/search':
        return 'Search Results';
      default:
        if (path.startsWith('/folder/')) {
          return 'Folder'; // In a real app, you'd fetch the folder name
        }
        return path.replace('/', '').split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  // Parse path for breadcrumbs
  const pathParts = location.split('/').filter(Boolean);
  
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex-1 flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {pathParts.length === 0 ? (
                <li>
                  <span className="text-gray-700 dark:text-gray-300">My Drive</span>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/my-drive">
                      <a className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        My Drive
                      </a>
                    </Link>
                  </li>
                  {pathParts.map((part, index) => (
                    <li key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {index === pathParts.length - 1 ? (
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {formatPath(`/${part}`)}
                        </span>
                      ) : (
                        <Link href={`/${pathParts.slice(0, index + 1).join('/')}`}>
                          <a className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            {formatPath(`/${part}`)}
                          </a>
                        </Link>
                      )}
                    </li>
                  ))}
                </>
              )}
            </ol>
          </nav>
        </div>
        
        <SearchBar />
        
        <div className="flex items-center">
          <button className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-400">
            <BellIcon className="h-6 w-6" />
          </button>
          <Avatar className="ml-4">
            <AvatarImage src="" />
            <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
