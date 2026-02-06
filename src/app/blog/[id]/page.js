'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft, Clock, Share2, Edit, Trash2 } from 'lucide-react';
import BlogSidebar from '../../../components/BlogSidebar';
import { useAdmin } from '../../../hooks/useAdmin';
import '../../../pages/Home.css';

export default function BlogPost() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdmin();

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
            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 3fr', gap: '2rem' }}>
                    {/* Left Sidebar */}
                    <BlogSidebar />

                    {/* Right Content - Full Article */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="portfolio-card"
                        style={{ cursor: 'default', padding: '0', overflow: 'hidden', background: 'white' }}
                    >
                        {/* Hero Image */}
                        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                            <img
                                src={post.image}
                                alt={post.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                padding: '2rem',
                                color: 'white'
                            }}>
                                <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', color: 'white', textDecoration: 'none', marginBottom: '1rem', opacity: 0.8 }}>
                                    <ArrowLeft size={16} style={{ marginRight: '5px' }} /> 返回列表
                                </Link>
                                <h1 style={{ fontSize: '2.5rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{post.title}</h1>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div style={{ padding: '3rem' }}>

                            {/* Metadata Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', color: '#666' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={18} color="#FF69B4" />
                                    <span>{post.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Tag size={18} color="#FF69B4" />
                                    <span style={{ background: '#FFF0F5', color: '#FF69B4', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{post.category}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={18} color="#FF69B4" />
                                    <span>5 min read</span>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                                    {isAdmin && (
                                        <>
                                            <Link href={`/blog/${id}/edit`} style={{ textDecoration: 'none' }}>
                                                <button style={{ background: '#FFF0F5', border: '1px solid #FFB6C1', borderRadius: '8px', cursor: 'pointer', color: '#FF69B4', display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem' }}>
                                                    <Edit size={16} /> 编辑
                                                </button>
                                            </Link>
                                            <button onClick={handleDelete} style={{ background: '#FFF0F0', border: '1px solid #FFB6B6', borderRadius: '8px', cursor: 'pointer', color: '#FF6B6B', display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem' }}>
                                                <Trash2 size={16} /> 删除
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Markdown Content Area */}
                            <div className="article-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
                                {post.content.split('\n').map((line, i) => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.8rem', color: '#333', marginTop: '2.5rem', marginBottom: '1.5rem', borderLeft: '5px solid #FFB6C1', paddingLeft: '1rem' }}>{trimmed.replace('## ', '')}</h2>;
                                    if (trimmed.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.4rem', color: '#444', marginTop: '2rem', marginBottom: '1rem' }}>{trimmed.replace('### ', '')}</h3>;
                                    if (trimmed.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '4px solid #FF69B4', padding: '1rem', background: '#FFF0F5', margin: '1.5rem 0', color: '#555', fontStyle: 'italic' }}>{trimmed.replace('> ', '')}</blockquote>;
                                    if (trimmed.startsWith('- ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>{trimmed.replace('- ', '')}</li>;

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
                                                    style={{
                                                        width: width,
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            </div>
                                        );
                                    }

                                    if (trimmed === '') return <br key={i} />;
                                    return <p key={i} style={{ marginBottom: '1rem' }}>{trimmed}</p>;
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
