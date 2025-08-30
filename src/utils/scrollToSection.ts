// Utility function to handle smooth scrolling to sections
export const scrollToSection = (sectionId: string) => {
  // Remove the '#' if it exists
  const id = sectionId.replace('#', '');
  
  // Find the element
  const element = document.getElementById(id);
  
  if (element) {
    // Calculate offset for fixed navigation (adjust based on your nav height)
    const navOffset = 80; // Adjust this value based on your navigation height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Handle hash links in the URL
export const handleHashOnLoad = () => {
  const hash = window.location.hash;
  if (hash) {
    // Small delay to ensure the page is fully loaded
    setTimeout(() => {
      scrollToSection(hash);
    }, 100);
  }
};
