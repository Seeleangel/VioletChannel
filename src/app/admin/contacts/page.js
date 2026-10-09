'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Heart, Calendar, Check, Eye, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './contacts.css';

const SOURCE_LABELS = {
  contact: '普通联系表单',
  'tool-request': '工具列表页需求提交',
};

export default function ContactsAdmin() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error('获取联系记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchContacts();
  }, [checkAuth, fetchContacts]);

  const markAsRead = async (id) => {
    try {
      const contact = contacts.find((item) => item.id === id);

      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: !contact.read }),
      });

      setContacts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item)),
      );
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const deleteContact = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      setContacts((prev) => prev.filter((item) => item.id !== id));
      // TODO: 添加 DELETE 方法到 API
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const filteredContacts = contacts.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'read') return item.read;
    return true;
  });

  const unreadCount = contacts.filter((item) => !item.read).length;

  return (
    <AdminLayout>
      <div className="contacts-admin-container">
        <div className="admin-header">
          <div>
            <h1>联系记录管理</h1>
            <p className="header-subtitle">
              共 {contacts.length} 条记录
              {unreadCount > 0 ? ` · ${unreadCount} 条未读` : ''}
            </p>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({contacts.length})
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            未读 ({unreadCount})
          </button>
          <button
            className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            已读 ({contacts.length - unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} />
            <p>暂无{filter === 'unread' ? '未读' : filter === 'read' ? '已读' : ''}记录</p>
          </div>
        ) : (
          <div className="contacts-list">
            <AnimatePresence>
              {filteredContacts.map((contact, index) => {
                const sourceLabel =
                  SOURCE_LABELS[contact.source] ||
                  (contact.page ? `${contact.page} 页面提交` : '普通联系表单');
                const isToolRequest = contact.source === 'tool-request';

                return (
                  <Motion.div
                    key={contact.id}
                    className={`contact-item ${contact.read ? 'read' : 'unread'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="contact-header">
                      <div className="contact-meta">
                        <h3>
                          <User size={16} />
                          {contact.name}
                          {isToolRequest ? <span className="source-badge">工具需求</span> : null}
                          {!contact.read ? <span className="unread-badge">新</span> : null}
                        </h3>
                        <span className="contact-date">
                          <Calendar size={14} />
                          {new Date(contact.submittedAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="contact-actions">
                        <button
                          className="action-btn"
                          onClick={() => markAsRead(contact.id)}
                          title={contact.read ? '标记未读' : '标记已读'}
                        >
                          {contact.read ? <Eye size={18} /> : <Check size={18} />}
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteContact(contact.id)}
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="contact-info">
                      {contact.interest ? (
                        <div className="info-row">
                          <span className="info-label">兴趣：</span>
                          <span className="info-value">{contact.interest}</span>
                        </div>
                      ) : null}
                      {contact.relationship ? (
                        <div className="info-row">
                          <span className="info-label">关系：</span>
                          <span className="info-value">{contact.relationship}</span>
                        </div>
                      ) : null}
                      <div className="info-row">
                        <span className="info-label">来源：</span>
                        <span className="info-value">{sourceLabel}</span>
                      </div>
                    </div>

                    <div className="contact-message">
                      <Heart size={14} className="message-icon" />
                      <p>{contact.message}</p>
                    </div>
                  </Motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
