import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Leaf, Users, Target, Heart, Shield, Award, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="mb-8 animate-float">
              <Heart className="w-16 h-16 mx-auto text-primary-glow mb-6 drop-shadow-lg" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              About EcoGuide AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize climate data and empower individuals to make 
              meaningful environmental impact through AI-powered insights and community action.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Climate change is the defining challenge of our time, but individual action often 
                feels disconnected from global impact. We bridge this gap by making complex 
                environmental data accessible and actionable for everyone.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Through satellite data analysis, AI-powered insights, and community engagement, 
                we help people understand their environmental footprint and take meaningful steps 
                toward a sustainable future.
              </p>
              <Button className="bg-gradient-forest text-white px-8 py-3">
                Learn More About Our Impact
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold text-foreground mb-2">50M+</h3>
                <p className="text-muted-foreground">Data Points Analyzed</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-2xl font-bold text-foreground mb-2">10K+</h3>
                <p className="text-muted-foreground">Active Users</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-2xl font-bold text-foreground mb-2">25%</h3>
                <p className="text-muted-foreground">Average Carbon Reduction</p>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-primary-glow/10 to-primary-glow/5 border-primary-glow/20">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary-glow" />
                <h3 className="text-2xl font-bold text-foreground mb-2">5</h3>
                <p className="text-muted-foreground">Climate Awards</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything we do is guided by our commitment to transparency, accessibility, 
              and meaningful environmental impact.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-border/50 hover:shadow-soft transition-all duration-300">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Transparency</h3>
              <p className="text-muted-foreground">
                Open data, clear methodologies, and honest reporting about our environmental 
                impact and the accuracy of our predictions.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-border/50 hover:shadow-soft transition-all duration-300">
              <Leaf className="w-16 h-16 mx-auto mb-6 text-secondary" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Sustainability</h3>
              <p className="text-muted-foreground">
                We practice what we preach - our infrastructure runs on renewable energy 
                and we offset all our operational carbon footprint.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-border/50 hover:shadow-soft transition-all duration-300">
              <Users className="w-16 h-16 mx-auto mb-6 text-accent" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Accessibility</h3>
              <p className="text-muted-foreground">
                Climate action shouldn't be a privilege. We make our tools free and accessible 
                to communities worldwide, regardless of economic status.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A diverse group of climate scientists, AI researchers, and sustainability advocates 
              working together to democratize environmental data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team members - using placeholder structure */}
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Climate Data Scientist",
                expertise: "Satellite Data Analysis",
                icon: Globe
              },
              {
                name: "Marcus Rodriguez",
                role: "AI/ML Engineer", 
                expertise: "Machine Learning Models",
                icon: Target
              },
              {
                name: "Aisha Patel",
                role: "Sustainability Director",
                expertise: "Carbon Footprint Analysis",
                icon: Leaf
              }
            ].map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-soft transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-forest rounded-full flex items-center justify-center">
                  <member.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-semibold mb-2">{member.role}</p>
                <p className="text-muted-foreground">{member.expertise}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Mission</h2>
          <p className="text-xl text-white/90 mb-8">
            Ready to make a real impact on climate change? Start tracking your carbon footprint 
            and join thousands of others taking action for our planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-3">
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-3"
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
