'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Heart, Calendar, Check, Eye, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import './contacts.css';

export default function ContactsAdmin() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            setContacts(data);
        } catch (error) {
            console.error('获取联系记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const contact = contacts.find(c => c.id === id);
            await fetch('/api/contacts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, read: !contact.read })
            });

            setContacts(contacts.map(c =>
                c.id === id ? { ...c, read: !c.read } : c
            ));
        } catch (error) {
            console.error('更新失败:', error);
        }
    };

    const deleteContact = async (id) => {
        if (!confirm('确定要删除这条记录吗？')) return;

        try {
            // 简单实现：从前端过滤，实际应该调用 DELETE API
            setContacts(contacts.filter(c => c.id !== id));
            // TODO: 添加 DELETE 方法到 API
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    const filteredContacts = contacts.filter(c => {
        if (filter === 'unread') return !c.read;
        if (filter === 'read') return c.read;
        return true;
    });

    const unreadCount = contacts.filter(c => !c.read).length;

    return (
        <div className="contacts-admin-container">
            <div className="admin-header">
                <Link href="/" className="back-button">
                    <ArrowLeft size={20} />
                    <span>返回首页</span>
                </Link>
                <h1>📬 联系记录管理</h1>
                <p className="header-subtitle">
                    共 {contacts.length} 条记录 · {unreadCount > 0 && `${unreadCount} 条未读`}
                </p>
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
                        {filteredContacts.map((contact, index) => (
                            <motion.div
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
                                            {!contact.read && <span className="unread-badge">新</span>}
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
                                    {contact.interest && (
                                        <div className="info-row">
                                            <span className="info-label">兴趣：</span>
                                            <span className="info-value">{contact.interest}</span>
                                        </div>
                                    )}
                                    {contact.relationship && (
                                        <div className="info-row">
                                            <span className="info-label">关系：</span>
                                            <span className="info-value">{contact.relationship}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="contact-message">
                                    <Heart size={14} className="message-icon" />
                                    <p>{contact.message}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
