'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import BlogSidebar from '../../components/BlogSidebar';
import '../../pages/Home.css';
import './Blog.css';

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
            <div className="blog-container">

                <div className="blog-layout">
                    {/* Left Sidebar */}
                    <div className="blog-sidebar-wrapper">
                        <BlogSidebar />
                    </div>

                    {/* Right Content - Blog Grid */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="blog-header-card"
                        >
                            <div className="blog-title-group">
                                <div className="blog-title-bar"></div>
                                <h2 className="blog-title">最新文章</h2>
                                <span className="blog-count-badge">{filteredPosts.length}</span>
                            </div>
                            <div className="blog-search-wrapper">
                                <Search size={18} className="blog-search-icon" />
                                <input
                                    type="text"
                                    placeholder="搜索文章..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="blog-search-input"
                                />
                            </div>
                        </motion.div>

                        <div className="blog-posts-grid">
                            {filteredPosts.map((post, index) => (
                                <Link href={`/blog/${post.id}`} key={post.id} style={{ textDecoration: 'none', display: 'block' }}>
                                    <motion.div
                                        className="blog-post-card"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10 }}
                                    >
                                        <div className="post-card-image">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                loading="lazy"
                                            />
                                            <div className="image-badge">
                                                <Calendar size={20} />
                                            </div>
                                        </div>

                                        <div className="post-card-content">
                                            <div className="post-meta-row">
                                                <span className="post-category-tag">
                                                    <Tag size={14} /> {post.category}
                                                </span>
                                                <span className="post-date">{post.date}</span>
                                            </div>

                                            <h3 className="post-title">{post.title}</h3>
                                            <p className="post-excerpt">
                                                {post.excerpt}
                                            </p>

                                            <div className="read-more-link">
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
