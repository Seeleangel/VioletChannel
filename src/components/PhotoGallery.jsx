'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PhotoGallery.css';
import './PhotoGallery-loader.css';

function PhotoGallery({ isOpen, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set([0]));
  const [direction, setDirection] = useState(0);
  const [imageCache, setImageCache] = useState({});
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 从im文件夹加载图片列表
  useEffect(() => {
    if (isOpen && photos.length === 0) {
      fetch('/api/images/list')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPhotos(data);
          }
        })
        .catch(err => console.error('Failed to load images:', err));
    }
  }, [isOpen, photos.length]);

  // Lazy load images
  useEffect(() => {
    if (!isOpen || photos.length === 0) return;

    // Load current image
    const loadCurrentImage = () => {
      const currentPhoto = photos[currentIndex];
      if (!currentPhoto) return;

      if (!imageCache[currentPhoto.src]) {
        setLoadingImages(prev => new Set([...prev, currentIndex]));
        setImageLoaded(false);

        const img = new Image();
        img.src = currentPhoto.src;
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, currentIndex]));
          setImageCache(prev => ({ ...prev, [currentPhoto.src]: true }));
          setLoadingImages(prev => {
            const next = new Set(prev);
            next.delete(currentIndex);
            return next;
          });
          setImageLoaded(true);
        };
      } else {
        setImageLoaded(true);
      }
    };

    loadCurrentImage();

    // Preload adjacent images
    const preloadTimer = setTimeout(() => {
      const indicesToLoad = [];
      for (let i = 1; i <= 2; i++) {
        indicesToLoad.push((currentIndex + i) % photos.length);
        indicesToLoad.push((currentIndex - i + photos.length) % photos.length);
      }

      indicesToLoad.forEach(index => {
        const photo = photos[index];
        if (photo && !loadedImages.has(index) && !imageCache[photo.src] && !loadingImages.has(index)) {
          const img = new Image();
          img.src = photo.src;
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            setImageCache(prev => ({ ...prev, [photo.src]: true }));
          };
        }
      });
    }, 200);

    return () => clearTimeout(preloadTimer);
  }, [currentIndex, isOpen, photos]);

  const nextPhoto = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, []);

  const prevPhoto = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'Escape') onClose();
  }, [isOpen, nextPhoto, prevPhoto, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 触摸滑动手势支持
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // 最小滑动距离
    
    if (Math.abs(distance) < minSwipeDistance) return;
    
    if (distance > 0) {
      // 向左滑动，下一张
      nextPhoto();
    } else {
      // 向右滑动，上一张
      prevPhoto();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, nextPhoto, prevPhoto]);

  const slideVariants = useMemo(() => ({
    enter: (direction) => ({
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? '-50%' : '50%',
      opacity: 0
    })
  }), []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="gallery-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="gallery-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <motion.button
              className="gallery-close"
              onClick={onClose}
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <X size={24} />
            </motion.button>

            {/* 图片展示区 */}
            <div 
              className="gallery-image-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {photos.length === 0 ? (
                <div className="image-loader" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="loader-spinner"></div>
                </div>
              ) : (
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "tween", duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                      opacity: { duration: 0.1, ease: "easeOut" }
                    }}
                    className="gallery-image-container"
                  >
                    {!imageLoaded && (
                      <div className="image-loader">
                        <div className="loader-spinner"></div>
                      </div>
                    )}
                    {photos[currentIndex] && (
                      <img
                        src={photos[currentIndex].src}
                        alt={photos[currentIndex].caption}
                        className={`gallery-image ${imageLoaded ? 'loaded' : 'loading'}`}
                        loading="eager"
                        decoding="async"
                        onLoad={() => setImageLoaded(true)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* 导航按钮 */}
              <motion.button
                className="gallery-nav gallery-prev"
                onClick={prevPhoto}
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <ChevronLeft size={20} />
              </motion.button>

              <motion.button
                className="gallery-nav gallery-next"
                onClick={nextPhoto}
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* 标题和计数 */}
            <motion.div
              className="gallery-info"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3>{photos[currentIndex]?.caption || '加载中...'}</h3>
              <span className="gallery-counter">
                {currentIndex + 1} / {photos.length}
              </span>
            </motion.div>

            {/* 缩略图导航 */}
            <div className="gallery-thumbnails">
              {photos.map((photo, index) => {
                const isNearCurrent = Math.abs(index - currentIndex) <= 3;
                return (
                  <motion.div
                    key={index}
                    className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    whileHover={{ scale: 1.08, transition: { duration: 0.1, ease: "easeOut" } }}
                    whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption || ''} 
                      loading={isNearCurrent ? "eager" : "lazy"}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PhotoGallery;
