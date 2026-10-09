'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './travels.css';

export default function TravelsManagement() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [travels, setTravels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    checkAuth();
    loadTravels();
  }, [checkAuth]);

  const loadTravels = async () => {
    try {
      const response = await fetch('/api/travels');
      const data = await response.json();
      setTravels(data);
    } catch (error) {
      console.error('Failed to load travels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (travel = null) => {
    if (travel) {
      setEditingTravel(travel);
      setFormData({
        name: travel.name,
        lat: travel.lat,
        lng: travel.lng,
        date: travel.date || '',
        description: travel.description || '',
      });
    } else {
      setEditingTravel(null);
      setFormData({
        name: '',
        lat: '',
        lng: '',
        date: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTravel(null);
    setFormData({
      name: '',
      lat: '',
      lng: '',
      date: '',
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const travelData = {
      name: formData.name,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      date: formData.date,
      description: formData.description,
    };

    try {
      if (editingTravel) {
        // 更新
        const response = await fetch(`/api/travels/${editingTravel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(travelData),
        });

        if (response.ok) {
          alert('旅行足迹已更新');
          loadTravels();
          handleCloseModal();
        }
      } else {
        // 新增
        const response = await fetch('/api/travels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(travelData),
        });

        if (response.ok) {
          alert('旅行足迹已添加');
          loadTravels();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Failed to save travel:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条旅行足迹吗？')) return;

    try {
      const response = await fetch(`/api/travels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTravels(travels.filter(t => t.id !== id));
        alert('已删除');
      }
    } catch (error) {
      console.error('Failed to delete travel:', error);
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
      <div className="travels-management">
        <div className="page-header">
          <div>
            <h1>旅行管理</h1>
            <p className="subtitle">管理你的旅行足迹</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} />
            添加旅行
          </button>
        </div>

        {travels.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} />
            <p>还没有旅行足迹</p>
            <button onClick={() => handleOpenModal()} className="btn-secondary">
              <Plus size={20} />
              添加第一个足迹
            </button>
          </div>
        ) : (
          <div className="travels-grid">
            {travels.map((travel, index) => (
              <motion.div
                key={travel.id}
                className="travel-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="travel-header">
                  <MapPin size={24} className="travel-icon" />
                  <h3>{travel.name}</h3>
                </div>

                <div className="travel-info">
                  <div className="info-row">
                    <span className="label">经纬度:</span>
                    <span className="value">{travel.lat}, {travel.lng}</span>
                  </div>
                  {travel.date && (
                    <div className="info-row">
                      <Calendar size={16} />
                      <span className="value">{travel.date}</span>
                    </div>
                  )}
                  {travel.description && (
                    <div className="info-row description">
                      <p>{travel.description}</p>
                    </div>
                  )}
                </div>

                <div className="travel-actions">
                  <button
                    onClick={() => handleOpenModal(travel)}
                    className="action-btn edit"
                  >
                    <Edit2 size={16} />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(travel.id)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                    删除
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
                  <h2>{editingTravel ? '编辑旅行' : '添加旅行'}</h2>
                  <button onClick={handleCloseModal} className="close-btn">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">城市名称 *</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="例如：上海"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="lat">纬度 *</label>
                      <input
                        id="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        required
                        placeholder="31.2304"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lng">经度 *</label>
                      <input
                        id="lng"
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        required
                        placeholder="121.4737"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">日期</label>
                    <input
                      id="date"
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="例如：2024年夏天"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">描述</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="分享一些旅行的回忆..."
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleCloseModal} className="btn-secondary">
                      取消
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingTravel ? '保存' : '添加'}
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
