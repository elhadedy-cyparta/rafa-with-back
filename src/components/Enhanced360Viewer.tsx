import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, RotateCw, ZoomIn, ZoomOut, Move, X } from 'lucide-react';

interface Enhanced360ViewerProps {
  images: string[];
  productName: string;
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
}

const Enhanced360Viewer: React.FC<Enhanced360ViewerProps> = ({
  images,
  productName,
  className = '',
  autoRotate = false,
  rotationSpeed = 3000,
  enableZoom = true,
  enableFullscreen = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [dragMode, setDragMode] = useState<'rotate' | 'pan'>('rotate');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startIndexRef = useRef<number>(0);
  const startPanXRef = useRef<number>(0);
  const startPanYRef = useRef<number>(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  const velocityRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const inertiaRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced image set with more angles for smoother rotation
  const generateImageSet = useCallback(() => {
    if (images.length >= 24) return images; // Already have enough images
    
    // If we have fewer images, interpolate to create smoother rotation
    const targetCount = 36;
    const enhancedImages: string[] = [];
    
    for (let i = 0; i < targetCount; i++) {
      const sourceIndex = Math.floor((i / targetCount) * images.length);
      enhancedImages.push(images[sourceIndex] || images[0]);
    }
    
    return enhancedImages;
  }, [images]);

  const enhancedImages = generateImageSet();

  // Preload all images with progress tracking
  useEffect(() => {
    const preloadImages = async () => {
      setIsLoading(true);
      setLoadedImages(new Set());
      
      const imagePromises = enhancedImages.map((src, index) => {
        return new Promise<number>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            resolve(index);
          };
          img.onerror = () => {
            console.warn(`Failed to load image ${index}: ${src}`);
            resolve(index); // Continue even if some images fail
          };
          img.src = src;
        });
      });

      try {
        await Promise.allSettled(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error('Error preloading 360° images:', error);
        setIsLoading(false);
      }
    };

    if (enhancedImages.length > 0) {
      preloadImages();
    }
  }, [enhancedImages]);

  // Auto rotation with smooth animation
  useEffect(() => {
    if (isAutoRotating && !isDragging && !isPanning && enhancedImages.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % enhancedImages.length);
      }, rotationSpeed / enhancedImages.length);
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
  }, [isAutoRotating, isDragging, isPanning, enhancedImages.length, rotationSpeed]);

  // Inertia effect for smooth rotation
  const applyInertia = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      setCurrentImageIndex(prev => {
        const newIndex = prev + Math.round(velocityRef.current);
        return ((newIndex % enhancedImages.length) + enhancedImages.length) % enhancedImages.length;
      });
      
      velocityRef.current *= 0.95; // Friction
      inertiaRef.current = setTimeout(applyInertia, 16);
    }
  }, [enhancedImages.length]);

  // Handle interaction start
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (dragMode === 'rotate') {
      setIsDragging(true);
      setIsAutoRotating(false);
      startXRef.current = clientX;
      startIndexRef.current = currentImageIndex;
      velocityRef.current = 0;
      lastMoveTimeRef.current = Date.now();
      
      if (inertiaRef.current) {
        clearTimeout(inertiaRef.current);
      }
    } else if (dragMode === 'pan' && zoom > 1) {
      setIsPanning(true);
      startXRef.current = clientX;
      startYRef.current = clientY;
      startPanXRef.current = panX;
      startPanYRef.current = panY;
    }
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, [dragMode, currentImageIndex, zoom, panX, panY]);

  // Handle interaction move
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isDragging && enhancedImages.length > 1) {
      const deltaX = clientX - startXRef.current;
      const sensitivity = containerRef.current ? containerRef.current.offsetWidth / (enhancedImages.length * 2) : 50;
      const deltaIndex = Math.round(deltaX / sensitivity);
      
      let newIndex = startIndexRef.current - deltaIndex;
      while (newIndex < 0) newIndex += enhancedImages.length;
      while (newIndex >= enhancedImages.length) newIndex -= enhancedImages.length;
      
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
        
        // Calculate velocity for inertia
        const currentTime = Date.now();
        const timeDelta = currentTime - lastMoveTimeRef.current;
        if (timeDelta > 0) {
          velocityRef.current = (newIndex - currentImageIndex) / timeDelta * 16;
        }
        lastMoveTimeRef.current = currentTime;
      }
    } else if (isPanning && zoom > 1) {
      const deltaX = clientX - startXRef.current;
      const deltaY = clientY - startYRef.current;
      
      const maxPanX = (zoom - 1) * 50;
      const maxPanY = (zoom - 1) * 50;
      
      const newPanX = Math.max(-maxPanX, Math.min(maxPanX, startPanXRef.current + deltaX / zoom));
      const newPanY = Math.max(-maxPanY, Math.min(maxPanY, startPanYRef.current + deltaY / zoom));
      
      setPanX(newPanX);
      setPanY(newPanY);
    }
  }, [isDragging, isPanning, enhancedImages.length, currentImageIndex, zoom]);

  // Handle interaction end
  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Apply inertia effect
      if (Math.abs(velocityRef.current) > 0.5) {
        applyInertia();
      }
    }
    
    if (isPanning) {
      setIsPanning(false);
    }
    
    if (containerRef.current) {
      containerRef.current.style.cursor = dragMode === 'pan' && zoom > 1 ? 'move' : 'grab';
    }
  }, [isDragging, isPanning, dragMode, zoom, applyInertia]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1, Math.min(3, zoom + delta));
    
    setZoom(newZoom);
    
    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
      setDragMode('rotate');
    } else if (dragMode === 'rotate') {
      setDragMode('pan');
    }
  }, [enableZoom, zoom, dragMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen && !containerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex(prev => (prev - 1 + enhancedImages.length) % enhancedImages.length);
          setIsAutoRotating(false);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex(prev => (prev + 1) % enhancedImages.length);
          setIsAutoRotating(false);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (enableZoom) {
            setZoom(prev => Math.min(3, prev + 0.2));
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (enableZoom) {
            setZoom(prev => Math.max(1, prev - 0.2));
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
        case ' ':
          e.preventDefault();
          setIsAutoRotating(prev => !prev);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetView();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, enhancedImages.length, enableZoom]);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging || isPanning) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
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
  }, [isDragging, isPanning, handleMove, handleEnd]);

  // Control functions
  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };

  const resetView = () => {
    setCurrentImageIndex(0);
    setIsAutoRotating(false);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setDragMode('rotate');
  };

  const toggleFullscreen = () => {
    if (!enableFullscreen) return;
    setIsFullscreen(prev => !prev);
  };

  const zoomIn = () => {
    if (!enableZoom) return;
    const newZoom = Math.min(3, zoom + 0.2);
    setZoom(newZoom);
    if (newZoom > 1 && dragMode === 'rotate') {
      setDragMode('pan');
    }
  };

  const zoomOut = () => {
    if (!enableZoom) return;
    const newZoom = Math.max(1, zoom - 0.2);
    setZoom(newZoom);
    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
      setDragMode('rotate');
    }
  };

  const rotateLeft = () => {
    setCurrentImageIndex(prev => (prev - 1 + enhancedImages.length) % enhancedImages.length);
    setIsAutoRotating(false);
  };

  const rotateRight = () => {
    setCurrentImageIndex(prev => (prev + 1) % enhancedImages.length);
    setIsAutoRotating(false);
  };

  if (enhancedImages.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-xl flex items-center justify-center aspect-square ${className}`}>
        <p className="text-gray-500">No 360° images available</p>
      </div>
    );
  }

  const currentImage = enhancedImages[currentImageIndex] || enhancedImages[0];
  const loadingProgress = (loadedImages.size / enhancedImages.length) * 100;

  return (
    <>
      {/* Main 360° Viewer */}
      <div className={`relative group ${className}`}>
        <div
          ref={containerRef}
          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-red-500"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ 
            touchAction: 'none',
            cursor: isDragging || isPanning ? 'grabbing' : 
                   dragMode === 'pan' && zoom > 1 ? 'move' : 'grab'
          }}
          tabIndex={0}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 font-semibold text-lg">Loading 360° View...</p>
                <div className="w-64 bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm">{Math.round(loadingProgress)}% loaded</p>
              </div>
            </div>
          )}

          {/* Main Image */}
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${productName} - 360° view ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />

          {/* 360° Indicator */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
            <RotateCcw size={16} className={isAutoRotating ? 'animate-spin' : ''} />
            <span>360° VIEW</span>
          </div>

          {/* Zoom Indicator */}
          {enableZoom && zoom > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}

          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {enhancedImages.length}
          </div>

          {/* Mode Indicator */}
          {zoom > 1 && (
            <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Move size={12} />
              <span>PAN MODE</span>
            </div>
          )}

          {/* Interactive Hints */}
          {!isDragging && !isPanning && !isAutoRotating && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black bg-opacity-80 text-white px-8 py-4 rounded-xl text-center max-w-sm">
                <p className="font-semibold mb-2">Interactive 360° View</p>
                <p className="text-sm opacity-90 mb-1">
                  {dragMode === 'rotate' ? 'Drag to rotate • Scroll to zoom' : 'Drag to pan • Scroll to zoom'}
                </p>
                <p className="text-xs opacity-75">Use arrow keys or touch gestures</p>
              </div>
            </div>
          )}

          {/* Control Panel - Moved to Left Side */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-16">
            {enableZoom && (
              <>
                <button
                  onClick={zoomIn}
                  disabled={zoom >= 3}
                  className="p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                
                <button
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className="p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
              </>
            )}

            {enableFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                title="Fullscreen View"
              >
                <Maximize2 size={18} />
              </button>
            )}
            
            <button
              onClick={toggleAutoRotate}
              className={`p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
                isAutoRotating ? 'bg-red-600 bg-opacity-90' : ''
              }`}
              title={isAutoRotating ? 'Stop Auto Rotate' : 'Start Auto Rotate'}
            >
              {isAutoRotating ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button
              onClick={resetView}
              className="p-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              title="Reset View"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2 md:hidden">
            <button
              onClick={rotateLeft}
              className="p-2 bg-black bg-opacity-70 text-white rounded-full shadow-lg"
              title="Rotate Left"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={rotateRight}
              className="p-2 bg-black bg-opacity-70 text-white rounded-full shadow-lg"
              title="Rotate Right"
            >
              <RotateCw size={16} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-200"
              style={{ width: `${((currentImageIndex + 1) / enhancedImages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {enhancedImages.filter((_, index) => index % Math.ceil(enhancedImages.length / 12) === 0).map((image, index) => {
            const actualIndex = index * Math.ceil(enhancedImages.length / 12);
            return (
              <button
                key={actualIndex}
                onClick={() => {
                  setCurrentImageIndex(actualIndex);
                  setIsAutoRotating(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                  Math.abs(currentImageIndex - actualIndex) < 3
                    ? 'border-red-600 shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={image}
                  alt={`View ${actualIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-98 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 rounded-full transition-all duration-300 z-30 shadow-lg"
            >
              <X size={24} />
            </button>

            {/* Fullscreen 360° Viewer */}
            <div
              className="w-full h-full select-none flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ 
                touchAction: 'none',
                cursor: isDragging || isPanning ? 'grabbing' : 
                       dragMode === 'pan' && zoom > 1 ? 'move' : 'grab'
              }}
            >
              <img
                src={currentImage}
                alt={`${productName} - 360° view ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />

              {/* Fullscreen Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-80 px-8 py-4 rounded-full shadow-2xl">
                <button
                  onClick={rotateLeft}
                  className="p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
                  title="Rotate Left"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={toggleAutoRotate}
                  className={`p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10 ${
                    isAutoRotating ? 'text-red-400' : ''
                  }`}
                  title={isAutoRotating ? 'Stop Auto Rotate' : 'Start Auto Rotate'}
                >
                  {isAutoRotating ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                {enableZoom && (
                  <>
                    <button
                      onClick={zoomOut}
                      disabled={zoom <= 1}
                      className="p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                      title="Zoom Out"
                    >
                      <ZoomOut size={20} />
                    </button>
                    
                    <span className="text-white text-sm font-medium px-3">
                      {Math.round(zoom * 100)}%
                    </span>
                    
                    <button
                      onClick={zoomIn}
                      disabled={zoom >= 3}
                      className="p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                      title="Zoom In"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </>
                )}
                
                <div className="w-px h-8 bg-white bg-opacity-30"></div>
                
                <span className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {enhancedImages.length}
                </span>
                
                <div className="w-px h-8 bg-white bg-opacity-30"></div>
                
                <button
                  onClick={resetView}
                  className="p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
                  title="Reset View"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={rotateRight}
                  className="p-3 text-white hover:text-red-400 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
                  title="Rotate Right"
                >
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Keyboard Hints */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg text-sm text-center shadow-lg">
                <p className="font-medium mb-1">Interactive Controls</p>
                <p className="opacity-90">
                  ← → Rotate • ↑ ↓ Zoom • Space Auto-rotate • R Reset • ESC Exit
                </p>
                <p className="opacity-75 text-xs mt-1">
                  {dragMode === 'rotate' ? 'Drag to rotate • Scroll to zoom' : 'Drag to pan • Scroll to zoom'}
                </p>
              </div>

              {/* Mode Indicator */}
              {zoom > 1 && (
                <div className="absolute top-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-lg">
                  <Move size={16} />
                  <span>PAN MODE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Enhanced360Viewer;