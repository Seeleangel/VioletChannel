'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Music,
  Play,
  X
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './music.css';

export default function MusicManagement() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [musicList, setMusicList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: '',
    cover: '',
  });

  useEffect(() => {
    checkAuth();
    loadMusic();
  }, [checkAuth]);

  const loadMusic = async () => {
    try {
      const response = await fetch('/api/music');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMusicList(data);
        setLoadError('');
      } else {
        setMusicList([]);
        setLoadError('音乐数据加载失败，请稍后重试');
      }
    } catch (error) {
      console.error('Failed to load music:', error);
      setMusicList([]);
      setLoadError('音乐数据加载失败，请检查接口');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (music = null) => {
    if (music) {
      setEditingMusic(music);
      setFormData({
        title: music.title,
        artist: music.artist,
        url: music.url,
        cover: music.cover || '',
      });
    } else {
      setEditingMusic(null);
      setFormData({
        title: '',
        artist: '',
        url: '',
        cover: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMusic(null);
    setFormData({
      title: '',
      artist: '',
      url: '',
      cover: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMusic) {
        // 更新
        const response = await fetch(`/api/music/${editingMusic.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('音乐已更新');
          loadMusic();
          handleCloseModal();
        }
      } else {
        // 新增
        const response = await fetch('/api/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('音乐已添加');
          loadMusic();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Failed to save music:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这首音乐吗？')) return;

    try {
      const response = await fetch(`/api/music/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMusicList(musicList.filter(m => m.id !== id));
        alert('已删除');
      }
    } catch (error) {
      console.error('Failed to delete music:', error);
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="music-management">
        <div className="page-header">
          <div>
            <h1>音乐管理</h1>
            <p className="subtitle">管理你的音乐收藏</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} />
            添加音乐
          </button>
        </div>

        <div className="music-stats">
          <div className="stat-card">
            <Music size={18} />
            <div>
              <span className="stat-label">当前曲目</span>
              <strong>{musicList.length}</strong>
            </div>
          </div>
          <div className="stat-card muted">
            <Play size={18} />
            <div>
              <span className="stat-label">数据来源</span>
              <strong>data/music.json</strong>
            </div>
          </div>
        </div>

        {loadError && <div className="music-error-banner">{loadError}</div>}

        {musicList.length === 0 ? (
          <div className="empty-state">
            <Music size={48} />
            <p>还没有添加音乐</p>
            <span>系统会自动从 public/music 同步到数据库</span>
            <button onClick={() => handleOpenModal()} className="btn-secondary">
              <Plus size={20} />
              添加第一首音乐
            </button>
          </div>
        ) : (
          <div className="music-list">
            {musicList.map((music, index) => (
              <motion.div
                key={music.id}
                className="music-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {music.cover && (
                  <div className="music-cover">
                    <img src={music.cover} alt={music.title} />
                    <div className="play-overlay">
                      <Play size={24} />
                    </div>
                  </div>
                )}

                <div className="music-info">
                  <h3>{music.title}</h3>
                  <p>{music.artist}</p>
                  <span className="music-url">{music.url}</span>
                </div>

                <div className="music-actions">
                  <button
                    onClick={() => handleOpenModal(music)}
                    className="action-btn edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(music.id)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 添加/编辑 Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingMusic ? '编辑音乐' : '添加音乐'}</h2>
                  <button onClick={handleCloseModal} className="close-btn">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">歌曲名称 *</label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="例如：夜曲"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="artist">艺术家 *</label>
                    <input
                      id="artist"
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      required
                      placeholder="例如：周杰伦"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="url">音乐链接 *</label>
                    <input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cover">封面图片链接</label>
                    <input
                      id="cover"
                      type="url"
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleCloseModal} className="btn-secondary">
                      取消
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingMusic ? '保存' : '添加'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
