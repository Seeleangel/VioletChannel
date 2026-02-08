'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, Calendar, Edit, Save, Plus, Trash2, Image, Upload, ZoomIn } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAdmin } from '../hooks/useAdmin';
import './TravelMap.css';

// Dynamic import to avoid SSR issues with Three.js
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Initial travel destinations data
const initialTravelData = [
    {
        id: 1,
        name: '无锡',
        lat: 31.4906,
        lng: 120.3119,
        country: '中国',
        date: '2024年10月',
        description: '太湖风光，灵山大佛，鼋头渚的樱花美景',
        images: ['/img/compressed-DSC00292.jpg'],
        color: '#FF69B4'
    },
    {
        id: 2,
        name: '朱家尖',
        lat: 29.8833,
        lng: 122.3833,
        country: '中国',
        date: '2024年8月',
        description: '东海沙滩，碧海蓝天，海鲜美食',
        images: ['/img/compressed-DSC00306.jpg'],
        color: '#FFB6C1'
    },
    {
        id: 3,
        name: '上海',
        lat: 31.2304,
        lng: 121.4737,
        country: '中国',
        date: '2024年6月',
        description: '外滩夜景，迪士尼乐园，城市探索',
        images: ['/img/compressed-DSC00324.jpg'],
        color: '#FF1493'
    },
    {
        id: 4,
        name: '重庆',
        lat: 29.4316,
        lng: 106.9123,
        country: '中国',
        date: '2024年1月',
        description: '山城夜景，火锅美味，洪崖洞的璀璨灯光',
        images: ['/img/compressed-DSC00234.jpg'],
        color: '#DB7093'
    }
];

