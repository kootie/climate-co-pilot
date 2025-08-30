import { useEffect } from "react";
import SafeNavigation from "@/components/SafeNavigation";
import HeroSection from "@/components/HeroSection";
import MapView from "@/components/MapView";
// import ProtectedPersonalTracker from "@/components/ProtectedPersonalTracker";
import CommunityDashboard from "@/components/CommunityDashboard";
import Footer from "@/components/Footer";
import AppStatus from "@/components/AppStatus";
import SimpleDebug from "@/components/SimpleDebug";
// import AuthTest from "@/components/AuthTest";
// import DashboardDebug from "@/components/DashboardDebug";
// import QuickDashboardTest from "@/components/QuickDashboardTest";
import { handleHashOnLoad } from "@/utils/scrollToSection";

const Index = () => {
  useEffect(() => {
    // Handle hash links on page load
    handleHashOnLoad();
  }, []);

  return (
    <div className="min-h-screen">
      <SafeNavigation />
      <main>
        <HeroSection />
        <div id="map">
          <MapView />
        </div>
        <div id="tracker" className="py-16 bg-muted/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Personal Carbon Tracker</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Track your carbon footprint and get personalized insights
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800">
                Personal tracker temporarily disabled due to context provider issues.
                <br />
                <a href="/dashboard" className="underline font-semibold">Visit the Dashboard directly</a>
              </p>
            </div>
          </div>
        </div>
        <div id="community">
          <CommunityDashboard />
        </div>
      </main>
      
      {/* Temporary debug components - remove after setup */}
      <div className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <AppStatus />
        </div>
      </div>
      
      {/* Simple Debug Component */}
      <div className="py-8 bg-red-50">
        <div className="max-w-7xl mx-auto px-6">
          <SimpleDebug />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
