import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Leaf, Users, TrendingDown } from "lucide-react";
import heroEarth from "@/assets/hero-earth.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-earth">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroEarth} 
          alt="Earth from space showing environmental monitoring" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="mb-8 animate-float">
          <img 
            src="/ecoguide.jpg" 
            alt="EcoGuide AI Logo" 
            className="w-20 h-20 mx-auto mb-6 drop-shadow-lg rounded-full object-cover border-4 border-primary-glow/30"
          />
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl">
          EcoGuide AI
        </h1>
        
        <p className="text-xl lg:text-2xl text-white/90 mb-4 max-w-4xl mx-auto drop-shadow-lg">
          Your Climate Action Co-Pilot
        </p>
        
        <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto drop-shadow-md">
          Monitor environmental changes through satellite data and track your personal carbon footprint. 
          Turn climate awareness into meaningful action with AI-powered insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary-glow shadow-glow animate-pulse-glow px-8 py-6 text-lg font-semibold"
          >
            Explore Map View
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 backdrop-blur-sm px-8 py-6 text-lg font-semibold"
          >
            Track My Impact
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <Globe className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-xl font-semibold mb-2">Global Monitoring</h3>
            <p className="text-white/80">Satellite data shows forest changes, water stress, and land use in simple terms</p>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-semibold mb-2">Personal Coach</h3>
            <p className="text-white/80">Track carbon footprint and get local tips to reduce environmental impact</p>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary-glow" />
            <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
            <p className="text-white/80">See how your actions connect to global trends and inspire others</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;