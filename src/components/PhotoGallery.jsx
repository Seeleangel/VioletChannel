'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PhotoGallery.css';
import './PhotoGallery-loader.css';

const FIRST_BATCH_COUNT = 12;
const SKELETON_RATIOS = [1.18, 0.82, 1.04, 0.76, 1.24, 0.92, 1.1, 0.88];

function PhotoGallery({ isOpen, onClose, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [status, setStatus] = useState(initialPhotos.length > 0 ? 'ready' : 'idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [gridLoadedImages, setGridLoadedImages] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageCacheRef = useRef(new Set());

  const markGridLoaded = useCallback((src) => {
    if (!src) {
      return;
    }

    imageCacheRef.current.add(src);
    setGridLoadedImages((prev) => {
      if (prev[src]) {
        return prev;
      }

      return {
        ...prev,
        [src]: true,
      };
    });
  }, []);

  const preloadImage = useCallback((src) => {
    if (!src || typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    if (imageCacheRef.current.has(src)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        imageCacheRef.current.add(src);
        resolve(true);
      };

      const fail = () => {
        if (settled) {
          return;
        }

        settled = true;
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.onload = finish;
      img.onerror = fail;
      img.decoding = 'async';
      img.src = src;

      if (img.complete) {
        finish();
        return;
      }

      if (typeof img.decode === 'function') {
        img.decode().then(finish).catch(() => {
          // Some browsers reject decode before onload; let onload finish normally.
        });
      }
    });
  }, []);

  const handleCloseGallery = useCallback(() => {
    setIsLightboxOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (initialPhotos.length === 0 || photos.length > 0) {
      return;
    }

    setPhotos(initialPhotos);
    setStatus('ready');
  }, [initialPhotos, photos.length]);

  useEffect(() => {
    if (!isOpen || status === 'loading' || photos.length > 0) {
      return;
    }

    let isCancelled = false;

    const loadPhotos = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      try {
        setStatus('loading');
        const response = await fetch('/api/images/list', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Image list request failed: ${response.status}`);
        }

        const data = await response.json();

        if (isCancelled) {
          return;
        }

        const nextPhotos = Array.isArray(data) ? data : [];
        setPhotos(nextPhotos);
        setStatus('ready');

        const eagerPhotos = nextPhotos.slice(0, FIRST_BATCH_COUNT);
        await Promise.allSettled(eagerPhotos.map((photo) => preloadImage(photo.src)));

        if (isCancelled) {
          return;
        }

        eagerPhotos.forEach((photo) => markGridLoaded(photo.src));
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load images:', error);
          setStatus('error');
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    loadPhotos();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, markGridLoaded, photos.length, preloadImage, status]);

  useEffect(() => {
    if (!isLightboxOpen || photos.length === 0) {
      return;
    }

    let isCancelled = false;
    const currentPhoto = photos[currentIndex];

    if (!currentPhoto) {
      return;
    }

    setImageLoaded(imageCacheRef.current.has(currentPhoto.src));

    const hydrateLightbox = async () => {
      try {
        await preloadImage(currentPhoto.src);

        if (isCancelled) {
          return;
        }

        markGridLoaded(currentPhoto.src);
        setImageLoaded(true);

        const nearbyIndexes = [];

        for (let step = 1; step <= 2; step += 1) {
          nearbyIndexes.push((currentIndex + step) % photos.length);
          nearbyIndexes.push((currentIndex - step + photos.length) % photos.length);
        }

        await Promise.allSettled(
          nearbyIndexes
            .map((index) => photos[index]?.src)
            .filter(Boolean)
            .map((src) => preloadImage(src)),
        );

        if (isCancelled) {
          return;
        }

        nearbyIndexes.forEach((index) => {
          const photo = photos[index];
          if (photo) {
            markGridLoaded(photo.src);
          }
        });
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to prepare lightbox image:', error);
        }
      }
    };

    hydrateLightbox();

    return () => {
      isCancelled = true;
    };
  }, [currentIndex, isLightboxOpen, markGridLoaded, photos, preloadImage]);

  const setActivePhoto = useCallback((index, nextDirection = 0) => {
    if (!photos.length) {
      return;
    }

    const normalizedIndex = (index + photos.length) % photos.length;
    const nextPhoto = photos[normalizedIndex];

    setDirection(nextDirection);
    setImageLoaded(nextPhoto ? imageCacheRef.current.has(nextPhoto.src) : false);
    setCurrentIndex(normalizedIndex);
  }, [photos]);

  const nextPhoto = useCallback(() => {
    setActivePhoto(currentIndex + 1, 1);
  }, [currentIndex, setActivePhoto]);

  const prevPhoto = useCallback(() => {
    setActivePhoto(currentIndex - 1, -1);
  }, [currentIndex, setActivePhoto]);

  const handleKeyDown = useCallback((event) => {
    if (!isOpen) {
      return;
    }

    if (isLightboxOpen) {
      if (event.key === 'ArrowRight') {
        nextPhoto();
      }

      if (event.key === 'ArrowLeft') {
        prevPhoto();
      }

      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }

      return;
    }

    if (event.key === 'Escape') {
      handleCloseGallery();
    }
  }, [handleCloseGallery, isLightboxOpen, isOpen, nextPhoto, prevPhoto]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isOpen]);

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

  const handleTouchStart = useCallback((event) => {
    setTouchStart(event.touches[0].clientX);
    setTouchEnd(event.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((event) => {
    setTouchEnd(event.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      return;
    }

    const distance = touchStart - touchEnd;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance > 0) {
      nextPhoto();
    } else {
      prevPhoto();
    }

    setTouchStart(0);
    setTouchEnd(0);
  }, [nextPhoto, prevPhoto, touchEnd, touchStart]);

  const slideVariants = useMemo(() => ({
    enter: (currentDirection) => ({
      x: currentDirection > 0 ? '10%' : '-10%',
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (currentDirection) => ({
      x: currentDirection > 0 ? '-10%' : '10%',
      opacity: 0,
      scale: 0.98,
    }),
  }), []);

  const openLightbox = useCallback((index) => {
    const nextPhoto = photos[index];

    setDirection(0);
    setCurrentIndex(index);
    setImageLoaded(nextPhoto ? imageCacheRef.current.has(nextPhoto.src) : false);
    setIsLightboxOpen(true);
  }, [photos]);

  const selectedPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="gallery-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={(event) => {
            if (event.target === event.currentTarget && !isLightboxOpen) {
                  handleCloseGallery();
                }
              }}
        >
          <Motion.div
            className="gallery-container"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gallery-header">
              <div className="gallery-copy">
                <span className="gallery-kicker">Visual diary archive</span>
                <div>
                  <h2>影像 Diary</h2>
                  <p>把校园、旅途和日常的光影，整理成一页更有呼吸感的画册。</p>
                </div>
              </div>

              <div className="header-actions">
                <div className="photo-stat">
                  <strong>{photos.length}</strong>
                  <span>photos collected</span>
                </div>
                <button
                  className="gallery-close-btn"
                  onClick={handleCloseGallery}
                  aria-label="关闭影像 Diary"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="masonry-scroll-area">
              {status === 'loading' && (
                <div className="masonry-grid skeleton-grid" aria-hidden="true">
                  {SKELETON_RATIOS.map((ratio, index) => (
                    <div
                      key={`skeleton-${ratio}-${index}`}
                      className="skeleton-card"
                      style={{ '--aspect': ratio }}
                    />
                  ))}
                </div>
              )}

              {status === 'error' && (
                <div className="gallery-state-card">
                  <p>影像暂时没有加载成功，请稍后再试。</p>
                </div>
              )}

              {status !== 'loading' && status !== 'error' && photos.length > 0 && (
                <div className="masonry-grid">
                  {photos.map((photo, index) => {
                    const isLoaded = Boolean(gridLoadedImages[photo.src]);

                    return (
                      <Motion.button
                        key={photo.src}
                        type="button"
                        className={`masonry-item ${isLoaded ? 'is-loaded' : ''}`}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.22 }}
                        onClick={() => openLightbox(index)}
                      >
                        <div className="masonry-media">
                          {!isLoaded && <span className="masonry-shimmer" aria-hidden="true" />}
                          <img
                            src={photo.src}
                            alt={photo.caption || ''}
                            width={photo.width}
                            height={photo.height}
                            loading={index < FIRST_BATCH_COUNT ? 'eager' : 'lazy'}
                            fetchPriority={index < 4 ? 'high' : 'low'}
                            decoding="async"
                            onLoad={() => markGridLoaded(photo.src)}
                          />
                        </div>
                      </Motion.button>
                    );
                  })}
                </div>
              )}

              {status === 'ready' && photos.length === 0 && (
                <div className="gallery-state-card">
                  <p>影像库还没有内容，稍后从控制台加几张新图就会出现在这里。</p>
                </div>
              )}
            </div>
          </Motion.div>

          <AnimatePresence>
            {isLightboxOpen && selectedPhoto && (
              <Motion.div
                className="lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsLightboxOpen(false)}
              >
                <button
                  className="lightbox-close"
                  onClick={() => setIsLightboxOpen(false)}
                  aria-label="关闭大图预览"
                >
                  <X size={24} />
                </button>

                <div className="lightbox-shell">
                  <span className="lightbox-counter">
                    {currentIndex + 1} / {photos.length}
                  </span>

                  <div
                    className="lightbox-content"
                    onClick={(event) => event.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <button
                      className="lightbox-nav prev"
                      onClick={(event) => {
                        event.stopPropagation();
                        prevPhoto();
                      }}
                      aria-label="上一张"
                    >
                      <ChevronLeft size={28} />
                    </button>

                    <div className="lightbox-stage">
                      <AnimatePresence initial={false} custom={direction} mode="wait">
                        <Motion.div
                          key={selectedPhoto.src}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { type: 'tween', duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.12 },
                            scale: { duration: 0.18 },
                          }}
                          className="lightbox-image-wrapper"
                        >
                          {!imageLoaded && (
                            <div className="image-loader">
                              <div className="loader-spinner"></div>
                            </div>
                          )}
                          <img
                            src={selectedPhoto.src}
                            alt={selectedPhoto.caption || ''}
                            className={`lightbox-image ${imageLoaded ? 'loaded' : 'loading'}`}
                            decoding="async"
                            fetchPriority="high"
                            onLoad={() => {
                              markGridLoaded(selectedPhoto.src);
                              setImageLoaded(true);
                            }}
                          />
                        </Motion.div>
                      </AnimatePresence>
                    </div>

                    <button
                      className="lightbox-nav next"
                      onClick={(event) => {
                        event.stopPropagation();
                        nextPhoto();
                      }}
                      aria-label="下一张"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export default PhotoGallery;
