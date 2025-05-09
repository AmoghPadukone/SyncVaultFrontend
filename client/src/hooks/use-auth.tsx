import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginCredentials } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authApi, SignupData } from "@/api/auth";
import { useRecoilState } from "recoil";
import { authAtom } from "@/store/auth-atom";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, SignupData>;
  updateProfileMutation: UseMutationResult<User, Error, Partial<User>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authState, setAuthState] = useRecoilState(authAtom);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        return await authApi.getProfile();
      } catch (error) {
        // Return undefined instead of throwing for 401
        if ((error as any).status === 401) {
          return undefined;
        }
        throw error;
      }
    },
    retry: false,
  });

  // Update Recoil state when user data changes
  useEffect(() => {
    if (user) {
      setAuthState({ user });
    } else if (!isLoading) {
      setAuthState({ user: null });
    }
  }, [user, isLoading, setAuthState]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      setAuthState({ user });
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      setAuthState({ user });
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setAuthState({ user: null });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      setAuthState({ user });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
