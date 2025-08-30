import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn, Lock, Shield, Target } from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import PersonalTracker from "./PersonalTracker";

const ProtectedPersonalTracker = () => {
  const { isAuthenticated } = useUserAuth();

  if (isAuthenticated) {
    // Show the actual PersonalTracker component for authenticated users
    return <PersonalTracker />;
  }

  // Show login prompt for non-authenticated users
  return (
    <section className="py-20 px-6 bg-background" id="tracker">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-forest rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Personal Carbon Tracking
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your personal carbon footprint and get AI-powered recommendations to reduce your environmental impact
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Login Required Message */}
          <Card className="p-8 text-center border-2 border-dashed border-muted">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Sign In Required
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Personal carbon tracking is available exclusively to registered users. 
              Create your free account to start tracking your environmental impact and 
              receive personalized AI recommendations.
            </p>
            
            <div className="space-y-4">
              <Button asChild className="w-full bg-gradient-forest text-white">
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign Up / Sign In
                </Link>
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Join thousands of users reducing their carbon footprint
              </p>
            </div>
          </Card>

          {/* Features Preview */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              What You'll Get Access To:
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <Target className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Personal Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your daily activities and monitor your carbon footprint over time
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 text-primary mt-1">🧠</div>
                <div>
                  <h4 className="font-semibold text-foreground">AI Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized suggestions powered by Inflection AI to reduce your impact
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 text-primary mt-1">📊</div>
                <div>
                  <h4 className="font-semibold text-foreground">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Set goals, track achievements, and see your environmental impact over time
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 text-primary mt-1">🌍</div>
                <div>
                  <h4 className="font-semibold text-foreground">Community Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare your progress with the community and discover new eco-friendly practices
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  Get Started for Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtectedPersonalTracker;