function TravelMap({ isOpen, onClose }) {
    const [travelData, setTravelData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [globeReady, setGlobeReady] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const globeRef = useRef();
    const fileInputRef = useRef();
    const { isAdmin } = useAdmin();

    // 确保只在客户端渲染
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 从后端加载旅行数据
    useEffect(() => {
        if (!isMounted) return;
        fetch('/api/travels')
            .then(res => res.json())
            .then(data => setTravelData(data))
            .catch(err => console.error('Failed to load travel data:', err));
    }, [isMounted]);

    // Point data for the globe
    const pointsData = useMemo(() => travelData.map(loc => ({
        ...loc,
        size: 0.8,
        color: loc.color
    })), [travelData]);

    useEffect(() => {
        if (isOpen && globeRef.current) {
            globeRef.current.pointOfView({ lat: 35, lng: 105, altitude: 2.5 }, 1000);
        }
    }, [isOpen, globeReady]);

    useEffect(() => {
        if (typeof window === 'undefined') return; // 服务器端跳过
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isEditing) {
                    setIsEditing(false);
                } else if (showAddForm) {
                    setShowAddForm(false);
                } else {
                    onClose();
                }
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, isEditing, showAddForm]);

    const handleEditClick = () => {
        setEditForm({
            name: selectedLocation.name,
            country: selectedLocation.country,
            date: selectedLocation.date,
            description: selectedLocation.description,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            color: selectedLocation.color,
            images: selectedLocation.images || []
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        const updatedLocation = {
            ...selectedLocation,
            ...editForm,
            lat: parseFloat(editForm.lat),
            lng: parseFloat(editForm.lng),
            images: editForm.images || []
        };
        
        try {
            const res = await fetch('/api/travels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedLocation)
            });
            
            if (res.ok) {
                const updated = await res.json();
                const updatedData = travelData.map(loc =>
                    loc.id === selectedLocation.id ? updated : loc
                );
                setTravelData(updatedData);
                setSelectedLocation(updated);
                setIsEditing(false);
            } else {
                alert('保存失败');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('保存出错');
        }
    };

    const handleDeleteLocation = async () => {
        if (confirm('确定要删除这个地点吗？')) {
            try {
                const res = await fetch(`/api/travels?id=${selectedLocation.id}`, {
                    method: 'DELETE'
                });
                
                if (res.ok) {
                    setTravelData(travelData.filter(loc => loc.id !== selectedLocation.id));
                    setSelectedLocation(null);
                } else {
                    alert('删除失败');
                }
            } catch (error) {
                console.error('Error deleting:', error);
                alert('删除出错');
            }
        }
    };

    const handleAddNew = () => {
        setEditForm({
            name: '',
            country: '中国',
            date: '',
            description: '',
            lat: 35,
            lng: 105,
            color: '#FF69B4',
            images: []
        });
        setShowAddForm(true);
    };

    const handleSaveNew = async () => {
        const newLocation = {
            ...editForm,
            lat: parseFloat(editForm.lat),
            lng: parseFloat(editForm.lng),
            images: editForm.images || []
        };
        
        try {
            const res = await fetch('/api/travels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation)
            });
            
            if (res.ok) {
                const created = await res.json();
                setTravelData([...travelData, created]);
                setShowAddForm(false);
                setSelectedLocation(created);
            } else {
                alert('添加失败');
            }
        } catch (error) {
            console.error('Error adding:', error);
            alert('添加出错');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setEditForm({
                    ...editForm,
                    images: [...(editForm.images || []), data.url]
                });
            } else {
                alert('上传失败');
            }
        } catch (error) {
            console.error(error);
            alert('上传出错');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (!isOpen) return null;
    
    // 服务器端或未挂载时不渲染
    if (!isMounted) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="travel-map-overlay"
                className="travel-map-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="travel-map-container"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="travel-map-header">
                        <div className="header-title">
                            <MapPin size={24} />
                            <h2>我的旅行足迹</h2>
                            <span className="location-count">{travelData.length} 个地点</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isAdmin && (
                                <button className="add-location-btn" onClick={handleAddNew}>
                                    <Plus size={18} /> 添加地点
                                </button>
                            )}
                            <button className="close-button" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Globe Container */}
                    <div className="globe-wrapper">
                        <Globe
                            ref={globeRef}
                            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                            pointsData={pointsData}
                            pointLat="lat"
                            pointLng="lng"
                            pointColor="color"
                            pointRadius="size"
                            pointAltitude={0.01}
                            pointLabel={(d) => `<div class="globe-label">${d.name}</div>`}
                            onPointClick={(point) => { setSelectedLocation(point); setIsEditing(false); }}
                            onGlobeReady={() => setGlobeReady(true)}
                            atmosphereColor="#FFB6C1"
                            atmosphereAltitude={0.15}
                            enablePointerInteraction={true}
                        />

                        {/* Location List Sidebar */}
                        <div className="location-sidebar">
                            <h3>探索记录</h3>
                            <div className="location-list">
                                {travelData.map((loc) => (
                                    <motion.div
                                        key={loc.id}
                                        className={`location-item ${selectedLocation?.id === loc.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedLocation(loc);
                                            setIsEditing(false);
                                            if (globeRef.current) {
                                                globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.5 }, 1000);
                                            }
                                        }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="location-marker" style={{ backgroundColor: loc.color }}></div>
                                        <div className="location-info">
                                            <span className="location-name">{loc.name}</span>
                                            <span className="location-date">{loc.date}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location Detail Panel */}
                    <AnimatePresence>
                        {selectedLocation && !isEditing && (
                            <motion.div
                                className="location-detail"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <div className="detail-header">
                                    <h3>{selectedLocation.name}</h3>
                                    <span className="detail-country">{selectedLocation.country}</span>
                                </div>
                                <div className="detail-meta">
                                    <span><Calendar size={14} /> {selectedLocation.date}</span>
                                </div>
                                <p className="detail-description">{selectedLocation.description}</p>
                                {selectedLocation.images && selectedLocation.images.length > 0 && (
                                    <div className="detail-images">
                                        {selectedLocation.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={selectedLocation.name} />
                                        ))}
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="detail-actions">
                                        <button className="edit-btn" onClick={handleEditClick}>
                                            <Edit size={16} /> 编辑
                                        </button>
                                        <button className="delete-btn" onClick={handleDeleteLocation}>
                                            <Trash2 size={16} /> 删除
                                        </button>
                                        <button className="detail-close" onClick={() => setSelectedLocation(null)}>
                                            关闭
                                        </button>
                                    </div>
                                )}
                                {!isAdmin && (
                                    <div className="detail-actions">
                                        <button className="detail-close" onClick={() => setSelectedLocation(null)}>
                                            关闭
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Edit Form Panel */}
                    <AnimatePresence>
                        {isEditing && selectedLocation && (
                            <motion.div
                                className="location-detail edit-mode"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <h3 className="edit-title">编辑地点信息</h3>
                                <div className="edit-form">
                                    <div className="form-row">
                                        <label>地点名称</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>国家/地区</label>
                                        <input
                                            type="text"
                                            value={editForm.country}
                                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>日期</label>
                                        <input
                                            type="text"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            placeholder="例如：2024年10月"
                                        />
                                    </div>
                                    <div className="form-row coords">
                                        <div>
                                            <label>纬度</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={editForm.lat}
                                                onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label>经度</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={editForm.lng}
                                                onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <label>标记颜色</label>
                                        <input
                                            type="color"
                                            value={editForm.color}
                                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                            style={{ width: '60px', height: '36px', padding: '2px' }}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>描述</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label><Image size={14} style={{ marginRight: '4px' }} />图片管理</label>
                                        <div className="image-manager">
                                            {editForm.images && editForm.images.length > 0 && (
                                                <div className="image-preview-list">
                                                    {editForm.images.map((img, idx) => (
                                                        <div key={idx} className="image-preview-item">
                                                            <img
                                                                src={img}
                                                                alt={`图片 ${idx + 1}`}
                                                                onClick={() => setLightboxImage(img)}
                                                            />
                                                            <div className="image-zoom-icon" onClick={() => setLightboxImage(img)}>
                                                                <ZoomIn size={12} />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-image-btn"
                                                                onClick={() => {
                                                                    const newImages = editForm.images.filter((_, i) => i !== idx);
                                                                    setEditForm({ ...editForm, images: newImages });
                                                                }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="add-image-row">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="add-image-btn upload-btn"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                >
                                                    <Upload size={16} /> {uploading ? '上传中...' : '上传图片'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-actions">
                                    <button className="save-btn" onClick={handleSaveEdit}>
                                        <Save size={16} /> 保存
                                    </button>
                                    <button className="detail-close" onClick={() => setIsEditing(false)}>
                                        取消
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Add New Location Form */}
                    <AnimatePresence>
                        {showAddForm && (
                            <motion.div
                                className="location-detail edit-mode"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <h3 className="edit-title">添加新地点</h3>
                                <div className="edit-form">
                                    <div className="form-row">
                                        <label>地点名称</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="例如：北京"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>国家/地区</label>
                                        <input
                                            type="text"
                                            value={editForm.country}
                                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>日期</label>
                                        <input
                                            type="text"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            placeholder="例如：2024年10月"
                                        />
                                    </div>
                                    <div className="form-row coords">
                                        <div>
                                            <label>纬度</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={editForm.lat}
                                                onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label>经度</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={editForm.lng}
                                                onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <label>标记颜色</label>
                                        <input
                                            type="color"
                                            value={editForm.color}
                                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                            style={{ width: '60px', height: '36px', padding: '2px' }}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>描述</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            rows="3"
                                            placeholder="描述这次旅行的美好回忆..."
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label><Image size={14} style={{ marginRight: '4px' }} />图片管理</label>
                                        <div className="image-manager">
                                            {editForm.images && editForm.images.length > 0 && (
                                                <div className="image-preview-list">
                                                    {editForm.images.map((img, idx) => (
                                                        <div key={idx} className="image-preview-item">
                                                            <img
                                                                src={img}
                                                                alt={`图片 ${idx + 1}`}
                                                                onClick={() => setLightboxImage(img)}
                                                            />
                                                            <div className="image-zoom-icon" onClick={() => setLightboxImage(img)}>
                                                                <ZoomIn size={12} />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-image-btn"
                                                                onClick={() => {
                                                                    const newImages = editForm.images.filter((_, i) => i !== idx);
                                                                    setEditForm({ ...editForm, images: newImages });
                                                                }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="add-image-row">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="add-image-btn upload-btn"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                >
                                                    <Upload size={16} /> {uploading ? '上传中...' : '上传图片'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-actions">
                                    <button className="save-btn" onClick={handleSaveNew}>
                                        <Plus size={16} /> 添加
                                    </button>
                                    <button className="detail-close" onClick={() => setShowAddForm(false)}>
                                        取消
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* Lightbox for viewing full-size images */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        key="image-lightbox"
                        className="image-lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                    >
                        <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
                            <X size={28} />
                        </button>
                        <motion.img
                            src={lightboxImage}
                            alt="Full size"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}

export default TravelMap;
