'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  Tag
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './blog.css';

export default function BlogManagement() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadPosts();
  }, [checkAuth]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchTerm, posts]);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
        alert('文章已删除');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
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
      <div className="blog-management">
        <div className="page-header">
          <div>
            <h1>博客管理</h1>
            <p className="subtitle">管理你的所有博客文章</p>
          </div>
          <a href="/blog/new" className="btn-primary">
            <Plus size={20} />
            写新文章
          </a>
        </div>

        {/* 搜索栏 */}
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="搜索文章标题、内容或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 文章列表 */}
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <p>暂无文章</p>
            <a href="/blog/new" className="btn-secondary">
              <Plus size={20} />
              创建第一篇文章
            </a>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="post-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {post.coverImage && (
                  <div className="post-cover">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                )}

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>

                  <div className="post-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="meta-item">
                        <Tag size={14} />
                        {post.tags.join(', ')}
                      </span>
                    )}
                  </div>

                  <p className="post-excerpt">
                    {post.excerpt || post.content.substring(0, 100)}...
                  </p>

                  <div className="post-actions">
                    <a
                      href={`/blog/${post.id}`}
                      className="action-btn view"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye size={16} />
                      查看
                    </a>
                    <a
                      href={`/blog/${post.id}/edit`}
                      className="action-btn edit"
                    >
                      <Edit size={16} />
                      编辑
                    </a>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="action-btn delete"
                    >
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
