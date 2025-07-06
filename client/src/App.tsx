import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import ProgressBar from "@/components/progress-bar";
import Home from "@/pages/home";
import RoleSuggestions from "@/pages/role-suggestions";
import Optimize from "@/pages/optimize";
import Preview from "@/pages/preview";
import Checkout from "@/pages/checkout";
import Download from "@/pages/download";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";

function getStepFromPath(path: string): number {
  switch (path) {
    case '/': return 0;
    case '/role-suggestions': return 1;
    case '/optimize': return 2;
    case '/preview':
    case '/checkout': return 3;
    case '/download': return 4;
    default: return 0;
  }
}

function Router() {
  const [location] = useLocation();
  const currentStep = getStepFromPath(location);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      {location !== '/' && <ProgressBar currentStep={currentStep} />}
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/role-suggestions" component={RoleSuggestions} />
        <Route path="/optimize" component={Optimize} />
        <Route path="/preview" component={Preview} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/download" component={Download} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-file-alt text-primary text-xl mr-2"></i>
                <span className="font-bold text-neutral-800">ResumeOptimizer Pro</span>
              </div>
              <p className="text-sm text-neutral-600">AI-powered resume optimization to help you land your dream job.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-3">Product</h4>
              <ul className="text-sm text-neutral-600 space-y-2">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Templates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-3">Support</h4>
              <ul className="text-sm text-neutral-600 space-y-2">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-3">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary">
                  <i className="fab fa-facebook"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-6 text-center">
            <p className="text-sm text-neutral-500">© 2024 ResumeOptimizer Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
