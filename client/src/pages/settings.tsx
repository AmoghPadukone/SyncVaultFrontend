import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User, KeyRound, Bell, Moon, Sun, LogOut, Cloud, Database, HardDrive } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import ProviderList from "@/components/providers/ProviderList";

// Profile form schema
const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings: React.FC = () => {
  const { user, updateProfileMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      fullName: user?.fullName || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updateProfileMutation.mutate({
      password: data.newPassword,
    });
    
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/settings" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <KeyRound className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="providers" className="flex items-center">
                <Cloud className="h-4 w-4 mr-2" />
                Cloud Providers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how others see you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="flex items-center space-x-4 mb-6">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-lg">
                              {user?.fullName ? getInitials(user?.fullName) : user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Button variant="outline" size="sm">
                              Change Avatar
                            </Button>
                          </div>
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                                                
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your experience and interface settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dark Mode</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Switch between light and dark theme
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-5 w-5 text-gray-500" />
                          <Switch 
                            checked={theme === "dark"}
                            onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                          />
                          <Moon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Display File Size</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Show file size in the file browser
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Default View</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Choose default view for file browser
                          </div>
                        </div>
                        <div className="flex border rounded-md overflow-hidden">
                          <Button variant="ghost" size="sm" className="rounded-none border-r">
                            List
                          </Button>
                          <Button variant="default" size="sm" className="rounded-none">
                            Grid
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between pt-4 border-t">
                    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will need to login again to access your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleLogout}
                          >
                            {logoutMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                                                
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Update Password
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable 2FA</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Use an authenticator app to generate verification codes
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-secondary p-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p>Two-factor authentication is currently disabled.</p>
                        <p className="mt-2">
                          Enable 2FA to add an extra layer of security to your account. 
                          You will need to enter a verification code when you sign in.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="w-full">Set Up Two-Factor Authentication</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>File Shares</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            When someone shares a file with you
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Upload Completion</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            When your file uploads complete
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Cloud Sync Status</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Updates about cloud sync status
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">In-App Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>File Activity</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            When there's activity on your files
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>New Features</Label>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Updates about new features and improvements
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Notification Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;
