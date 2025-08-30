import { Globe, Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8" />
              <span className="text-2xl font-bold">EcoGuide AI</span>
            </div>
            <p className="text-primary-foreground/80 max-w-sm">
              Bridging environmental monitoring with personal climate action through AI-powered insights.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#map" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Map View</a></li>
              <li><a href="#tracker" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Personal Tracker</a></li>
              <li><a href="#community" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Community</a></li>
              <li><a href="#api" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">API Access</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About</a></li>
              <li><a href="#blog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Climate Blog</a></li>
              <li><a href="#research" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Research</a></li>
              <li><a href="#help" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span className="text-primary-foreground/80">hello@ecoguide.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span className="text-primary-foreground/80">Nairobi, Kenya</span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="mt-4 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 EcoGuide AI. Making climate action accessible and impactful.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;