'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';
import '../../../pages/Home.css';

export default function BlogEditor() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = previewUrl; // Default to preview if it's a string (though state logic implies file)

            if (coverImage instanceof File) {
                const formData = new FormData();
                formData.append('file', coverImage);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.url;
                }
            }

            const postData = {
                title,
                category,
                content,
                // Make sure we have a date
                date: new Date().toISOString().split('T')[0],
                excerpt: content.substring(0, 100) + '...',
                image: imageUrl || 'https://images.unsplash.com/photo-1499750310159-5254f4127278' // Fallback
            };

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                alert('发布成功！');
                window.location.href = '/blog';
            } else {
                alert('发布失败');
            }
        } catch (error) {
            console.error(error);
            alert('发生错误');
        }
    };

    return (
        <div className="home-container">
            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '900px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>

                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', textDecoration: 'none', fontWeight: '500' }}>
                        <ArrowLeft size={20} /> 返回博客
                    </Link>
                    <h2 className="section-header" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent' }}>写文章</h2>
                    <div style={{ width: '80px' }}></div> {/* Spacer for alignment */}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="portfolio-card"
                    style={{ padding: '3rem', cursor: 'default' }}
                >
                    <form onSubmit={handleSubmit} className="contact-form">

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>文章标题</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="输入一个吸引人的标题..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>分类</label>
                                <select
                                    className="form-input"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">选择分类...</option>
                                    <option value="生活感悟">生活感悟</option>
                                    <option value="技术分享">技术分享</option>
                                    <option value="编程笔记">编程笔记</option>
                                    <option value="旅行日记">旅行日记</option>
                                    <option value="摄影">摄影</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>封面图 (本地上传)</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        border: '2px dashed #FFE4E1',
                                        borderRadius: '12px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#FFF0F5',
                                        height: '52px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#FFB6C1'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#FFE4E1'}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    {previewUrl ? (
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 1rem' }}>
                                            <img src={previewUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                            <span style={{ fontSize: '0.9rem', color: '#666', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {coverImage?.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#999', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={18} />
                                            <span>点击选择图片</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Large Image if exists */}
                        {previewUrl && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}
                            >
                                <img src={previewUrl} alt="Cover Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                            </motion.div>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>正文内容 (Markdown)</label>
                            <textarea
                                className="form-textarea"
                                rows="15"
                                placeholder="开始你的创作..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ lineHeight: '1.6', fontSize: '1.05rem' }}
                                required
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                type="button"
                                className="submit-button"
                                style={{ background: '#f0f0f0', color: '#666', boxShadow: 'none' }}
                                onClick={() => window.history.back()}
                            >
                                取消
                            </button>
                            <motion.button
                                type="submit"
                                className="submit-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 3rem' }}
                            >
                                <Save size={18} /> 发布文章
                            </motion.button>
                        </div>

                    </form>
                </motion.div>

            </div>
            <footer className="site-footer">
                <p>© 2026 Violet's Channel. Made with ❤️</p>
                <p className="footer-subtitle">2026班马 | 摄影师 | 音乐即氧气 | ISFP</p>
            </footer>
        </div>
    );
}
