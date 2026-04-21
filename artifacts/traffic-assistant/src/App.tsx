import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Crowdsourcing from "@/pages/crowdsourcing";
import SignReports from "@/pages/sign-reports";
import Rules from "@/pages/rules";
import Admins from "@/pages/admins";
import Users from "@/pages/users";
import Models from "@/pages/models";
import Evidence from "@/pages/evidence";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/crowdsourcing" component={Crowdsourcing} />
        <Route path="/sign-reports" component={SignReports} />
        <Route path="/rules" component={Rules} />
        <Route path="/admins" component={Admins} />
        <Route path="/users" component={Users} />
        <Route path="/models" component={Models} />
        <Route path="/evidence" component={Evidence} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
