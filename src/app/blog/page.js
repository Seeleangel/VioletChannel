'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import BlogSidebar from '../../components/BlogSidebar';
import '../../pages/Home.css';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/posts')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => setPosts(data))
            .catch(err => {
                console.error('Fetch error:', err);
                // Optionally set empty posts or error state
                setPosts([]);
            });
    }, []);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="home-container">
            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 3fr', gap: '2rem' }}>
                    {/* Left Sidebar */}
                    <BlogSidebar />

                    {/* Right Content - Blog Grid */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                marginBottom: '2rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                padding: '1.5rem 2rem',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,240,245,0.9) 100%)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(255, 182, 193, 0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 182, 193, 0.3)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{
                                    width: '4px',
                                    height: '28px',
                                    background: 'linear-gradient(180deg, #FF69B4, #FFB6C1)',
                                    borderRadius: '2px'
                                }}></div>
                                <h2 style={{
                                    fontSize: '1.6rem',
                                    fontWeight: '700',
                                    color: '#333',
                                    margin: 0,
                                    letterSpacing: '0.5px'
                                }}>最新文章</h2>
                                <span style={{
                                    background: 'linear-gradient(135deg, #FF69B4, #FFB6C1)',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>{filteredPosts.length}</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#FF69B4' }} />
                                <input
                                    type="text"
                                    placeholder="搜索文章..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '0.7rem 1rem 0.7rem 2.6rem',
                                        border: '2px solid rgba(255, 182, 193, 0.5)',
                                        borderRadius: '25px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        width: '220px',
                                        background: 'rgba(255,255,255,0.8)',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(255, 182, 193, 0.1)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#FF69B4';
                                        e.target.style.boxShadow = '0 4px 16px rgba(255, 105, 180, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 182, 193, 0.5)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(255, 182, 193, 0.1)';
                                    }}
                                />
                            </div>
                        </motion.div>

                        <div className="portfolio-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', padding: 0 }}>
                            {filteredPosts.map((post, index) => (
                                <Link href={`/blog/${post.id}`} key={post.id} style={{ textDecoration: 'none', display: 'block' }}>
                                    <motion.div
                                        className="portfolio-card"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10, boxShadow: '0 20px 60px rgba(255, 182, 193, 0.4)' }}
                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                                    >
                                        <div className="card-image" style={{ height: '200px' }}>
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                loading="lazy"
                                            />
                                            <div className="image-badge">
                                                <Calendar size={20} />
                                            </div>
                                        </div>

                                        <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div className="card-title-row" style={{ marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    background: '#FFF0F5',
                                                    color: '#FF69B4',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}>
                                                    <Tag size={14} /> {post.category}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', color: '#999' }}>{post.date}</span>
                                            </div>

                                            <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '1rem', lineHeight: '1.4' }}>{post.title}</h3>
                                            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                                                {post.excerpt}
                                            </p>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#FF69B4',
                                                fontWeight: '600',
                                                fontSize: '0.95rem',
                                                marginTop: 'auto'
                                            }}>
                                                阅读全文 <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="site-footer">
                <p>© 2026 Violet's Channel. Made with ❤️</p>
                <p className="footer-subtitle">2026班马 | 摄影师 | 音乐即氧气 | ISFP</p>
            </footer>
        </div>
    );
}
