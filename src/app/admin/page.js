'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MapPin,
  Image,
  Mail,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../hooks/useAdmin';
import './dashboard.css';

export default function AdminDashboard() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [stats, setStats] = useState({
    posts: 0,
    travels: 0,
    images: 0,
    contacts: 0,
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, [checkAuth]);

  const loadDashboardData = async () => {
    try {
      // 加载统计数据
      const [postsRes, travelsRes, imagesRes, contactsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/travels'),
        fetch('/api/images/list'),
        fetch('/api/contacts'),
      ]);

      const posts = await postsRes.json();
      const travels = await travelsRes.json();
      const images = await imagesRes.json();
      const contacts = await contactsRes.json();

      setStats({
        posts: posts.length || 0,
        travels: travels.length || 0,
        images: images.length || 0,
        contacts: contacts.length || 0,
      });

      // 获取最近3条联系表单
      setRecentContacts(contacts.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FileText,
      label: '博客文章',
      value: stats.posts,
      color: '#667eea',
      link: '/admin/blog',
    },
    {
      icon: MapPin,
      label: '旅行足迹',
      value: stats.travels,
      color: '#f093fb',
      link: '/admin/travels',
    },
    {
      icon: Image,
      label: '图片数量',
      value: stats.images,
      color: '#4facfe',
      link: '/admin/images',
    },
    {
      icon: Mail,
      label: '联系表单',
      value: stats.contacts,
      color: '#fa709a',
      link: '/admin/contacts',
    },
  ];

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
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>仪表盘</h1>
          <p className="subtitle">欢迎回来，Violet ✨</p>
        </div>

        {/* 统计卡片 */}
        <div className="stats-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.a
                key={card.label}
                href={card.link}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ '--card-color': card.color }}
              >
                <div className="stat-icon" style={{ background: card.color }}>
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
                <TrendingUp className="stat-trend" size={20} />
              </motion.a>
            );
          })}
        </div>

        {/* 最近的联系表单 */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <Mail size={20} />
              最近的联系表单
            </h2>
            <a href="/admin/contacts" className="view-all">
              查看全部 →
            </a>
          </div>

          {recentContacts.length === 0 ? (
            <p className="empty-state">暂无联系表单</p>
          ) : (
            <div className="contacts-list">
              {recentContacts.map((contact) => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-header">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-time">
                      <Clock size={14} />
                      {new Date(contact.timestamp).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div className="contact-info">
                    <span>{contact.contact}</span>
                    {!contact.read && <span className="unread-badge">未读</span>}
                  </div>
                  <div className="contact-message">{contact.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="quick-actions">
          <h2 className="section-title">快捷操作</h2>
          <div className="actions-grid">
            <a href="/blog/new" className="action-btn">
              <FileText size={20} />
              <span>写新文章</span>
            </a>
            <a href="/admin/travels" className="action-btn">
              <MapPin size={20} />
              <span>添加旅行</span>
            </a>
            <a href="/admin/images" className="action-btn">
              <Image size={20} />
              <span>上传图片</span>
            </a>
            <a href="/" className="action-btn">
              <Eye size={20} />
              <span>查看网站</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
