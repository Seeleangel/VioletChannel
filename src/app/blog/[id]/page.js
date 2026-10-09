'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft, Clock, Share2, Edit, Trash2 } from 'lucide-react';
import BlogSidebar from '../../../components/BlogSidebar';
import { useAdmin } from '../../../hooks/useAdmin';
import '../../../pages/Home.css';
import '../Blog.css';

export default function BlogPost() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdmin();

    // Reading settings state
    const [textAlign, setTextAlign] = useState('justify');
    const [textIndent, setTextIndent] = useState(2);

    const handleDelete = async () => {
        if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return;
        try {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('删除成功！');
                router.push('/blog');
            } else {
                alert('删除失败');
            }
        } catch (error) {
            console.error(error);
            alert('发生错误');
        }
    };

    useEffect(() => {
        if (id) {
            fetch(`/api/posts/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Not found');
                    return res.json();
                })
                .then(data => {
                    setPost(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: '#666' }}>加载中...</h2>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>文章未找到</h2>
                    <Link href="/blog" style={{ color: '#FF69B4', textDecoration: 'none' }}>返回博客首页</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="blog-container">

                <div className="blog-layout">
                    {/* Left Sidebar */}
                    <div className="blog-sidebar-wrapper">
                        <BlogSidebar />
                    </div>

                    {/* Right Content - Full Article */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="blog-post-container"
                    >
                        {/* Hero Image */}
                        <div className="post-hero">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="post-hero-img"
                            />
                            <div className="post-hero-overlay">
                                <Link href="/blog" className="back-link">
                                    <ArrowLeft size={16} style={{ marginRight: '5px' }} /> 返回列表
                                </Link>
                                <h1 className="hero-title">{post.title}</h1>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="post-body">

                            {/* Metadata Header */}
                            <div className="post-info-bar">
                                <div className="info-item">
                                    <Calendar size={18} color="#FF69B4" />
                                    <span>{post.date}</span>
                                </div>
                                <div className="info-item">
                                    <Tag size={18} color="#FF69B4" />
                                    <span className="post-category-tag">{post.category}</span>
                                </div>
                                <div className="info-item">
                                    <Clock size={18} color="#FF69B4" />
                                    <span>5 min read</span>
                                </div>
                                <div className="action-buttons">
                                    {isAdmin && (
                                        <>
                                            <Link href={`/blog/${id}/edit`} style={{ textDecoration: 'none' }}>
                                                <button className="edit-btn">
                                                    <Edit size={16} /> 编辑
                                                </button>
                                            </Link>
                                            <button onClick={handleDelete} className="delete-btn">
                                                <Trash2 size={16} /> 删除
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Reading Settings Toolbar */}
                            <div className="reading-toolbar">
                                <span style={{ fontWeight: 'bold', color: '#333' }}>阅读设置:</span>

                                <div className="toolbar-group">
                                    <span>对齐:</span>
                                    <button
                                        onClick={() => setTextAlign('left')}
                                        className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`}
                                    >
                                        左对齐
                                    </button>
                                    <button
                                        onClick={() => setTextAlign('justify')}
                                        className={`toolbar-btn ${textAlign === 'justify' ? 'active' : ''}`}
                                    >
                                        两端对齐
                                    </button>
                                </div>

                                <div className="divider"></div>

                                <div className="toolbar-group">
                                    <span>首行缩进:</span>
                                    <button
                                        onClick={() => setTextIndent(0)}
                                        className={`toolbar-btn ${textIndent === 0 ? 'active' : ''}`}
                                    >
                                        无
                                    </button>
                                    <button
                                        onClick={() => setTextIndent(2)}
                                        className={`toolbar-btn ${textIndent === 2 ? 'active' : ''}`}
                                    >
                                        2字符
                                    </button>
                                </div>
                            </div>

                            {/* Markdown Content Area */}
                            <div className="article-content">
                                {post.content.split('\n').map((line, i) => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('## ')) return <h2 key={i}>{trimmed.replace('## ', '')}</h2>;
                                    if (trimmed.startsWith('### ')) return <h3 key={i}>{trimmed.replace('### ', '')}</h3>;
                                    if (trimmed.startsWith('> ')) return <blockquote key={i}>{trimmed.replace('> ', '')}</blockquote>;
                                    if (trimmed.startsWith('- ')) return <li key={i}>{trimmed.replace('- ', '')}</li>;

                                    // Custom Image Syntax: [[image: URL | WIDTH ]]
                                    const imgMatch = trimmed.match(/^\[\[image:\s*(.*?)(?:\s*\|\s*(.*?))?\]\]$/);
                                    if (imgMatch) {
                                        const src = imgMatch[1];
                                        const width = imgMatch[2] || '100%';
                                        return (
                                            <div key={i} style={{ margin: '2rem 0', textAlign: 'center' }}>
                                                <img
                                                    src={src}
                                                    alt="Blog illustration"
                                                    style={{ width: width }}
                                                />
                                            </div>
                                        );
                                    }

                                    if (trimmed === '') return <br key={i} />;

                                    // Apply dynamic styles to paragraphs
                                    return (
                                        <p key={i} style={{
                                            textAlign: textAlign,
                                            textIndent: `${textIndent}em`
                                        }}>
                                            {trimmed}
                                        </p>
                                    );
                                })}
                            </div>

                            {/* Footer / Comments Placeholder */}
                            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '2px dashed #eee' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>评论</h3>
                                <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: '#999' }}>
                                    评论功能开发中... 🚧
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>

            <footer className="site-footer">
                <p>© 2026 Violet's Channel. Made with ❤️</p>
                <p className="footer-subtitle">2026班马 | 摄影师 | 音乐即氧气 | ISFP</p>
            </footer>
        </div>
    );
}
