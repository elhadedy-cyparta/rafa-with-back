import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, RotateCw } from 'lucide-react';

interface Product360ViewerProps {
  images: string[];
  productName: string;
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
  className = '',
  autoRotate = false,
  rotationSpeed = 2000
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startIndexRef = useRef<number>(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      setIsLoading(true);
      const imagePromises = images.map((src, index) => {
        return new Promise<number>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            resolve(index);
          };
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error('Error preloading 360° images:', error);
        setIsLoading(false);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  // Auto rotation logic
  useEffect(() => {
    if (isAutoRotating && !isDragging && images.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, rotationSpeed / images.length);
    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, isDragging, images.length, rotationSpeed]);

  // Handle mouse/touch start
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    startXRef.current = clientX;
    startIndexRef.current = currentImageIndex;
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, [currentImageIndex]);

  // Handle mouse/touch move
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || images.length <= 1) return;

    const deltaX = clientX - startXRef.current;
    const sensitivity = containerRef.current ? containerRef.current.offsetWidth / images.length : 100;
    const deltaIndex = Math.round(deltaX / sensitivity);
    
    let newIndex = startIndexRef.current - deltaIndex;
    
    // Wrap around
    while (newIndex < 0) newIndex += images.length;
    while (newIndex >= images.length) newIndex -= images.length;
    
    if (newIndex !== currentImageIndex) {
      setCurrentImageIndex(newIndex);
    }
  }, [isDragging, images.length, currentImageIndex]);

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex(prev => (prev + 1) % images.length);
          break;
        case 'Escape':
          e.preventDefault();
          setIsFullscreen(false);
          break;
        case ' ':
          e.preventDefault();
          setIsAutoRotating(prev => !prev);
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, images.length]);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };

  const resetRotation = () => {
    setCurrentImageIndex(0);
    setIsAutoRotating(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const rotateLeft = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    setIsAutoRotating(false);
  };

  const rotateRight = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    setIsAutoRotating(false);
  };

  if (images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No 360° images available</p>
      </div>
    );
  }

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <>
      {/* Main 360° Viewer */}
      <div className={`relative group ${className}`}>
        <div
          ref={containerRef}
          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading 360° View...</p>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(loadedImages.size / images.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Main Image */}
          <img
            src={currentImage}
            alt={`${productName} - 360° view ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            draggable={false}
          />

          {/* 360° Indicator */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <RotateCcw size={16} className={isAutoRotating ? 'animate-spin' : ''} />
            <span>360°</span>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Drag Hint */}
          {!isDragging && !isAutoRotating && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg text-center">
                <p className="font-medium mb-1">Drag to rotate</p>
                <p className="text-sm opacity-75">← → or touch and drag</p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
            
            <button
              onClick={toggleAutoRotate}
              className={`p-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 ${
                isAutoRotating ? 'bg-red-600 bg-opacity-90' : ''
              }`}
              title={isAutoRotating ? 'Stop Auto Rotate' : 'Start Auto Rotate'}
            >
              {isAutoRotating ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button
              onClick={resetRotation}
              className="p-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110"
              title="Reset to Front View"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2 md:hidden">
            <button
              onClick={rotateLeft}
              className="p-2 bg-black bg-opacity-70 text-white rounded-full"
              title="Rotate Left"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={rotateRight}
              className="p-2 bg-black bg-opacity-70 text-white rounded-full"
              title="Rotate Right"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsAutoRotating(false);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                currentImageIndex === index 
                  ? 'border-red-600 shadow-lg scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full max-w-6xl max-h-full">
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 z-10"
            >
              <Minimize2 size={24} />
            </button>

            {/* Fullscreen 360° Viewer */}
            <div
              className="w-full h-full cursor-grab select-none flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <img
                src={currentImage}
                alt={`${productName} - 360° view ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />

              {/* Fullscreen Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-70 px-6 py-3 rounded-full">
                <button
                  onClick={rotateLeft}
                  className="p-2 text-white hover:text-red-400 transition-colors"
                  title="Rotate Left"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={toggleAutoRotate}
                  className={`p-2 text-white hover:text-red-400 transition-colors ${
                    isAutoRotating ? 'text-red-400' : ''
                  }`}
                  title={isAutoRotating ? 'Stop Auto Rotate' : 'Start Auto Rotate'}
                >
                  {isAutoRotating ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <span className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </span>
                
                <button
                  onClick={resetRotation}
                  className="p-2 text-white hover:text-red-400 transition-colors"
                  title="Reset to Front View"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={rotateRight}
                  className="p-2 text-white hover:text-red-400 transition-colors"
                  title="Rotate Right"
                >
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Keyboard Hints */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm text-center">
                <p>Use ← → arrow keys to rotate • Space to toggle auto-rotate • ESC to exit</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Product360Viewer;