'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Image, Code, Heart, Mail, MapPin, Cake, User, Disc, Camera, Aperture, Timer } from 'lucide-react';
import dynamic from 'next/dynamic';
import PhotoGallery from '../components/PhotoGallery';
const TravelMap = dynamic(() => import('../components/TravelMap'), { ssr: false });
import '../pages/Home.css';


export default function Home() {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isTravelMapOpen, setIsTravelMapOpen] = useState(false);
    const [activePhoto, setActivePhoto] = useState(null); // URL of active photo or null
    const [contactForm, setContactForm] = useState({
        name: '',
        interest: '',
        relationship: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const audioRef = useRef(null);
    const audioTimerRef = useRef(null);
    const fadeIntervalRef = useRef(null);
    const photoTimerRef = useRef(null);
    const [photoSamples, setPhotoSamples] = useState([]);
    const [photoOpacity, setPhotoOpacity] = useState(1);
    const [profile, setProfile] = useState({
        aboutMe: {
            image: '/img/aboutme.jpg',
            name: 'Uiolet 魏宏涛',
            subtitle: '（来财版·幸福版·快乐版）',
            paragraphs: []
        },
        basicInfo: []
    });

    useEffect(() => {
        fetch('/api/images/list', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setPhotoSamples(data);
                }
            })
            .catch(err => console.error("Failed to load photo samples:", err));
    }, []);

    useEffect(() => {
        fetch('/api/profile', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
            })
            .catch(err => console.error("Failed to load profile:", err));
    }, []);

    const handleMusicHoverStart = () => {
        audioTimerRef.current = setTimeout(async () => {
            try {
                // Fetch list if not already cached (or just fetch every time, it's fast)
                const res = await fetch('/api/music/list');
                const files = await res.json();

                if (files.length > 0) {
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    if (!audioRef.current) {
                        audioRef.current = new Audio();
                    }

                    const audio = audioRef.current;
                    audio.src = `/music/${randomFile}`;
                    audio.volume = 0;

                    // Wait for metadata to get duration
                    audio.onloadedmetadata = () => {
                        // Random start position (avoid last 10 seconds)
                        const duration = audio.duration;
                        const safeDuration = Math.max(0, duration - 10);
                        audio.currentTime = Math.random() * safeDuration;

                        audio.play().catch(e => console.error("Audio play failed:", e));

                        // Fade in
                        let vol = 0;
                        clearInterval(fadeIntervalRef.current);
                        fadeIntervalRef.current = setInterval(() => {
                            if (vol < 1.0) {
                                vol += 0.1;
                                audio.volume = Math.min(1.0, vol);
                            } else {
                                clearInterval(fadeIntervalRef.current);
                            }
                        }, 200); // 200ms * 10 steps = 2 seconds fade in
                    };
                }
            } catch (error) {
                // Ignore NotAllowedError (user hasn't interacted with document yet)
                if (error.name !== 'NotAllowedError') {
                    console.error("Failed to play music:", error);
                }
            }
        }, 1500);
    };

    const handleMusicHoverEnd = () => {
        if (audioTimerRef.current) {
            clearTimeout(audioTimerRef.current);
            audioTimerRef.current = null;
        }
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        if (!contactForm.name || !contactForm.message) {
            alert('请填写姓名和留言');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactForm)
            });

            if (res.ok) {
                alert('提交成功！感谢你的留言 ❤️');
                setContactForm({ name: '', interest: '', relationship: '', message: '' });
            } else {
                alert('提交失败，请稍后再试');
            }
        } catch (error) {
            console.error('提交出错:', error);
            alert('提交失败，请稍后再试');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyToClipboard = (text, platform) => {
        // 使用更安全的检测方式
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(`已复制${platform}号到剪贴板：${text}`);
            }).catch((err) => {
                console.error('Clipboard write failed:', err);
                fallbackCopy(text, platform);
            });
        } else {
            fallbackCopy(text, platform);
        }
    };

    const fallbackCopy = (text, platform) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;

            // Ensure element is not visible but part of DOM
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '0';
            textArea.style.opacity = '0';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                alert(`已复制${platform}号到剪贴板：${text}`);
            } else {
                prompt(`复制失败，请手动复制${platform}号：`, text);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            prompt(`复制失败，请手动复制${platform}号：`, text);
        }
    };

    return (
        <div className="home-container">
            {/* Header Banner */}
            <section className="header-banner">
                <div className="banner-image">
                    <img
                        src="/img/header.jpg"
                        alt="Banner"
                        loading="eager"
                        decoding="async"
                    />
                    <div className="banner-overlay">
                        <motion.div
                            className="banner-welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                className="welcome-avatar"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 200, duration: 0.6 }}
                            >
                                <img
                                    src="/img/avatar.jpg"
                                    alt="Avatar"
                                    loading="eager"
                                />
                            </motion.div>
                            <motion.h1
                                className="sparkle-text"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Welcome to my channel!
                            </motion.h1>
                        </motion.div>
                    </div>
                </div>
                {/* Scroll Down Indicator */}
                <motion.div
                    className="scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                >
                    <motion.a
                        href="#me"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        ↓
                    </motion.a>
                </motion.div>
            </section>

            {/* About Me Section */}
            <section id="me" className="about-section">
                <h2 className="section-header">About Me</h2>
                <div className="about-content">
                    <div className="about-image">
                        <img
                            src={profile.aboutMe.image}
                            alt="About"
                            loading="lazy"
                        />
                    </div>
                    <div className="about-text">
                        <h3 className="about-title">
                            {profile.aboutMe.name}
                            <span className="subtitle-tag">{profile.aboutMe.subtitle}</span>
                        </h3>
                        {profile.aboutMe.paragraphs.map((paragraph, index) => (
                            <p key={index}>
                                {paragraph.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i < paragraph.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Basic Information */}
            <section id="information" className="info-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Basic Information
                </motion.h2>
                <div className="info-grid">
                    {profile.basicInfo.map((item, index) => (
                        <motion.div
                            key={item.label}
                            className="info-item"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, backgroundColor: '#FFF5F8' }}
                        >
                            <span className="info-label">{item.icon} {item.label}</span>
                            <span className="info-value">{item.value}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Portfolio Gallery */}
            <section className="portfolio-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    我的灵感
                </motion.h2>
                <div className="portfolio-grid">
                    {[
                        { img: '/img/compressed-DSC00292.jpg', icon: Image, title: '影像Diary', desc: '用镜头分享我眼中的世界', link: null, onClick: () => setIsGalleryOpen(true), buttonText: null },
                        { img: '/img/linggan2.jpg', icon: Code, title: '一些好用的', desc: '图片压缩、批量重命名等实用工具集合', link: '/tools', onClick: null, buttonText: '立即体验' },
                        { img: '/img/xuan.jpg', icon: Heart, title: '牛马史书', desc: '与宣传纠缠的那几年', link: '/blog/1770280318351', onClick: null, buttonText: '阅读全文' }
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="portfolio-card"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -10, boxShadow: '0 20px 60px rgba(255, 182, 193, 0.3)' }}
                            onClick={item.onClick}
                            style={{ cursor: item.onClick || item.link ? 'pointer' : 'default' }}
                        >
                            <motion.div
                                className="card-image"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    loading="lazy"
                                />
                                <div className="image-badge">
                                    <item.icon size={20} />
                                </div>
                            </motion.div>
                            <div className="card-content">
                                <div className="card-title-row">
                                    <div className="card-icon">
                                        <item.icon size={24} />
                                    </div>
                                    <h3>{item.title}</h3>
                                </div>
                                <p>{item.desc}</p>
                                {item.link && (
                                    <Link href={item.link} className="card-link" onClick={(e) => e.stopPropagation()}>
                                        <motion.span
                                            className="card-action-link"
                                            whileHover={{ x: 3 }}
                                        >
                                            {item.buttonText || '查看详情'} →
                                        </motion.span>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Interests Section */}
            <section id="interests" className="interest-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    我的快乐
                </motion.h2>
                <div className="interest-grid">
                    {/* ... (Interest items same as before) ... */}
                    <motion.div
                        className="interest-card"
                        initial="idle"
                        whileHover="playing"
                        onHoverStart={handleMusicHoverStart}
                        onHoverEnd={handleMusicHoverEnd}
                        viewport={{ once: true }}
                        variants={{
                            idle: { y: 0, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' },
                            playing: { y: -5, boxShadow: '0 10px 30px rgba(255, 182, 193, 0.2)' }
                        }}
                    >
                        <div className="card-title-row">
                            <motion.div
                                variants={{
                                    idle: { rotate: 0 },
                                    playing: { rotate: 360, transition: { duration: 3, repeat: Infinity, ease: "linear" } }
                                }}
                                style={{ display: 'flex', alignItems: 'center', color: '#FF69B4', marginRight: '0.5rem' }}
                            >
                                <Disc size={28} />
                            </motion.div>
                            <h4>来一首吗？</h4>
                        </div>
                        <p>音乐即氧气，离不开的旋律</p>
                        <p>触摸1.5s，感受音乐的流动🎵</p>
                        <div className="music-tags">
                            {['流行', '民谣', '电子'].map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    className="music-tag"
                                    whileHover={{ scale: 1.1, backgroundColor: '#FFB6C1', color: '#fff' }}
                                >
                                    {tag}
                                </motion.span>
                            ))}
                        </div>
                        {/* Audio Waveform Visualizer */}
                        <div className="music-waveform">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="wave-bar"
                                    variants={{
                                        idle: { height: 4 },
                                        playing: {
                                            height: [6, 18, 6],
                                            transition: {
                                                duration: 0.6,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                ease: "easeInOut",
                                                delay: i * 0.1
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="interest-card photo-card"
                        initial="idle"
                        whileHover="active"
                        viewport={{ once: true }}
                        onHoverStart={() => {
                            if (photoSamples.length > 0) {
                                const randomPhoto = photoSamples[Math.floor(Math.random() * photoSamples.length)];
                                setActivePhoto(randomPhoto);
                                setPhotoOpacity(1);

                                // 每2秒切换图片
                                photoTimerRef.current = setInterval(() => {
                                    // 淡出
                                    setPhotoOpacity(0);

                                    // 0.5秒后切换图片并淡入
                                    setTimeout(() => {
                                        const newPhoto = photoSamples[Math.floor(Math.random() * photoSamples.length)];
                                        setActivePhoto(newPhoto);
                                        setPhotoOpacity(1);
                                    }, 500);
                                }, 2000);
                            }
                        }}
                        onHoverEnd={() => {
                            if (photoTimerRef.current) {
                                clearInterval(photoTimerRef.current);
                                photoTimerRef.current = null;
                            }
                            setActivePhoto(null);
                            setPhotoOpacity(1);
                        }}
                        variants={{
                            idle: { y: 0, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' },
                            active: { y: -5, boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)' } // Deeper shadow for photo depth
                        }}
                    >
                        {/* Background Photo (Revealed on Hover) */}
                        <motion.div
                            className="photo-card-bg"
                            variants={{
                                idle: { opacity: 0 },
                                active: { opacity: photoOpacity }
                            }}
                            animate={{ opacity: activePhoto ? photoOpacity : 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            style={{ backgroundImage: activePhoto ? `url(${activePhoto.src})` : 'none' }}
                        />

                        {/* Dark Overlay for text readability on active */}
                        <motion.div
                            className="photo-overlay"
                            variants={{
                                idle: { opacity: 0 },
                                active: { opacity: 0.4 }
                            }}
                        />

                        {/* Idle Content */}
                        <motion.div
                            className="photo-content-idle"
                            variants={{
                                idle: { opacity: 1, y: 0 },
                                active: { opacity: 0, y: -20 }
                            }}
                        >
                            <div className="card-title-row">
                                <span className="card-icon-emoji">📷</span>
                                <h4>摄影搭档</h4>
                            </div>
                            <div className="equipment-list">
                                {['七工匠 1/4黑柔滤镜', 'Sigma 18-50mm F2.8', 'Sony α6700'].map((eq) => (
                                    <span key={eq} className="equipment-tag">{eq}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Active "Camera UI" Content */}
                        <motion.div
                            className="photo-content-active"
                            variants={{
                                idle: { opacity: 0, scale: 0.95 },
                                active: { opacity: 1, scale: 1 }
                            }}
                        >
                            <div className="camera-ui-top">
                                <span className="ui-tag">RAW</span>
                                <span className="ui-tag">4K 60P</span>
                                <div className="rec-dot"></div>
                            </div>

                            <div className="camera-ui-center">
                                {/* Focus Frame */}
                                <div className="focus-frame">
                                    <div className="corner c-tl"></div>
                                    <div className="corner c-tr"></div>
                                    <div className="corner c-bl"></div>
                                    <div className="corner c-br"></div>
                                    <div className="crosshair">+</div>
                                </div>
                            </div>

                            <div className="camera-ui-bottom">
                                <div className="param-item">
                                    <span className="label">ISO</span>
                                    <span className="value">800</span>
                                </div>
                                <div className="param-item">
                                    <span className="label">F</span>
                                    <span className="value">2.8</span>
                                </div>
                                <div className="param-item">
                                    <span className="label">S</span>
                                    <span className="value">1/200</span>
                                </div>
                                <div className="param-item highlight">
                                    <span className="label">EV</span>
                                    <span className="value">+0.3</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="interest-card"
                        onClick={() => setIsTravelMapOpen(true)}
                        style={{ cursor: 'pointer' }}
                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(255, 182, 193, 0.3)' }}
                    >
                        {/* Travel content - clickable */}
                        <motion.div className="card-title-row"><span className="card-icon-emoji">🗺️</span><h4>旅行足迹</h4></motion.div>
                        <p>走过的每一步都算数</p>
                        <p>点击探索更多👇</p>
                        <span style={{ fontSize: '0.85rem', color: '#FF69B4', marginTop: '0.5rem', display: 'inline-block' }}>🌍 查看3D地图 →</span>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="friends" className="contact-section">
                {/* ... (Contact form same as before) ... */}
                <motion.h2 className="section-header">交个朋友</motion.h2>
                <motion.div className="contact-card">
                    <form className="contact-form" onSubmit={handleContactSubmit}>
                        <input
                            type="text"
                            placeholder="你的大名"
                            className="form-input"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="你的兴趣"
                            className="form-input"
                            value={contactForm.interest}
                            onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="我们是什么关系"
                            className="form-input"
                            value={contactForm.relationship}
                            onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                        />
                        <textarea
                            placeholder="想对我说的话..."
                            className="form-textarea"
                            rows="4"
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        />
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '发送中...' : '发送 ❤️'}
                        </button>
                    </form>
                    <div className="social-section">
                        <h4>Find me on</h4>
                        <div className="social-links">
                            <button
                                onClick={() => handleCopyToClipboard('5693405559', '小红书')}
                                className="social-link xiaohongshu"
                                type="button"
                            >
                                <span className="social-icon">📕</span>
                                <span className="social-name">小红书</span>
                            </button>
                            <button
                                onClick={() => handleCopyToClipboard('wsw99726', '抖音')}
                                className="social-link douyin"
                                type="button"
                            >
                                <span className="social-icon">🎵</span>
                                <span className="social-name">抖音</span>
                            </button>
                            <a href="https://space.bilibili.com/439929085" target="_blank" rel="noopener noreferrer" className="social-link bilibili">
                                <span className="social-icon">📺</span>
                                <span className="social-name">bilibili</span>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="site-footer">
                <p>© 2026 Violet's Channel. Made with ❤️</p>
                <p className="footer-subtitle">2026班马 | 摄影师 | 音乐即氧气 | ISFP</p>
            </footer>

            <PhotoGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                initialPhotos={photoSamples}
            />
            <TravelMap isOpen={isTravelMapOpen} onClose={() => setIsTravelMapOpen(false)} />
        </div>
    );
}
