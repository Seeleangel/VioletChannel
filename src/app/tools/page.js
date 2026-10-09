'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  Edit,
  Image,
  LayoutTemplate,
  ScrollText,
  Send,
  Sparkles,
} from 'lucide-react';
import './Tools.css';

const tools = [
  {
    id: 'imgcompress',
    title: '图片批量压缩',
    desc: '纯前端处理，适合快速压缩大图并保护隐私。',
    icon: Image,
    link: '/imgcompress',
    color: '#f43f5e',
    bgColor: '#fff1f2',
  },
  {
    id: 'rename',
    title: '批量重命名',
    desc: '支持序号、查找替换、后缀修改和文件名清洗。',
    icon: Edit,
    link: '/tools/rename',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
  },
  {
    id: 'media-helper',
    title: '媒体打工神器',
    desc: '一段原文快速变成多种风格的内容稿件。',
    icon: Sparkles,
    link: '/tools/media-helper',
    color: '#0f766e',
    bgColor: '#ecfeff',
  },
  {
    id: 'cover-studio',
    title: '封面文案排版器',
    desc: '给图片配标题和小字，直接导出适合社媒的封面。',
    icon: LayoutTemplate,
    link: '/tools/cover-studio',
    color: '#ea580c',
    bgColor: '#fff7ed',
  },
  {
    id: 'markdown-to-image',
    title: 'Markdown 转长图',
    desc: '把文章片段、笔记和摘录整理成一张分享长图。',
    icon: ScrollText,
    link: '/tools/markdown-to-image',
    color: '#15803d',
    bgColor: '#f0fdf4',
  },
];

export default function ToolsPage() {
  const [requestForm, setRequestForm] = useState({
    name: '',
    interest: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({ type: '', message: '' });

  const handleSuggestionSubmit = async (event) => {
    event.preventDefault();

    if (!requestForm.name.trim() || !requestForm.message.trim()) {
      setSubmitState({ type: 'error', message: '请填写昵称和工具需求。' });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ type: '', message: '' });

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestForm.name.trim(),
          interest: requestForm.interest.trim(),
          relationship: '工具需求',
          source: 'tool-request',
          page: 'tools',
          message: requestForm.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('submit failed');
      }

      setSubmitState({ type: 'success', message: '已收到你的工具想法。' });
      setRequestForm({ name: '', interest: '', message: '' });
    } catch (error) {
      console.error('提交工具需求失败:', error);
      setSubmitState({ type: 'error', message: '提交失败了，请稍后再试。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tools-container">
      <div className="tools-header">
        <Motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          实用工具箱
        </Motion.h1>
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          把高频但琐碎的内容工作整理成小工具，尽量都在浏览器本地完成。
        </Motion.p>
      </div>

      <div className="tools-grid">
        {tools.map((tool, index) => (
          <Link href={tool.link} key={tool.id} style={{ textDecoration: 'none' }}>
            <Motion.div
              className="tool-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.25 }}
              whileHover={{ y: -5, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)' }}
            >
              <div
                className="tool-icon-wrapper"
                style={{ background: tool.bgColor, color: tool.color }}
              >
                <tool.icon size={32} />
              </div>
              <div className="tool-content">
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <div className="tool-action">
                  <span style={{ color: tool.color }}>立即使用</span>
                  <ArrowRight size={16} color={tool.color} />
                </div>
              </div>
            </Motion.div>
          </Link>
        ))}
      </div>

      <Motion.section
        className="tool-request-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
      >
        <div className="tool-request-copy">
          <span className="tool-request-label">一起补完工具箱</span>
          <h2>你还有哪些小工具需求？</h2>
          <p>可以告诉我你想做什么、最卡的步骤是什么，或者你理想中的使用方式。</p>
        </div>

        <form className="tool-request-form" onSubmit={handleSuggestionSubmit}>
          <label className="tool-request-field">
            <span>昵称</span>
            <input
              value={requestForm.name}
              onChange={(event) => setRequestForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="怎么称呼你"
            />
          </label>

          <label className="tool-request-field">
            <span>想要的工具类型</span>
            <input
              value={requestForm.interest}
              onChange={(event) =>
                setRequestForm((prev) => ({ ...prev, interest: event.target.value }))
              }
              placeholder="比如：排版、笔记、旅行、文件处理"
            />
          </label>

          <label className="tool-request-field tool-request-textarea">
            <span>具体需求</span>
            <textarea
              value={requestForm.message}
              onChange={(event) =>
                setRequestForm((prev) => ({ ...prev, message: event.target.value }))
              }
              placeholder="比如：我想把多段摘录自动排成时间轴卡片，或者希望有一个能整理旅行路线的小工具。"
              rows={5}
            />
          </label>

          <div className="tool-request-actions">
            <button type="submit" className="tool-request-button" disabled={isSubmitting}>
              <Send size={16} />
              {isSubmitting ? '提交中...' : '提交工具需求'}
            </button>
            {submitState.message ? (
              <p className={`tool-request-status ${submitState.type}`}>{submitState.message}</p>
            ) : null}
          </div>
        </form>
      </Motion.section>
    </div>
  );
}
