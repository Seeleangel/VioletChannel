'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, Edit } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from '../hooks/useAdmin';
import '../pages/Home.css';

function BlogSidebar() {
    const { isAdmin } = useAdmin();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ height: 'fit-content', position: 'sticky', top: '100px', alignSelf: 'flex-start' }}
        >
            <div className="about-section" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #FFE4E1',
                    marginBottom: '1rem',
                    boxShadow: '0 10px 20px rgba(255, 182, 193, 0.3)'
                }}>
                    <img src="/img/avatar.jpg" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#333' }}>Violet.</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    摄影师 | AI重度依赖 | ISFP <br />
                    分享我小小世界的确幸
                </p>

                <div style={{ width: '100%', borderTop: '2px dashed #FFE4E1', margin: '1rem 0' }}></div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#555' }}>
                        <span style={{ background: '#FFF0F5', padding: '8px', borderRadius: '50%', color: '#FF69B4' }}><MapPin size={18} /></span>
                        <span>China, SH & CQ</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#555' }}>
                        <span style={{ background: '#FFF0F5', padding: '8px', borderRadius: '50%', color: '#FF69B4' }}><User size={18} /></span>
                        <span>21 Years Old</span>
                    </div>
                </div>

                {isAdmin && (
                    <Link href="/blog/new" style={{ width: '100%', marginTop: '1.5rem', textDecoration: 'none' }}>
                        <motion.button
                            className="submit-button"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Edit size={16} /> 写文章
                        </motion.button>
                    </Link>
                )}
            </div>

            {/* Categories Widget */}
            <div className="about-section" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333', borderLeft: '4px solid #FF69B4', paddingLeft: '0.8rem' }}>
                    分类
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {['生活感悟', '技术分享', '编程笔记', '旅行日记', '摄影'].map(tag => (
                        <span key={tag} style={{
                            background: '#FFF0F5',
                            color: '#FF69B4',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.2s'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#FFB6C1'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tools Widget */}
            <div className="about-section" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333', borderLeft: '4px solid #FF69B4', paddingLeft: '0.8rem' }}>
                    实用工具
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link href="/tools/rename" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '0.8rem',
                            background: '#FFF0F5',
                            borderRadius: '12px',
                            color: '#FF69B4',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 105, 180, 0.2)' }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            <Edit size={18} /> 批量重命名
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default BlogSidebar;
