import React, { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Specific YouTube videos to embed
const embeddedVideos = [
  {
    id: 'wydNtE1eyko',
    title: 'RAFAL Electric - Product Showcase #1',
    title_ar: 'رافال إلكتريك - عرض المنتج #1',
    description: 'Discover our latest electrical appliances and their amazing features.',
    description_ar: 'اكتشف أحدث أجهزتنا الكهربائية وميزاتها المذهلة.',
    thumbnail: `https://img.youtube.com/vi/wydNtE1eyko/maxresdefault.jpg`,
    publishedAt: '2024-01-15T10:00:00Z',
    duration: '0:60',
    viewCount: 'YouTube Shorts',
    viewCount_ar: 'يوتيوب شورتس',
    videoUrl: `https://www.youtube.com/embed/wydNtE1eyko?rel=0&modestbranding=1`,
    type: 'shorts'
  },
  {
    id: 'abj184paGDs',
    title: 'RAFAL Electric - Product Demo #2',
    title_ar: 'رافال إلكتريك - عرض توضيحي للمنتج #2',
    description: 'See how our electrical products can transform your daily routine.',
    description_ar: 'شاهد كيف يمكن لمنتجاتنا الكهربائية أن تغير روتينك اليومي.',
    thumbnail: `https://img.youtube.com/vi/abj184paGDs/maxresdefault.jpg`,
    publishedAt: '2024-01-16T10:00:00Z',
    duration: '0:45',
    viewCount: 'YouTube Shorts',
    viewCount_ar: 'يوتيوب شورتس',
    videoUrl: `https://www.youtube.com/embed/abj184paGDs?rel=0&modestbranding=1`,
    type: 'shorts'
  },
  {
    id: '3Ugk9JDn4cM',
    title: 'RAFAL Electric - Innovation Spotlight #3',
    title_ar: 'رافال إلكتريك - إضاءة على الابتكار #3',
    description: 'Explore the innovative technology behind our electrical appliances.',
    description_ar: 'استكشف التكنولوجيا المبتكرة وراء أجهزتنا الكهربائية.',
    thumbnail: `https://img.youtube.com/vi/3Ugk9JDn4cM/maxresdefault.jpg`,
    publishedAt: '2024-01-17T10:00:00Z',
    duration: '0:55',
    viewCount: 'YouTube Shorts',
    viewCount_ar: 'يوتيوب شورتس',
    videoUrl: `https://www.youtube.com/embed/3Ugk9JDn4cM?rel=0&modestbranding=1`,
    type: 'shorts'
  },
  {
    id: 'UFQVn31krrM',
    title: 'RAFAL Electric - Customer Experience #4',
    title_ar: 'رافال إلكتريك - تجربة العملاء #4',
    description: 'Real customer experiences with RAFAL Electric products.',
    description_ar: 'تجارب حقيقية للعملاء مع منتجات رافال إلكتريك.',
    thumbnail: `https://img.youtube.com/vi/UFQVn31krrM/maxresdefault.jpg`,
    publishedAt: '2024-01-18T10:00:00Z',
    duration: '0:50',
    viewCount: 'YouTube Shorts',
    viewCount_ar: 'يوتيوب شورتس',
    videoUrl: `https://www.youtube.com/embed/UFQVn31krrM?rel=0&modestbranding=1`,
    type: 'shorts'
  },
  {
    id: 'KtF-2WqkjIk',
    title: 'RAFAL Electric - Complete Product Guide',
    title_ar: 'رافال إلكتريك - دليل المنتج الكامل',
    description: 'Comprehensive guide to our electrical appliance collection and features.',
    description_ar: 'دليل شامل لمجموعة أجهزتنا الكهربائية وميزاتها.',
    thumbnail: `https://img.youtube.com/vi/KtF-2WqkjIk/maxresdefault.jpg`,
    publishedAt: '2024-01-19T10:00:00Z',
    duration: '5:30',
    viewCount: '1.2K views',
    viewCount_ar: '1.2 ألف مشاهدة',
    videoUrl: `https://www.youtube.com/embed/KtF-2WqkjIk?rel=0&modestbranding=1`,
    type: 'video'
  },
  {
    id: '-WZVx3fHF_0',
    title: 'RAFAL Electric - Installation & Setup Tutorial',
    title_ar: 'رافال إلكتريك - دليل التثبيت والإعداد',
    description: 'Step-by-step installation guide for RAFAL Electric appliances.',
    description_ar: 'دليل التثبيت خطوة بخطوة لأجهزة رافال إلكتريك.',
    thumbnail: `https://img.youtube.com/vi/-WZVx3fHF_0/maxresdefault.jpg`,
    publishedAt: '2024-01-20T10:00:00Z',
    duration: '8:45',
    viewCount: '856 views',
    viewCount_ar: '856 مشاهدة',
    videoUrl: `https://www.youtube.com/embed/-WZVx3fHF_0?rel=0&modestbranding=1`,
    type: 'video'
  },
  {
    id: 'Yu6jLmA_HNQ',
    title: 'RAFAL Electric - Maintenance & Care Tips',
    title_ar: 'رافال إلكتريك - نصائح الصيانة والعناية',
    description: 'Essential maintenance tips to keep your RAFAL Electric appliances running perfectly.',
    description_ar: 'نصائح صيانة أساسية للحفاظ على أجهزة رافال إلكتريك تعمل بشكل مثالي.',
    thumbnail: `https://img.youtube.com/vi/Yu6jLmA_HNQ/maxresdefault.jpg`,
    publishedAt: '2024-01-21T10:00:00Z',
    duration: '6:20',
    viewCount: '2.1K views',
    viewCount_ar: '2.1 ألف مشاهدة',
    videoUrl: `https://www.youtube.com/embed/Yu6jLmA_HNQ?rel=0&modestbranding=1`,
    type: 'video'
  },
  {
    id: 'sbFoDNUzDO4',
    title: 'RAFAL Electric - Advanced Features Overview',
    title_ar: 'رافال إلكتريك - نظرة عامة على الميزات المتقدمة',
    description: 'Discover the advanced features and smart technology in RAFAL Electric products.',
    description_ar: 'اكتشف الميزات المتقدمة والتكنولوجيا الذكية في منتجات رافال إلكتريك.',
    thumbnail: `https://img.youtube.com/vi/sbFoDNUzDO4/maxresdefault.jpg`,
    publishedAt: '2024-01-22T10:00:00Z',
    duration: '7:15',
    viewCount: '1.8K views',
    viewCount_ar: '1.8 ألف مشاهدة',
    videoUrl: `https://www.youtube.com/embed/sbFoDNUzDO4?rel=0&modestbranding=1`,
    type: 'video'
  },
  {
    id: 'oRnRs8j3EB8',
    title: 'RAFAL Electric - Customer Support & Warranty',
    title_ar: 'رافال إلكتريك - دعم العملاء والضمان',
    description: 'Learn about our comprehensive customer support and warranty services.',
    description_ar: 'تعرف على خدمات دعم العملاء والضمان الشاملة لدينا.',
    thumbnail: `https://img.youtube.com/vi/oRnRs8j3EB8/maxresdefault.jpg`,
    publishedAt: '2024-01-23T10:00:00Z',
    duration: '4:50',
    viewCount: '945 views',
    viewCount_ar: '945 مشاهدة',
    videoUrl: `https://www.youtube.com/embed/oRnRs8j3EB8?rel=0&modestbranding=1`,
    type: 'video'
  }
];

interface YouTubeVideo {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  viewCount_ar: string;
  videoUrl: string;
  type: 'video' | 'shorts';
}

const VideoSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, isRTL, t } = useLanguage();

  const videosPerSlide = 3;
  const totalSlides = Math.ceil(embeddedVideos.length / videosPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const openVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const openInYouTube = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'ar') {
      // Arabic date formatting
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('ar-EG', options);
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('video.title')}</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('video.subtitle')}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="https://www.youtube.com/@rafalelectric"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            <span>{t('video.visitChannel')}</span>
            <ExternalLink size={16} />
          </a>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{embeddedVideos.length} {t('video.availableVideos')}</span>
        </div>
      </div>

      {/* Video Slider */}
      <div className="relative mb-12">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {embeddedVideos
                    .slice(slideIndex * videosPerSlide, slideIndex * videosPerSlide + videosPerSlide)
                    .map((video) => (
                      <div
                        key={video.id}
                        className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        onClick={() => openVideo(video)}
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={language === 'ar' ? video.title_ar : video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            }}
                          />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                            <div className="bg-red-600 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Play size={32} className="text-white ml-1" fill="currentColor" />
                            </div>
                          </div>

                          {/* Video Type Badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded flex items-center space-x-1 ${
                              video.type === 'shorts' 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              <Play size={12} fill="currentColor" />
                              <span>{video.type === 'shorts' ? (language === 'ar' ? 'شورتس' : 'Shorts') : (language === 'ar' ? 'فيديو' : 'Video')}</span>
                            </span>
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                            {video.duration}
                          </div>

                          {/* External Link Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInYouTube(video.id);
                            }}
                            className="absolute top-3 right-3 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                            title={language === 'ar' ? 'فتح في يوتيوب' : 'Open in YouTube'}
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>

                        <div className="p-6">
                          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {language === 'ar' ? video.title_ar : video.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {language === 'ar' ? video.description_ar : video.description}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>{formatDate(video.publishedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Eye size={14} />
                              <span>{language === 'ar' ? video.viewCount_ar : video.viewCount}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInYouTube(video.id);
                            }}
                            className="w-full text-red-600 hover:text-red-700 font-medium transition-colors text-center py-2 border border-red-200 rounded-lg hover:bg-red-50"
                          >
                            {t('video.watchOnYoutube')}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:scale-110"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:scale-110"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 h-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full scale-125'
                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 hover:scale-110'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-xl overflow-hidden relative w-full max-w-6xl max-h-[90vh]">
            
            {/* Video Player Controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
              <button
                onClick={() => openInYouTube(selectedVideo.id)}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-300"
                title={language === 'ar' ? 'فتح في يوتيوب' : 'Open in YouTube'}
              >
                <ExternalLink size={20} />
              </button>
              
              <button
                onClick={closeVideo}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-300"
                title={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="relative">
              <div className="aspect-video bg-black">
                <iframe
                  src={selectedVideo.videoUrl + '&autoplay=1'}
                  title={language === 'ar' ? selectedVideo.title_ar : selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* Video Info */}
            <div className="bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {language === 'ar' ? selectedVideo.title_ar : selectedVideo.title}
                  </h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{formatDate(selectedVideo.publishedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye size={16} />
                      <span>{language === 'ar' ? selectedVideo.viewCount_ar : selectedVideo.viewCount}</span>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedVideo.type === 'shorts'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVideo.type === 'shorts' 
                        ? (language === 'ar' ? 'يوتيوب شورتس' : 'YouTube Shorts') 
                        : (language === 'ar' ? 'فيديو رافال إلكتريك' : 'RAFAL Electric Video')}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {language === 'ar' ? selectedVideo.description_ar : selectedVideo.description}
                  </p>
                  <button
                    onClick={() => openInYouTube(selectedVideo.id)}
                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>{t('video.watchOnYoutube')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoSection;