import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { scrollToSection } from "@/utils/scrollToSection";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, signOut } = useUserAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we're not on the homepage, navigate to it first
    if (location.pathname !== '/') {
      window.location.href = `/${sectionId}`;
      return;
    }
    
    // If we're on the homepage, scroll to the section
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/ecoguide.jpg" 
              alt="EcoGuide AI Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-foreground">EcoGuide AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="/#map" 
              onClick={(e) => handleSectionClick('#map', e)}
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Map View
            </a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                My Dashboard
              </Link>
            ) : (
              <a 
                href="/#tracker" 
                onClick={(e) => handleSectionClick('#tracker', e)}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Community Stats
              </a>
            )}
            <a 
              href="/#community" 
              onClick={(e) => handleSectionClick('#community', e)}
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Community
            </a>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/research" className="text-foreground hover:text-primary transition-colors">
              Research
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.email?.split('@')[0]}
                </span>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-gradient-forest text-white" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md">
            <div className="py-4 space-y-3">
              <a 
                       href="/#map"
                       onClick={(e) => handleSectionClick('#map', e)}
                       className="block px-4 py-2 text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Map View
              </a>
                     {isAuthenticated ? (
                       <Link
                         to="/dashboard"
                className="block px-4 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                         My Dashboard
                       </Link>
                     ) : (
                       <a
                         href="/#tracker"
                         onClick={(e) => handleSectionClick('#tracker', e)}
                         className="block px-4 py-2 text-foreground hover:text-primary transition-colors cursor-pointer"
                       >
                         Community Stats
                       </a>
                     )}
                     <a
                       href="/#community"
                       onClick={(e) => handleSectionClick('#community', e)}
                       className="block px-4 py-2 text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Community
              </a>
                     <Link
                       to="/about"
                className="block px-4 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                About
                     </Link>
                     <Link
                       to="/blog"
                       className="block px-4 py-2 text-foreground hover:text-primary transition-colors"
                       onClick={toggleMenu}
                     >
                       Blog
                     </Link>
                     <Link
                       to="/research"
                       className="block px-4 py-2 text-foreground hover:text-primary transition-colors"
                       onClick={toggleMenu}
                     >
                       Research
                     </Link>
              <div className="px-4 pt-2 space-y-2">
                       {isAuthenticated ? (
                         <div className="space-y-2">
                           <div className="text-sm text-muted-foreground px-2">
                             Welcome, {user?.email?.split('@')[0]}
                           </div>
                           <Button variant="outline" className="w-full" onClick={() => { signOut(); toggleMenu(); }}>
                             Sign Out
                           </Button>
                         </div>
                       ) : (
                         <>
                           <Button variant="outline" className="w-full" asChild>
                             <Link to="/login" onClick={toggleMenu}>Sign In</Link>
                           </Button>
                           <Button className="w-full bg-gradient-forest text-white" asChild>
                             <Link to="/login" onClick={toggleMenu}>Get Started</Link>
                           </Button>
                         </>
                       )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;