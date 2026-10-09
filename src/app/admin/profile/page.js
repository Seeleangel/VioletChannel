'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, User } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './profile.css';

export default function ProfileManagement() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [profile, setProfile] = useState({
    aboutMe: {
      image: '/img/aboutme.jpg',
      name: '',
      subtitle: '',
      paragraphs: [],
    },
    basicInfo: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    loadProfile();
  }, [checkAuth]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        alert('个人资料已保存');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addParagraph = () => {
    setProfile({
      ...profile,
      aboutMe: {
        ...profile.aboutMe,
        paragraphs: [...profile.aboutMe.paragraphs, ''],
      },
    });
  };

  const removeParagraph = (index) => {
    const newParagraphs = profile.aboutMe.paragraphs.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      aboutMe: {
        ...profile.aboutMe,
        paragraphs: newParagraphs,
      },
    });
  };

  const updateParagraph = (index, value) => {
    const newParagraphs = [...profile.aboutMe.paragraphs];
    newParagraphs[index] = value;
    setProfile({
      ...profile,
      aboutMe: {
        ...profile.aboutMe,
        paragraphs: newParagraphs,
      },
    });
  };

  const addBasicInfo = () => {
    setProfile({
      ...profile,
      basicInfo: [
        ...profile.basicInfo,
        { label: '', value: '', icon: '📝' },
      ],
    });
  };

  const removeBasicInfo = (index) => {
    const newBasicInfo = profile.basicInfo.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      basicInfo: newBasicInfo,
    });
  };

  const updateBasicInfo = (index, field, value) => {
    const newBasicInfo = [...profile.basicInfo];
    newBasicInfo[index] = {
      ...newBasicInfo[index],
      [field]: value,
    };
    setProfile({
      ...profile,
      basicInfo: newBasicInfo,
    });
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
      <motion.div
        className="profile-management"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <div>
            <h1>个人资料管理</h1>
            <p className="subtitle">编辑首页的 About Me 和 Basic Information</p>
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={20} />
            {saving ? '保存中...' : '保存更改'}
          </button>
        </div>

        {/* About Me 部分 */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <User size={22} />
              About Me
            </h2>
          </div>

          <div className="form-group">
            <label htmlFor="aboutImage">头像图片路径</label>
            <input
              id="aboutImage"
              type="text"
              value={profile.aboutMe.image}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  aboutMe: { ...profile.aboutMe, image: e.target.value },
                })
              }
              placeholder="/img/aboutme.jpg"
            />
            {profile.aboutMe.image && (
              <div className="image-preview-wrapper">
                <div className="image-preview">
                  <img src={profile.aboutMe.image} alt="Preview" />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="aboutName">姓名</label>
            <input
              id="aboutName"
              type="text"
              value={profile.aboutMe.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  aboutMe: { ...profile.aboutMe, name: e.target.value },
                })
              }
              placeholder="Uiolet 魏宏涛"
            />
          </div>

          <div className="form-group">
            <label htmlFor="aboutSubtitle">副标题</label>
            <input
              id="aboutSubtitle"
              type="text"
              value={profile.aboutMe.subtitle}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  aboutMe: { ...profile.aboutMe, subtitle: e.target.value },
                })
              }
              placeholder="（来财版·幸福版·快乐版）"
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label>个人介绍段落</label>
              <button onClick={addParagraph} className="btn-secondary btn-sm">
                <Plus size={16} />
                添加段落
              </button>
            </div>
            {profile.aboutMe.paragraphs.length === 0 ? (
              <div className="empty-paragraphs">
                <p>还没有添加任何段落</p>
                <button onClick={addParagraph} className="btn-secondary btn-sm">
                  <Plus size={16} />
                  添加第一个段落
                </button>
              </div>
            ) : (
              profile.aboutMe.paragraphs.map((paragraph, index) => (
                <motion.div
                  key={index}
                  className="paragraph-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="paragraph-number">{index + 1}</div>
                  <textarea
                    value={paragraph}
                    onChange={(e) => updateParagraph(index, e.target.value)}
                    placeholder={`段落 ${index + 1}`}
                    rows="4"
                  />
                  <button
                    onClick={() => removeParagraph(index)}
                    className="btn-icon-danger"
                    title="删除段落"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Basic Information 部分 */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="admin-card-header">
            <h2 className="admin-card-title">Basic Information</h2>
            <button onClick={addBasicInfo} className="btn-secondary">
              <Plus size={20} />
              添加信息项
            </button>
          </div>

          <div className="basic-info-list">
            {profile.basicInfo.map((item, index) => (
              <motion.div
                key={index}
                className="basic-info-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="info-row">
                  <div className="form-group small">
                    <label>图标 Emoji</label>
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => updateBasicInfo(index, 'icon', e.target.value)}
                      placeholder="🤗"
                      maxLength={2}
                    />
                  </div>
                  <div className="form-group small">
                    <label>标签</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateBasicInfo(index, 'label', e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="form-group flex-grow">
                    <label>内容</label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateBasicInfo(index, 'value', e.target.value)}
                      placeholder="Uiolet 魏宏涛"
                    />
                  </div>
                  <button
                    onClick={() => removeBasicInfo(index)}
                    className="btn-icon-danger"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 保存按钮 */}
        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={20} />
            {saving ? '保存中...' : '保存所有更改'}
          </button>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
