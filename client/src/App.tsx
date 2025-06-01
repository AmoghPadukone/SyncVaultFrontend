import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Favorites from "@/pages/favorites";
import LiveCloud from "@/pages/live-cloud";
import MyDrive from "@/pages/my-drive";
import NotFound from "@/pages/not-found";
import SearchResults from "@/pages/search-results";
import Settings from "@/pages/settings";
import Shared from "@/pages/shared";
import { QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { Route, Switch } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { queryClient } from "./lib/queryClient";

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
      <ProtectedRoute path="/favorites" component={Favorites} />
      <ProtectedRoute path="/cloud" component={Settings} />
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
