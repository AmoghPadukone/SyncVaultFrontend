import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import { useToast } from "@/hooks/use-toast";
import ProviderConnectionModal from "@/components/providers/ProviderConnectionModal";
import ProviderIcon from "@/components/common/ProviderIcon";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  providers: z.array(z.number()).optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for provider modal
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Get supported cloud providers
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: providersApi.getSupportedProviders,
  });
  
  // Connect provider mutation
  const connectProviderMutation = useMutation({
    mutationFn: ({ providerId, connectionInfo }: { providerId: number, connectionInfo: any }) => 
      providersApi.connectProvider(providerId, connectionInfo),
    onSuccess: () => {
      toast({
        title: "Cloud provider connected successfully",
        description: "Your cloud storage has been connected to SyncVault",
      });
      // Close the modal and redirect to dashboard on successful connection
      setIsProviderModalOpen(false);
      if (newUserData) {
        // If we have pending user data, register the user now
        registerMutation.mutate(newUserData);
        setNewUserData(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to connect cloud provider",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      providers: [],
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onSignupSubmit = (data: SignupFormValues) => {
    const { confirmPassword, terms, ...signupData } = data;
    
    // If providers are selected, show provider form for first provider
    if (signupData.providers && signupData.providers.length > 0) {
      // Store user data for later registration
      setNewUserData(signupData);
      // Show modal for first provider
      setSelectedProvider(signupData.providers[0]);
      setIsProviderModalOpen(true);
    } else {
      // No providers selected, proceed with registration
      registerMutation.mutate(signupData);
    }
  };
  
  // Handle cloud provider details submission
  const handleProviderSubmit = (providerId: number, providerData: any) => {
    connectProviderMutation.mutate({
      providerId,
      connectionInfo: {
        accessKey: providerData.accessKey,
        metadata: {
          bucketName: providerData.bucketName
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">SyncVault</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Your unified cloud storage solution
          </p>
        </div>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="remember"
                              />
                            </FormControl>
                            <label
                              htmlFor="remember"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Remember me
                            </label>
                          </FormItem>
                        )}
                      />
                      <a href="#" className="text-sm text-primary hover:text-primary/90">
                        Forgot password?
                      </a>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Sign in
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up for a new SyncVault account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
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
                      control={signupForm.control}
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
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Connect cloud storage providers</h3>
                      {providers.map((provider) => (
                        <FormField
                          key={provider.id}
                          control={signupForm.control}
                          name="providers"
                          render={({ field }) => {
                            const isSelected = field.value?.includes(provider.id);
                            return (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), provider.id]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((value) => value !== provider.id) || []
                                        );
                                      }
                                    }}
                                    id={`provider-${provider.id}`}
                                  />
                                </FormControl>
                                <label
                                  htmlFor={`provider-${provider.id}`}
                                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  <ProviderIcon providerId={provider.id} size="small" className="mr-2" />
                                  {provider.name}
                                </label>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    
                    <FormField
                      control={signupForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="terms"
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="terms"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              I accept the{" "}
                              <a href="#" className="text-primary hover:text-primary/90">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="#" className="text-primary hover:text-primary/90">
                                Privacy Policy
                              </a>
                            </label>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Create account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cloud Provider Connection Modal */}
      {selectedProvider !== null && (
        <ProviderConnectionModal
          isOpen={isProviderModalOpen}
          onClose={() => setIsProviderModalOpen(false)}
          provider={providers.find(p => p.id === selectedProvider) || providers[0]}
          onConnect={(providerId, data) => {
            connectProviderMutation.mutate({
              providerId,
              connectionInfo: {
                accessToken: data.accessKey,
                refreshToken: data.secretKey,
                expiresAt: null,
                metadata: {
                  bucketName: data.bucketName,
                  region: data.region
                }
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default AuthPage;
