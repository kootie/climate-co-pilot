import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Search, 
  TrendingUp, 
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  Globe,
  Users,
  ChevronRight
} from "lucide-react";

const ClimateBlog = () => {
  // Mock blog data - in real app this would come from an API
  const featuredArticle = {
    id: 1,
    title: "Arctic Ice Melt Reaches Tipping Point: What the Latest Satellite Data Reveals",
    excerpt: "New analysis of satellite imagery shows accelerating ice loss in Greenland and Antarctica, with potential sea level implications for coastal cities worldwide.",
    category: "Climate Science",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    image: "/ecoguide.jpg",
    author: "Dr. Sarah Chen"
  };

  const blogPosts = [
    {
      id: 2,
      title: "How AI is Revolutionizing Carbon Footprint Tracking",
      excerpt: "Machine learning algorithms are making it easier than ever to understand and reduce personal environmental impact.",
      category: "Technology",
      readTime: "5 min read",
      publishDate: "2024-01-12",
      image: "/ecoguide.jpg",
      author: "Marcus Rodriguez"
    },
    {
      id: 3,
      title: "Community Action: Local Solutions to Global Climate Challenges",
      excerpt: "Exploring successful grassroots initiatives that are making measurable environmental impact at the community level.",
      category: "Community",
      readTime: "6 min read",
      publishDate: "2024-01-10",
      image: "/ecoguide.jpg",
      author: "Aisha Patel"
    },
    {
      id: 4,
      title: "Ocean Temperature Rise: Tracking Marine Ecosystem Changes",
      excerpt: "Latest oceanographic data reveals concerning trends in marine biodiversity and ecosystem health.",
      category: "Climate Science",
      readTime: "7 min read",
      publishDate: "2024-01-08",
      image: "/ecoguide.jpg",
      author: "Dr. Sarah Chen"
    },
    {
      id: 5,
      title: "Renewable Energy Adoption: 2024 Global Progress Report",
      excerpt: "Analyzing worldwide renewable energy deployment and its impact on carbon emissions reduction.",
      category: "Energy",
      readTime: "9 min read",
      publishDate: "2024-01-05",
      image: "/ecoguide.jpg",
      author: "Marcus Rodriguez"
    },
    {
      id: 6,
      title: "Sustainable Living: 10 Data-Driven Tips for Reducing Your Impact",
      excerpt: "Evidence-based strategies for lowering your personal carbon footprint without compromising quality of life.",
      category: "Lifestyle",
      readTime: "4 min read",
      publishDate: "2024-01-03",
      image: "/ecoguide.jpg",
      author: "Aisha Patel"
    }
  ];

  const categories = [
    { name: "Climate Science", icon: Thermometer, count: 12, color: "text-primary" },
    { name: "Technology", icon: TrendingUp, count: 8, color: "text-secondary" },
    { name: "Community", icon: Users, count: 6, color: "text-accent" },
    { name: "Energy", icon: Wind, count: 9, color: "text-primary-glow" },
    { name: "Lifestyle", icon: Leaf, count: 7, color: "text-secondary" },
    { name: "Policy", icon: Globe, count: 4, color: "text-accent" }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="mb-8 animate-float">
              <BookOpen className="w-16 h-16 mx-auto text-primary-glow mb-6 drop-shadow-lg" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Climate Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Stay informed with the latest climate science, environmental technology, 
              and actionable insights for sustainable living.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 py-3 text-lg bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/20"
              >
                <category.icon className={`w-4 h-4 ${category.color}`} />
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Article</h2>
            <p className="text-muted-foreground">Don't miss our latest in-depth analysis</p>
          </div>
          
          <Card className="overflow-hidden hover:shadow-soft transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-square bg-gradient-ocean"></div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {featuredArticle.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredArticle.publishDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {featuredArticle.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-forest rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{featuredArticle.author}</p>
                      <p className="text-sm text-muted-foreground">Climate Data Scientist</p>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-forest text-white">
                    Read Article
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-16 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Recent Articles</h2>
            <p className="text-muted-foreground">Latest insights from our team of experts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-soft transition-all duration-300 group">
                <div className="aspect-video bg-gradient-ocean"></div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-forest rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-muted-foreground">{post.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{post.publishDate}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Stay Informed</h2>
          <p className="text-xl text-white/90 mb-8">
            Get weekly climate insights and the latest environmental research delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button className="bg-white text-primary hover:bg-white/90 px-8">
              Subscribe
            </Button>
          </div>
          
          <p className="text-white/70 text-sm mt-4">
            No spam, unsubscribe anytime. Read our privacy policy.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClimateBlog;
