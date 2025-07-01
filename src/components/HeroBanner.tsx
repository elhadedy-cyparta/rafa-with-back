import React from 'react';
import RafalAdsBanner from './RafalAdsBanner';

const HeroBanner = () => {
  return (
    <div className="container mx-auto px-4 animate-fade-in-up">
      {/* RAFAL API Advertisement Banner - Single Section */}
      <RafalAdsBanner 
        className="mb-6"
        autoSlide={true}
        slideInterval={6000}
        showControls={true}
        showRefreshButton={false}
      />
    </div>
  );
};

export default HeroBanner;