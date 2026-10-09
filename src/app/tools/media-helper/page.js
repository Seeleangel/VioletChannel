'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, FileText, Video, Copy, Check, Hash, PenTool, GraduationCap, X, RotateCcw, Palette } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import './media-helper.css';

export default function MediaHelper() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('xiaohongshu');
    const [history, setHistory] = useState({}); // { [mode]: [{ id, content, time }] }
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const modes = [
        { id: 'xiaohongshu', name: '小红书', icon: Hash, desc: 'Emoji + 活泼语气 + 种草风', color: '#FF2E4D' },
        { id: 'official', name: '新闻通稿', icon: FileText, desc: '严肃 + 高度重视 + 通稿风', color: '#1E3A8A' },
        { id: 'script', name: '视频脚本', icon: Video, desc: '分镜头 + 画面 + 口播表格', color: '#7C3AED' },
        { id: 'future_edu', name: '未来教育引领者', icon: GraduationCap, desc: '温暖昂扬 + 师大情怀 + 教育金句', color: '#EC4899' },
        { id: 'layout_html', name: '排版生成器', icon: Palette, desc: '自动生成公众号 HTML 代码', color: '#059669' }
    ];

    const handleTransform = async () => {
        if (!input.trim()) return;

        setLoading(true);

        try {
            const res = await fetch('/api/ai/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: input, mode })
            });

            const data = await res.json();
            if (data.result) {
                setHistory(prev => {
                    const currentModeHistory = prev[mode] || [];
                    const newItem = {
                        id: Date.now(),
                        content: data.result,
                        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    };
                    // Keep top 3, new at top
                    return {
                        ...prev,
                        [mode]: [newItem, ...currentModeHistory].slice(0, 3)
                    };
                });
            } else {
                alert('生成失败，请稍后重试');
            }
        } catch (error) {
            console.error('Transform error:', error);
            alert('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (content, id) => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            }).catch(err => {
                console.error('Copy failed, trying fallback', err);
                fallbackCopy(content, id);
            });
        } else {
            fallbackCopy(content, id);
        }
    };

    const fallbackCopy = (content, id) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = content;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            } else {
                alert('复制失败，请手动复制');
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            alert('复制失败，请手动复制');
        }
    };

    const handleClear = () => {
        if (confirm('确定要清空所有内容吗？')) {
            setInput('');
        }
    }

    return (
        <div className="media-helper-container">
            <div className="helper-header">
                <Link href="/tools" className="back-link">
                    <ArrowLeft size={20} />
                    返回工具箱
                </Link>
                <h1>媒体打工人神器</h1>
                <p>一个内容，多种分身。拒绝重复劳动！</p>
            </div>

            <div className="helper-content">
                {/* Left: Input */}
                <div className="input-section">
                    <div className="input-card">
                        <div className="input-header">
                            <h3><PenTool size={18} /> 原文输入</h3>
                            <button className="clear-btn" onClick={handleClear} title="清空内容">
                                <RotateCcw size={16} /> 清空
                            </button>
                        </div>
                        <textarea
                            className="main-input"
                            placeholder="请把凌乱的会议纪要、干巴巴的通稿扔进这里..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </div>

                {/* Middle: Controls */}
                <div className="control-section">
                    <div className="mode-selection">
                        <h3>选择变身模式</h3>
                        <div className="mode-list">
                            {modes.map(m => (
                                <motion.button
                                    key={m.id}
                                    className={`mode-card ${mode === m.id ? 'active' : ''}`}
                                    onClick={() => setMode(m.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ '--accent-color': m.color }}
                                >
                                    <div className="mode-icon" style={{ backgroundColor: m.color }}>
                                        <m.icon size={20} color="white" />
                                    </div>
                                    <div className="mode-info">
                                        <span className="mode-name">{m.name}</span>
                                        <span className="mode-desc">{m.desc}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="transform-btn"
                        disabled={!input.trim() || loading}
                        onClick={handleTransform}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">🌀</span> 正在施法...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles size={20} /> 立即变身
                            </span>
                        )}
                    </button>
                </div>

                {/* Right: Output */}
                <div className="output-section">
                    <div className="output-header">
                        <h3>生成结果 ({(history[mode] || []).length}/3)</h3>
                    </div>
                    <div className="output-display">
                        {loading && (
                            <div className="loading-placeholder">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                >
                                    ✨
                                </motion.div>
                                <p>AI正在疯狂思考中...</p>
                            </div>
                        )}
                        {!loading && (!history[mode] || history[mode].length === 0) && (
                            <div className="empty-placeholder">
                                👈 输入原文 - 选择模式 - 变身
                            </div>
                        )}

                        <div className="history-list">
                            {(history[mode] || []).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="history-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="history-header">
                                        <span className="history-time">{item.time}</span>
                                        <button
                                            className="copy-btn-small"
                                            onClick={() => handleCopy(item.content, item.id)}
                                        >
                                            {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedId === item.id ? '已复制' : '复制'}
                                        </button>
                                    </div>
                                    <div className="markdown-body">
                                        {mode === 'layout_html' ? (
                                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', background: '#f5f5f5', padding: '0.8rem', borderRadius: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                                {item.content}
                                            </pre>
                                        ) : (
                                            <ReactMarkdown>{item.content}</ReactMarkdown>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
