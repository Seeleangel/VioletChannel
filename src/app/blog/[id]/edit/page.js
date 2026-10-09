'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';
import '../../../../pages/Home.css';

export default function EditPost() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);
    const contentFileInputRef = useRef(null); // Ref for content images

    useEffect(() => {
        if (id) {
            fetch(`/api/posts/${id}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title || '');
                    setCategory(data.category || '');
                    setContent(data.content || '');
                    setPreviewUrl(data.image || '');
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleContentImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Show loading indicator or toast could go here
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                const imageUrl = data.url;
                const imageTag = `\n[[image: ${imageUrl} | 100%]]\n`;

                // Insert at cursor position
                const textarea = document.getElementById('content-textarea');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newContent = content.substring(0, start) + imageTag + content.substring(end);

                setContent(newContent);

                // Restore cursor position after insertion
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + imageTag.length;
                    textarea.focus();
                }, 0);
            } else {
                alert('图片上传失败');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('上传出错');
        }

        // Reset input
        e.target.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = previewUrl;

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
                excerpt: content.substring(0, 100) + '...',
                image: imageUrl
            };

            const res = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                alert('更新成功！');
                router.push(`/blog/${id}`);
            } else {
                alert('更新失败');
            }
        } catch (error) {
            console.error(error);
            alert('发生错误');
        }
    };

    if (loading) {
        return (
            <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: '#666' }}>加载中...</h2>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '900px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href={`/blog/${id}`} style={{ display: 'inline-flex', alignItems: 'center', color: '#FF69B4', textDecoration: 'none', marginBottom: '1.5rem' }}>
                        <ArrowLeft size={18} style={{ marginRight: '5px' }} /> 返回文章
                    </Link>

                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>编辑文章</h1>

                    <form onSubmit={handleSubmit} className="contact-form" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(255, 182, 193, 0.2)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>标题</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                                placeholder="文章标题"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>分类</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="">选择分类</option>
                                <option value="生活感悟">生活感悟</option>
                                <option value="技术分享">技术分享</option>
                                <option value="摄影作品">摄影作品</option>
                                <option value="旅行日记">旅行日记</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>封面图</label>
                            <div
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: '2px dashed #FFB6C1',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: '#FFF8F9',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                {previewUrl ? (
                                    <div>
                                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>点击更换图片</p>
                                    </div>
                                ) : (
                                    <div style={{ color: '#FF69B4' }}>
                                        <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                        <p>点击上传封面图</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>内容</label>

                            {/* Editor Toolbar */}
                            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => contentFileInputRef.current.click()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '0.4rem 0.8rem',
                                        background: '#FFF0F5',
                                        border: '1px solid #FFB6C1',
                                        borderRadius: '8px',
                                        color: '#FF69B4',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <ImageIcon size={16} /> 插入图片
                                </button>
                                <input
                                    type="file"
                                    ref={contentFileInputRef}
                                    onChange={handleContentImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <textarea
                                id="content-textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="form-textarea"
                                placeholder="支持 Markdown 格式..."
                                rows="15"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <motion.button
                                type="submit"
                                className="submit-button"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Save size={18} /> 保存修改
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <footer className="site-footer">
                <p>© 2026 Violet's Channel. Made with ❤️</p>
            </footer>
        </div>
    );
}
