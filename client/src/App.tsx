import { Route, Switch } from "wouter";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/dashboard";
import ChatMonitor from "@/pages/chat-monitor";
import Analytics from "@/pages/analytics";
import StoredData from "@/pages/stored-data";
import UserAnalysis from "@/pages/user-analysis";
import SearchExport from "@/pages/search-export";
import ApiSettings from "@/pages/api-settings";
import Moderation from "@/pages/moderation";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/chat-monitor" component={ChatMonitor} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/stored-data" component={StoredData} />
        <Route path="/user-analysis" component={UserAnalysis} />
        <Route path="/search-export" component={SearchExport} />
        <Route path="/api-settings" component={ApiSettings} />
        <Route path="/moderation" component={Moderation} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
