import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { scrollToSection } from "@/utils/scrollToSection";

const SafeNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      window.location.href = `/#${sectionId}`;
    }
    
    setIsMenuOpen(false);
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Map", href: "/#map", onClick: (e: React.MouseEvent) => handleSectionClick("map", e) },
    { name: "Tracker", href: "/#tracker", onClick: (e: React.MouseEvent) => handleSectionClick("tracker", e) },
    { name: "Community", href: "/#community", onClick: (e: React.MouseEvent) => handleSectionClick("community", e) },
    { name: "About", href: "/about" },
    { name: "Research", href: "/research" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/ecoguide.jpg" 
                alt="EcoGuide AI" 
                className="h-8 w-8 mr-2 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2322c55e'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='14' font-weight='bold'%3EE%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="text-xl font-bold text-gray-900">EcoGuide AI</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={item.onClick}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Demo Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => {
                    if (item.onClick) item.onClick(e);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-2 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="block px-3 py-2 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SafeNavigation;
