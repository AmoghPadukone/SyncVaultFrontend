import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecoilRoot } from "recoil";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import MyDrive from "@/pages/my-drive";
import Shared from "@/pages/shared";
import LiveCloud from "@/pages/live-cloud";
import SearchResults from "@/pages/search-results";
import Settings from "@/pages/settings";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/my-drive" component={MyDrive} />
      <ProtectedRoute path="/drive/folder/:folderId" component={MyDrive} />
      <ProtectedRoute path="/shared" component={Shared} />
      <ProtectedRoute path="/cloud" component={LiveCloud} />
      <ProtectedRoute path="/live-cloud" component={LiveCloud} />
      <ProtectedRoute path="/search" component={SearchResults} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
