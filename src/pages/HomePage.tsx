import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategorySlider from '../components/CategorySlider';
import UnifiedProductsCarousel from '../components/UnifiedProductsCarousel';
import VideoSection from '../components/VideoSection';
import AboutSection from '../components/AboutSection';
import WhyChooseSection from '../components/WhyChooseSection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Single RAFAL Ads Banner Section */}
      <div className="mb-8">
        <HeroBanner />
      </div>
      
      <CategorySlider />
      <UnifiedProductsCarousel />
      <VideoSection />
      <AboutSection />
      <WhyChooseSection />
    </div>
  );
};

export default HomePage;