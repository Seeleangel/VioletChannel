'use client';

import Image from 'next/image';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Check,
  Download,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './images.css';

const INITIAL_LOAD_COUNT = 72;
const LOAD_MORE_COUNT = 48;

function formatBytes(bytes = 0) {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value) {
  if (!value) {
    return '刚刚添加';
  }

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return '最近添加';
  }
}

function fileSignature(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeUniqueImages(current, incoming) {
  const seen = new Set();
  const merged = [];

  [...current, ...incoming].forEach((item) => {
    if (!item?.src || seen.has(item.src)) {
      return;
    }

    seen.add(item.src);
    merged.push(item);
  });

  return merged;
}

export default function ImagesManagement() {
  const { isAdmin, loading: authLoading } = useAdmin({ redirectOnFail: true });
  const fileInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isFetchingRef = useRef(false);
  const imagesRef = useRef([]);
  const totalCountRef = useRef(0);
  const [images, setImages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [notice, setNotice] = useState(null);
  const [deletingImages, setDeletingImages] = useState([]);

  const selectedSet = useMemo(() => new Set(selectedImages), [selectedImages]);
  const deletingSet = useMemo(() => new Set(deletingImages), [deletingImages]);
  const totalQueuedSize = useMemo(
    () => queuedFiles.reduce((sum, item) => sum + item.size, 0),
    [queuedFiles],
  );

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    totalCountRef.current = totalCount;
  }, [totalCount]);

  const pushNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const loadImages = useCallback(async ({ reset = false, silent = false } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    if (reset) {
      if (silent && imagesRef.current.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }

    const currentImages = imagesRef.current;
    const offset = reset ? 0 : currentImages.length;
    const limit = reset ? INITIAL_LOAD_COUNT : LOAD_MORE_COUNT;

    try {
      const response = await fetch(`/api/images/list?offset=${offset}&limit=${limit}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load images');
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      const nextTotal = typeof data?.total === 'number' ? data.total : items.length;
      const nextHasMore = Boolean(data?.hasMore);
      const nextImages = reset ? items : mergeUniqueImages(currentImages, items);

      startTransition(() => {
        setImages(nextImages);
        setTotalCount(nextTotal);
        setHasMore(nextHasMore);
        setSelectedImages((prev) => {
          const nextSet = new Set(nextImages.map((image) => image.src));
          return prev.filter((path) => nextSet.has(path));
        });
      });
    } catch (error) {
      console.error('Failed to load images:', error);
      pushNotice('error', '图片列表加载失败，请稍后重试。');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [pushNotice]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => () => {
    queuedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
  }, [queuedFiles]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadImages({ reset: true });
    }
  }, [authLoading, isAdmin, loadImages]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) {
      return undefined;
    }

    const target = loadMoreRef.current;

    if (!target) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadImages();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loadImages, loading, loadingMore]);

  const clearQueuedFiles = useCallback(() => {
    queuedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setQueuedFiles([]);
  }, [queuedFiles]);

  const appendFilesToQueue = useCallback((fileList) => {
    const nextFiles = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));

    if (!nextFiles.length) {
      return;
    }

    setQueuedFiles((prev) => {
      const existing = new Set(prev.map((item) => item.signature));
      const additions = nextFiles
        .filter((file) => !existing.has(fileSignature(file)))
        .map((file) => ({
          id: `${fileSignature(file)}-${Date.now()}`,
          signature: fileSignature(file),
          file,
          name: file.name,
          size: file.size,
          preview: URL.createObjectURL(file),
        }));

      return [...prev, ...additions];
    });
  }, []);

  const handleFileSelection = useCallback((event) => {
    appendFilesToQueue(event.target.files);
    event.target.value = '';
  }, [appendFilesToQueue]);

  const handleUpload = useCallback(async () => {
    if (!queuedFiles.length) {
      pushNotice('info', '先选择几张图片，再添加到图库。');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('collection', 'gallery');
    queuedFiles.forEach((item) => {
      formData.append('images', item.file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const uploadedImages = Array.isArray(result.uploaded)
        ? result.uploaded.map((item) => ({
            src: item.src || item.url,
            caption: item.caption || item.name || '',
            filename: item.filename || item.name || '',
            addedAt: item.addedAt,
            source: item.source || 'gallery-upload',
            deletable: item.deletable !== false,
            width: item.width || 1200,
            height: item.height || 1500,
            aspectRatio: item.aspectRatio || (item.width && item.height ? item.width / item.height : 1),
          }))
        : [];

      clearQueuedFiles();

      const currentImages = imagesRef.current;
      const nextImages = mergeUniqueImages(uploadedImages, currentImages);
      const nextTotalCount = totalCountRef.current + uploadedImages.length;

      startTransition(() => {
        setImages(nextImages);
        setTotalCount(nextTotalCount);
        setHasMore(nextImages.length < nextTotalCount);
      });

      pushNotice('success', `已添加 ${uploadedImages.length} 张图片。`);
    } catch (error) {
      console.error('Failed to upload images:', error);
      pushNotice('error', '上传失败，请稍后重试。');
    } finally {
      setUploading(false);
    }
  }, [clearQueuedFiles, pushNotice, queuedFiles]);

  const handleDelete = useCallback(async (image) => {
    const label = image.filename || image.caption || image.src;

    if (!window.confirm(`确认删除 ${label} 吗？`)) {
      return;
    }

    setDeletingImages((prev) => [...new Set([...prev, image.src])]);

    try {
      const response = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: image.src }),
      });
      const result = await response.json();

      if (!response.ok || !Array.isArray(result.deleted) || result.deleted.length === 0) {
        throw new Error(result.error || 'Delete failed');
      }

      startTransition(() => {
        setImages((prev) => prev.filter((item) => item.src !== image.src));
        setSelectedImages((prev) => prev.filter((path) => path !== image.src));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setPreviewImage((prev) => (prev?.src === image.src ? null : prev));
      });

      pushNotice('success', '图片已删除。');
    } catch (error) {
      console.error('Failed to delete image:', error);
      pushNotice('error', '删除失败，请稍后再试。');
    } finally {
      setDeletingImages((prev) => prev.filter((path) => path !== image.src));
    }
  }, [pushNotice]);

  const handleBatchDelete = useCallback(async () => {
    if (!selectedImages.length) {
      return;
    }

    if (!window.confirm(`确认删除选中的 ${selectedImages.length} 张图片吗？`)) {
      return;
    }

    const pendingPaths = [...selectedImages];
    setDeletingImages((prev) => [...new Set([...prev, ...pendingPaths])]);

    try {
      const response = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: pendingPaths }),
      });
      const result = await response.json();
      const deleted = Array.isArray(result?.deleted) ? result.deleted : [];
      const failed = Array.isArray(result?.failed) ? result.failed.map((item) => item.path) : [];

      if (!response.ok && deleted.length === 0) {
        throw new Error(result?.error || 'Batch delete failed');
      }

      startTransition(() => {
        if (deleted.length > 0) {
          const deletedSet = new Set(deleted);
          setImages((prev) => prev.filter((item) => !deletedSet.has(item.src)));
          setSelectedImages(failed);
          setTotalCount((prev) => Math.max(0, prev - deleted.length));
          setPreviewImage((prev) => (prev && deletedSet.has(prev.src) ? null : prev));
        }
      });

      if (failed.length === 0) {
        pushNotice('success', `已删除 ${deleted.length} 张图片。`);
      } else {
        pushNotice('error', `删除了 ${deleted.length} 张，仍有 ${failed.length} 张失败。`);
      }
    } catch (error) {
      console.error('Failed to batch delete:', error);
      pushNotice('error', '批量删除失败，请稍后重试。');
    } finally {
      setDeletingImages((prev) => prev.filter((path) => !pendingPaths.includes(path)));
    }
  }, [pushNotice, selectedImages]);

  const toggleSelectImage = useCallback((image) => {
    setSelectedImages((prev) => (
      prev.includes(image.src)
        ? prev.filter((path) => path !== image.src)
        : [...prev, image.src]
    ));
  }, []);

  const removeQueuedFile = useCallback((id) => {
    setQueuedFiles((prev) => {
      const target = prev.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.preview);
      }

      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setDragActive(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragActive(false);
    appendFilesToQueue(event.dataTransfer.files);
  }, [appendFilesToQueue]);

  if (authLoading || (loading && images.length === 0) || !isAdmin) {
    return (
      <AdminLayout>
        <div className="images-loading">
          <div className="images-loading-spinner"></div>
          <p>正在整理影像库...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="images-management">
        <section className="images-hero">
          <div className="hero-copy">
            <span className="hero-kicker">Visual archive console</span>
            <h1>图片管理</h1>
            <p>现在会优先加载缩略图，并按批次增量渲染，图片再多也不会一进页面就整库卡住。</p>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-value">{totalCount}</span>
              <span className="metric-label">图库总数</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{queuedFiles.length}</span>
              <span className="metric-label">待上传</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{selectedImages.length}</span>
              <span className="metric-label">已选中</span>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {notice && (
            <Motion.div
              className={`status-banner ${notice.type}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <span>{notice.message}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="关闭提示">
                <X size={16} />
              </button>
            </Motion.div>
          )}
        </AnimatePresence>

        <section className="upload-studio">
          <div className="studio-header">
            <div>
              <span className="studio-kicker">Add new frames</span>
              <h2>添加图片</h2>
              <p>支持多选和拖拽，上传成功后会直接插入当前列表，不再整页重新拉取。</p>
            </div>

            <div className="studio-actions">
              <button
                type="button"
                className="btn-secondary studio-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={18} />
                选择图片
              </button>
              <button
                type="button"
                className="btn-primary studio-button"
                onClick={handleUpload}
                disabled={uploading || queuedFiles.length === 0}
              >
                <Upload size={18} />
                {uploading ? '上传中...' : `上传到图库${queuedFiles.length ? ` (${queuedFiles.length})` : ''}`}
              </button>
            </div>
          </div>

          <div
            className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-orb"></div>
            <Sparkles size={28} />
            <h3>把图片拖到这里</h3>
            <p>上传时仍会自动压缩大图，但返回列表改成局部更新，避免整库反复重绘。</p>
            <div className="dropzone-meta">
              <span>{queuedFiles.length} 张待上传</span>
              <span>{formatBytes(totalQueuedSize)}</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelection}
            hidden
          />

          {queuedFiles.length > 0 && (
            <div className="queue-panel">
              <div className="queue-header">
                <div>
                  <h3>待上传预览</h3>
                  <p>{queuedFiles.length} 张图片已进入暂存区</p>
                </div>
                <button type="button" className="queue-clear-btn" onClick={clearQueuedFiles}>
                  清空
                </button>
              </div>

              <div className="queue-grid">
                {queuedFiles.map((item) => (
                  <div key={item.id} className="queue-card">
                    <img src={item.preview} alt={item.name} loading="lazy" />
                    <button
                      type="button"
                      className="queue-remove-btn"
                      onClick={() => removeQueuedFile(item.id)}
                      aria-label={`移除 ${item.name}`}
                    >
                      <X size={14} />
                    </button>
                    <div className="queue-card-info">
                      <strong title={item.name}>{item.name}</strong>
                      <span>{formatBytes(item.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="library-shell">
          <div className="library-toolbar">
            <div>
              <span className="library-kicker">Thumbnail browser</span>
              <h2>当前图库</h2>
              <p className="library-summary">
                已加载 {images.length} / {totalCount} 张
                {refreshing ? '，正在同步最新内容…' : '，滚动到底会继续加载。'}
              </p>
            </div>

            <div className="library-actions">
              <button
                type="button"
                className="btn-secondary tool-button"
                onClick={() => loadImages({ reset: true, silent: true })}
                disabled={refreshing || loadingMore}
              >
                <RefreshCw size={16} />
                {refreshing ? '同步中...' : '刷新'}
              </button>
              {selectedImages.length > 0 && (
                <button type="button" className="btn-danger tool-button" onClick={handleBatchDelete}>
                  <Trash2 size={16} />
                  删除选中 ({selectedImages.length})
                </button>
              )}
            </div>
          </div>

          {images.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={44} />
              <h3>图库还是空的</h3>
              <p>先从上面添加几张图片，上传后会立刻出现在这里。</p>
              <button
                type="button"
                className="btn-primary studio-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                现在添加图片
              </button>
            </div>
          ) : (
            <>
              <div className="images-grid">
                {images.map((image) => {
                  const isSelected = selectedSet.has(image.src);
                  const isDeleting = deletingSet.has(image.src);

                  return (
                    <article
                      key={image.src}
                      className={`image-card ${isSelected ? 'selected' : ''} ${isDeleting ? 'is-deleting' : ''}`}
                    >
                      <div className="image-card-top">
                        <button
                          type="button"
                          className={`image-selector ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSelectImage(image)}
                          aria-label="选择图片"
                          disabled={isDeleting}
                        >
                          {isSelected ? <Check size={14} /> : null}
                        </button>

                        <button
                          type="button"
                          className="image-delete-btn"
                          onClick={() => handleDelete(image)}
                          aria-label={`删除 ${image.filename}`}
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="image-wrapper"
                        onClick={() => setPreviewImage(image)}
                        disabled={isDeleting}
                      >
                        <Image
                          src={image.src}
                          alt={image.filename || image.caption || ''}
                          fill
                          sizes="(max-width: 768px) 28vw, (max-width: 1200px) 16vw, 148px"
                        />
                      </button>

                      <div className="image-card-body">
                        <div className="image-copy">
                          <h3 title={image.filename}>{image.filename}</h3>
                          <p>{formatDate(image.addedAt)}</p>
                        </div>

                        <div className="image-actions">
                          <a
                            href={image.src}
                            download
                            className="action-chip"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Download size={14} />
                            下载
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="library-footer">
                {hasMore ? (
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={() => loadImages()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? '继续加载中...' : '加载更多缩略图'}
                  </button>
                ) : (
                  <span className="load-more-hint">已经加载完全部图片</span>
                )}
              </div>

              <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />
            </>
          )}
        </section>

        <AnimatePresence>
          {previewImage && (
            <Motion.div
              className="preview-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
            >
              <Motion.div
                className="preview-content"
                initial={{ scale: 0.98, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 10 }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="preview-close"
                  onClick={() => setPreviewImage(null)}
                  aria-label="关闭预览"
                >
                  <X size={20} />
                </button>

                <div className="preview-image-shell">
                  <Image
                    src={previewImage.src}
                    alt={previewImage.filename || previewImage.caption || ''}
                    fill
                    priority
                    sizes="90vw"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <div className="preview-meta">
                  <div>
                    <span>{previewImage.source === 'gallery-upload' ? '控制台新增' : '图库图片'}</span>
                    <h3>{previewImage.filename || '未命名图片'}</h3>
                    <p>{formatDate(previewImage.addedAt)}</p>
                  </div>

                  <div className="preview-actions">
                    <a href={previewImage.src} download className="action-chip">
                      <Download size={14} />
                      下载
                    </a>
                    <button
                      type="button"
                      className="action-chip danger"
                      onClick={() => handleDelete(previewImage)}
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </div>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
