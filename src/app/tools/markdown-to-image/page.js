'use client';

import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Download,
  FileText,
  LayoutTemplate,
  NotebookText,
  RefreshCw,
  Type,
} from 'lucide-react';
import { downloadCanvas, drawRoundedRect, setCanvasSize, wrapText } from '../../../utils/visual-tools';
import './markdown-to-image.css';

const THEMES = [
  { id: 'paper', label: '纸感白', background: '#f6f0e8', card: '#fffdf8', ink: '#212936', muted: '#6b7280', accent: '#b45309', line: 'rgba(33,41,54,0.08)', quote: '#fdf0c2', code: '#111827' },
  { id: 'night', label: '深夜蓝', background: '#0f172a', card: '#111827', ink: '#f8fafc', muted: 'rgba(226,232,240,0.74)', accent: '#67e8f9', line: 'rgba(255,255,255,0.08)', quote: '#162338', code: '#020617' },
  { id: 'matcha', label: '抹茶绿', background: '#edf5ea', card: '#fcfffb', ink: '#17311f', muted: 'rgba(23,49,31,0.68)', accent: '#2f855a', line: 'rgba(23,49,31,0.08)', quote: '#dcefdc', code: '#10261a' },
];

const FONTS = [
  { id: 'modern', label: '清爽无衬线', titleFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', bodyFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', titleWeight: 700 },
  { id: 'editorial', label: '杂志衬线', titleFamily: 'Georgia, "Times New Roman", "Noto Serif SC", serif', bodyFamily: 'Georgia, "Times New Roman", "Noto Serif SC", serif', titleWeight: 700 },
  { id: 'mono', label: '理性等宽', titleFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace', bodyFamily: '"IBM Plex Sans", "PingFang SC", "Microsoft YaHei", sans-serif', titleWeight: 700 },
];

const LAYOUTS = [
  { id: 'classic', label: '经典卡片' },
  { id: 'magazine', label: '杂志专栏' },
  { id: 'centered', label: '居中海报' },
  { id: 'notebook', label: '手帐笔记' },
];

const DEFAULT_STYLE = {
  scale: 1,
  titleSizeScale: 1,
  bodySizeScale: 1,
  lineHeight: 1.08,
  bodySpacing: 0.42,
  cardRadius: 40,
  contentWidth: 0.9,
  titleWidth: 0.86,
  topSpacing: 1.04,
  sectionSpacing: 1.08,
  paragraphSpacing: 1.16,
};

const AESTHETICS = [
  { id: 'off-white', label: 'Off-White', description: '暖纸感、克制留白、安静 editorial', values: { theme: 'paper', fontPreset: 'editorial', layoutPreset: 'classic', style: { ...DEFAULT_STYLE } } },
  { id: 'organic', label: 'Organic Gradients', description: '柔和晕染、轻空气感、适合生活方式内容', values: { theme: 'matcha', fontPreset: 'modern', layoutPreset: 'classic', style: { ...DEFAULT_STYLE, lineHeight: 1.1, contentWidth: 0.88, titleWidth: 0.82, topSpacing: 1.08, paragraphSpacing: 1.2, cardRadius: 44 } } },
  { id: 'academia', label: 'Non-Brand Academia', description: '更窄版心、书页节奏、知识感更强', values: { theme: 'paper', fontPreset: 'editorial', layoutPreset: 'magazine', style: { ...DEFAULT_STYLE, scale: 0.98, lineHeight: 1.12, contentWidth: 0.78, titleWidth: 0.7, topSpacing: 1.12, sectionSpacing: 1.16, paragraphSpacing: 1.26 } } },
  { id: 'technical', label: 'Technical Notes', description: '结构化、更精确，适合方法论和拆解', values: { theme: 'night', fontPreset: 'mono', layoutPreset: 'magazine', style: { ...DEFAULT_STYLE, scale: 0.96, lineHeight: 1.02, bodySpacing: 0.26, contentWidth: 0.84, titleWidth: 0.78, topSpacing: 1, sectionSpacing: 1.02, paragraphSpacing: 1, cardRadius: 28 } } },
];

const TEMPLATES = [
  { id: 'article-share', label: '文章分享', description: '适合长段落与社媒分享', values: { aestheticPreset: 'off-white', theme: 'paper', fontPreset: 'modern', layoutPreset: 'classic', style: { ...DEFAULT_STYLE } } },
  { id: 'study-notes', label: '学习笔记', description: '更像整理后的知识卡片', values: { aestheticPreset: 'academia', theme: 'paper', fontPreset: 'editorial', layoutPreset: 'notebook', style: { ...DEFAULT_STYLE, contentWidth: 0.82, titleWidth: 0.76, lineHeight: 1.12, paragraphSpacing: 1.2 } } },
  { id: 'quote-poster', label: '摘录海报', description: '标题居中，适合短篇观点', values: { aestheticPreset: 'off-white', theme: 'night', fontPreset: 'editorial', layoutPreset: 'centered', style: { ...DEFAULT_STYLE, scale: 1.04, contentWidth: 0.8, titleWidth: 0.72, lineHeight: 1 } } },
  { id: 'magazine-column', label: '杂志专栏', description: '更强调留白和版式节奏', values: { aestheticPreset: 'academia', theme: 'paper', fontPreset: 'editorial', layoutPreset: 'magazine', style: { ...DEFAULT_STYLE, contentWidth: 0.76, titleWidth: 0.68, topSpacing: 1.12, paragraphSpacing: 1.28 } } },
  { id: 'thread-dark', label: '深色长帖', description: '适合方法论、拆解、流程感内容', values: { aestheticPreset: 'technical', theme: 'night', fontPreset: 'mono', layoutPreset: 'classic', style: { ...DEFAULT_STYLE, scale: 0.96, cardRadius: 28, contentWidth: 0.84, titleWidth: 0.76 } } },
];

const SAMPLES = {
  article: `# 为什么把零碎想法整理成图片更容易被分享
很多内容并不是写得不够好，而是展示方式太像草稿。

## 一张长图能解决什么
- 读者不需要跳转就能看完整重点
- 更适合在社媒里二次传播
- 视觉层次能帮文字建立节奏

> 不是把文章截图，而是把内容重新设计成“可阅读的画面”。

\`\`\`
分享 = 内容价值 x 被看完的概率
\`\`\`

最后，把你最想让别人记住的那一句，放在标题和结尾。`,
  notes: `# 上海散步备忘
今天风很轻，路边梧桐开始有一点春末的味道。

1. 上午适合去旧街区拍光影
2. 下午适合在咖啡馆整理笔记
3. 傍晚留给江边和慢一点的步调

## 想记住的一句话
普通的一天，也可以有被认真保存下来的价值。`,
};

const METRICS = {
  classic: { cardX: 46, cardY: 30, cardWidth: 988, contentX: 118, contentWidth: 844, titleX: 118, titleWidth: 844, titleAlign: 'left', labelX: 118, labelY: 118, titleY: 194, subtitleGap: 26, dividerGap: 34, bodyGap: 42, footerAlign: 'left', minHeight: 1480 },
  magazine: { cardX: 52, cardY: 24, cardWidth: 976, contentX: 132, contentWidth: 816, titleX: 132, titleWidth: 776, titleAlign: 'left', labelX: 132, labelY: 108, titleY: 184, subtitleGap: 22, dividerGap: 30, bodyGap: 42, footerAlign: 'left', minHeight: 1480 },
  centered: { cardX: 72, cardY: 42, cardWidth: 936, contentX: 150, contentWidth: 780, titleX: 540, titleWidth: 780, titleAlign: 'center', labelX: 540, labelY: 118, titleY: 220, subtitleGap: 24, dividerGap: 36, bodyGap: 48, footerAlign: 'center', minHeight: 1440 },
  notebook: { cardX: 42, cardY: 42, cardWidth: 996, contentX: 112, contentWidth: 856, titleX: 112, titleWidth: 856, titleAlign: 'left', labelX: 112, labelY: 118, titleY: 202, subtitleGap: 24, dividerGap: 32, bodyGap: 42, footerAlign: 'left', minHeight: 1480 },
};

const byId = (list, id) => list.find((item) => item.id === id) || list[0];

function parseMarkdown(markdown) {
  const lines = `${markdown || ''}`.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;
  const flushParagraph = () => { if (paragraph.length) { blocks.push({ type: 'paragraph', text: paragraph.join(' ') }); paragraph = []; } };
  const flushList = () => { if (list.length) { blocks.push(...list); list = []; } };
  const flushCode = () => { if (code.length) { blocks.push({ type: 'code', text: code.join('\n') }); code = []; } };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (line.startsWith('```')) { flushParagraph(); flushList(); if (inCode) flushCode(); inCode = !inCode; return; }
    if (inCode) { code.push(raw); return; }
    if (!line.trim()) { flushParagraph(); flushList(); return; }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) { flushParagraph(); flushList(); blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] }); return; }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) { flushParagraph(); flushList(); blocks.push({ type: 'quote', text: quote[1] }); return; }
    const ordered = line.match(/^(\d+)\.\s+(.*)$/);
    if (ordered) { flushParagraph(); list.push({ type: 'ordered', index: Number(ordered[1]), text: ordered[2] }); return; }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) { flushParagraph(); list.push({ type: 'bullet', text: bullet[1] }); return; }
    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  flushCode();
  return blocks;
}

function drawLines(ctx, lines, x, y, lineHeight, align) {
  ctx.textAlign = align;
  let nextY = y;
  lines.forEach((line) => {
    ctx.fillText(line, x, nextY);
    nextY += lineHeight;
  });
  return nextY;
}

function drawBlock(ctx, block, theme, fontPreset, style, x, y, width, renderOnly) {
  const sectionSpacing = style.sectionSpacing ?? 1;
  const paragraphSpacing = style.paragraphSpacing ?? 1;
  const bodySpacing = style.bodySpacing ?? 0;
  const titleScale = style.titleSizeScale ?? 1;
  const bodyScale = style.bodySizeScale ?? 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (block.type === 'heading') {
    const sizes = { 1: 60, 2: 46, 3: 36 };
    const heights = { 1: 72, 2: 58, 3: 46 };
    const size = Math.round((sizes[block.level] || 36) * style.scale * titleScale);
    const lineHeight = Math.round((heights[block.level] || 46) * style.lineHeight);
    ctx.font = `${fontPreset.titleWeight} ${size}px ${fontPreset.titleFamily}`;
    ctx.fillStyle = theme.ink;
    const lines = wrapText(ctx, block.text, width);
    return drawLines(ctx, lines, x, y, lineHeight, 'left') + Math.round((12 + 16 * sectionSpacing + 8 * bodySpacing) * style.lineHeight);
  }

  if (block.type === 'paragraph') {
    ctx.font = `${Math.round(33 * style.scale * bodyScale)}px ${fontPreset.bodyFamily}`;
    ctx.fillStyle = theme.ink;
    const lines = wrapText(ctx, block.text, width);
    return drawLines(ctx, lines, x, y, Math.round(48 * style.lineHeight), 'left') + Math.round((8 + 12 * paragraphSpacing + 10 * bodySpacing) * style.lineHeight);
  }

  if (block.type === 'bullet' || block.type === 'ordered') {
    const marker = block.type === 'ordered' ? `${block.index}.` : '•';
    const markerWidth = 44;
    ctx.font = `${Math.round(33 * style.scale * bodyScale)}px ${fontPreset.bodyFamily}`;
    ctx.fillStyle = theme.ink;
    const lines = wrapText(ctx, block.text, width - markerWidth);
    if (!renderOnly) {
      ctx.fillStyle = theme.accent;
      ctx.fillText(marker, x, y);
    }
    ctx.fillStyle = theme.ink;
    return drawLines(ctx, lines, x + markerWidth, y, Math.round(48 * style.lineHeight), 'left') + Math.round((4 + 10 * paragraphSpacing + 8 * bodySpacing) * style.lineHeight);
  }

  if (block.type === 'quote') {
    ctx.font = `${Math.round(32 * style.scale * bodyScale)}px ${fontPreset.bodyFamily}`;
    const lines = wrapText(ctx, block.text, width - 68);
    const lineHeight = Math.round(45 * style.lineHeight);
    const quoteHeight = Math.max(112, lines.length * lineHeight + 52);
    if (!renderOnly) {
      drawRoundedRect(ctx, x, y - 42, width, quoteHeight, 28);
      ctx.fillStyle = theme.quote;
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.fillRect(x + 22, y - 18, 7, quoteHeight - 48);
      ctx.fillStyle = theme.ink;
    }
    return Math.max(drawLines(ctx, lines, x + 50, y, lineHeight, 'left'), y - 42 + quoteHeight) + Math.round((8 + 12 * sectionSpacing + 8 * bodySpacing) * style.lineHeight);
  }

  if (block.type === 'code') {
    const codeLines = block.text.split('\n');
    const lineHeight = Math.round(36 * style.lineHeight);
    const codeHeight = codeLines.length * lineHeight + 56;
    if (!renderOnly) {
      drawRoundedRect(ctx, x, y - 34, width, codeHeight, 22);
      ctx.fillStyle = theme.code;
      ctx.fill();
      ctx.fillStyle = '#d6e2f0';
      ctx.font = `500 ${Math.round(27 * style.scale * bodyScale)}px "Cascadia Code", Consolas, monospace`;
      codeLines.forEach((line, index) => ctx.fillText(line, x + 24, y + index * lineHeight));
    }
    return y - 34 + codeHeight + Math.round((10 + 12 * sectionSpacing + 8 * bodySpacing) * style.lineHeight);
  }

  return y;
}

function paintBackdrop(ctx, width, height, theme, aesthetic) {
  const glow = ctx.createRadialGradient(width * 0.15, 120, 10, width * 0.15, 120, width * 0.62);
  glow.addColorStop(0, `${theme.accent}2a`);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  if (aesthetic.id === 'organic') {
    const bloomA = ctx.createRadialGradient(width * 0.18, 180, 20, width * 0.18, 180, width * 0.34);
    bloomA.addColorStop(0, 'rgba(183,219,170,0.34)');
    bloomA.addColorStop(1, 'rgba(183,219,170,0)');
    ctx.fillStyle = bloomA;
    ctx.fillRect(0, 0, width, height);
    const bloomB = ctx.createRadialGradient(width * 0.8, 240, 20, width * 0.8, 240, width * 0.28);
    bloomB.addColorStop(0, 'rgba(242,204,140,0.24)');
    bloomB.addColorStop(1, 'rgba(242,204,140,0)');
    ctx.fillStyle = bloomB;
    ctx.fillRect(0, 0, width, height);
  }

  if (aesthetic.id === 'academia') {
    ctx.strokeStyle = 'rgba(122,94,50,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(96, 0);
    ctx.lineTo(96, height);
    ctx.stroke();
  }

  if (aesthetic.id === 'technical') {
    ctx.strokeStyle = 'rgba(148,163,184,0.12)';
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 100; y < height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}

function drawDecorations(ctx, layoutId, width, height, theme, aesthetic) {
  if (layoutId === 'classic') {
    drawRoundedRect(ctx, 74, 58, width - 148, 128, 24);
    ctx.fillStyle = aesthetic.id === 'technical' ? 'rgba(15,23,42,0.68)' : theme.quote;
    ctx.fill();
  }

  if (layoutId === 'magazine') {
    drawRoundedRect(ctx, 92, 56, width - 184, 116, 22);
    ctx.fillStyle = aesthetic.id === 'technical' ? 'rgba(15,23,42,0.74)' : theme.quote;
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.fillRect(width - 230, 86, 34, 154);
    ctx.strokeStyle = theme.line;
    ctx.beginPath();
    ctx.moveTo(width - 252, 94);
    ctx.lineTo(width - 252, height - 96);
    ctx.stroke();
  }

  if (layoutId === 'centered') {
    drawRoundedRect(ctx, 112, 76, width - 224, 156, 30);
    ctx.fillStyle = `${theme.quote}cc`;
    ctx.fill();
  }

  if (layoutId === 'notebook') {
    ctx.fillStyle = `${theme.quote}7d`;
    ctx.fillRect(82, 94, 8, 120);
  }
}

function renderCanvas(canvas, options) {
  if (!canvas) return;

  const { title, subtitle, markdown, themeId, fontPresetId, layoutPreset, aestheticPresetId, style } = options;
  const width = 1080;
  const theme = byId(THEMES, themeId);
  const fontPreset = byId(FONTS, fontPresetId);
  const aesthetic = byId(AESTHETICS, aestheticPresetId);
  const layout = METRICS[layoutPreset] || METRICS.classic;
  const blocks = parseMarkdown(markdown);
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  const contentWidth = Math.round(layout.contentWidth * (style.contentWidth ?? 1));
  const titleWidth = Math.round(layout.titleWidth * (style.titleWidth ?? 1));
  const contentX = layout.titleAlign === 'center' ? Math.round((width - contentWidth) / 2) : layout.contentX + Math.round((layout.contentWidth - contentWidth) / 2);
  const titleX = layout.titleAlign === 'center' ? layout.titleX : layout.titleX + Math.round((layout.titleWidth - titleWidth) / 2);
  const titleY = Math.round(layout.titleY + ((style.topSpacing ?? 1) - 1) * 84);
  const subtitleGap = Math.round(layout.subtitleGap * (style.sectionSpacing ?? 1));
  const dividerGap = Math.round(layout.dividerGap * (style.sectionSpacing ?? 1));
  const bodyGap = Math.round(layout.bodyGap * (style.sectionSpacing ?? 1));
  const titleFontSize = Math.round(76 * style.scale * (style.titleSizeScale ?? 1));
  const titleLineHeight = Math.round(92 * style.lineHeight);
  const subtitleFontSize = Math.round(32 * style.scale * (style.bodySizeScale ?? 1));
  const subtitleLineHeight = Math.round(44 * style.lineHeight);

  measureCtx.textAlign = layout.titleAlign;
  measureCtx.font = `${fontPreset.titleWeight} ${titleFontSize}px ${fontPreset.titleFamily}`;
  const titleLines = wrapText(measureCtx, title || 'Markdown 长图', titleWidth);

  let cursorY = titleY + titleLines.length * titleLineHeight;
  let subtitleLines = [];

  if (subtitle.trim()) {
    measureCtx.font = `${subtitleFontSize}px ${fontPreset.bodyFamily}`;
    subtitleLines = wrapText(measureCtx, subtitle, contentWidth);
    cursorY += subtitleGap + subtitleLines.length * subtitleLineHeight;
  }

  cursorY += dividerGap + bodyGap;
  blocks.forEach((block) => {
    cursorY = drawBlock(measureCtx, block, theme, fontPreset, style, contentX, cursorY, contentWidth, true);
  });

  const height = Math.max(layout.minHeight, Math.ceil(cursorY + layout.cardY + 120));
  const ctx = setCanvasSize(canvas, width, height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  paintBackdrop(ctx, width, height, theme, aesthetic);
  drawRoundedRect(ctx, layout.cardX, layout.cardY, layout.cardWidth, height - layout.cardY * 2, style.cardRadius);
  ctx.fillStyle = theme.card;
  ctx.fill();
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  drawDecorations(ctx, layoutPreset, width, height, theme, aesthetic);

  if (layoutPreset === 'notebook') {
    ctx.strokeStyle = theme.line;
    for (let y = 228; y < height - 120; y += 88) {
      ctx.beginPath();
      ctx.moveTo(layout.cardX + 50, y);
      ctx.lineTo(layout.cardX + layout.cardWidth - 50, y);
      ctx.stroke();
    }
  }

  ctx.fillStyle = theme.accent;
  ctx.font = `600 ${Math.round(24 * style.scale * (style.bodySizeScale ?? 1))}px ${fontPreset.bodyFamily}`;
  ctx.textAlign = layout.titleAlign;
  ctx.fillText('MARKDOWN SNAPSHOT', layout.labelX, layout.labelY);

  let drawY = titleY;
  ctx.fillStyle = theme.ink;
  ctx.font = `${fontPreset.titleWeight} ${titleFontSize}px ${fontPreset.titleFamily}`;
  drawY = drawLines(ctx, titleLines, titleX, drawY, titleLineHeight, layout.titleAlign);

  if (subtitle.trim()) {
    ctx.fillStyle = theme.muted;
    ctx.font = `${subtitleFontSize}px ${fontPreset.bodyFamily}`;
    drawY += subtitleGap;
    drawY = drawLines(ctx, subtitleLines, layout.titleAlign === 'center' ? titleX : contentX, drawY, subtitleLineHeight, layout.titleAlign === 'center' ? 'center' : 'left');
  }

  ctx.strokeStyle = theme.line;
  ctx.beginPath();
  ctx.moveTo(contentX, drawY + dividerGap);
  ctx.lineTo(contentX + contentWidth, drawY + dividerGap);
  ctx.stroke();
  drawY += dividerGap + bodyGap;
  blocks.forEach((block) => {
    drawY = drawBlock(ctx, block, theme, fontPreset, style, contentX, drawY, contentWidth, false);
  });

  ctx.fillStyle = theme.muted;
  ctx.font = `500 ${Math.round(24 * style.scale * (style.bodySizeScale ?? 1))}px ${fontPreset.bodyFamily}`;
  ctx.textAlign = layout.footerAlign;
  ctx.fillText('Made in ImgExpress Tools', layout.footerAlign === 'center' ? width / 2 : contentX, height - 104);
}

export default function MarkdownToImagePage() {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState('paper');
  const [fontPreset, setFontPreset] = useState('modern');
  const [layoutPreset, setLayoutPreset] = useState('classic');
  const [aestheticPreset, setAestheticPreset] = useState('off-white');
  const [templatePreset, setTemplatePreset] = useState('article-share');
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [title, setTitle] = useState('把文章片段整理成一张更适合分享的长图');
  const [subtitle, setSubtitle] = useState('适合社媒卡片、读书摘录、活动记录和轻量版文章分享。');
  const [markdown, setMarkdown] = useState(SAMPLES.article);
  const deferredMarkdown = useDeferredValue(markdown);

  useEffect(() => {
    renderCanvas(canvasRef.current, {
      title,
      subtitle,
      markdown: deferredMarkdown,
      themeId: theme,
      fontPresetId: fontPreset,
      layoutPreset,
      aestheticPresetId: aestheticPreset,
      style,
    });
  }, [aestheticPreset, deferredMarkdown, fontPreset, layoutPreset, style, subtitle, theme, title]);

  const applyTemplate = (id) => {
    const preset = byId(TEMPLATES, id);
    setTemplatePreset(preset.id);
    setAestheticPreset(preset.values.aestheticPreset);
    setTheme(preset.values.theme);
    setFontPreset(preset.values.fontPreset);
    setLayoutPreset(preset.values.layoutPreset);
    setStyle({ ...preset.values.style });
  };

  const resetAll = () => {
    setTemplatePreset('article-share');
    setAestheticPreset('off-white');
    setTheme('paper');
    setFontPreset('modern');
    setLayoutPreset('classic');
    setStyle({ ...DEFAULT_STYLE });
    setTitle('把文章片段整理成一张更适合分享的长图');
    setSubtitle('适合社媒卡片、读书摘录、活动记录和轻量版文章分享。');
    setMarkdown(SAMPLES.article);
  };

  return (
    <div className="markdown-image-page">
      <div className="markdown-image-shell">
        <div className="tool-topbar">
          <Link href="/tools" className="tool-back-link">
            <ArrowLeft size={18} />
            返回工具箱
          </Link>
          <div className="tool-topbar-actions">
            <button type="button" className="tool-ghost-button" onClick={resetAll}>
              <RefreshCw size={16} />
              恢复示例
            </button>
            <button type="button" className="tool-primary-button" onClick={() => downloadCanvas(canvasRef.current, 'markdown-to-image-export.png')}>
              <Download size={16} />
              导出 PNG
            </button>
          </div>
        </div>

        <div className="tool-intro">
          <Motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            Markdown 转长图
          </Motion.h1>
          <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            常用气质已经收进模板预设里了。现在直接选模板，再细调版心、留白和字号，会更清爽。
          </Motion.p>
        </div>

        <div className="markdown-image-layout">
          <section className="markdown-panel editor-panel">
            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title"><LayoutTemplate size={18} />模板预设</span>
              </summary>
              <div className="tool-section-body">
                <div className="template-grid">
                  {TEMPLATES.map((preset) => (
                    <button key={preset.id} type="button" className={`template-card ${templatePreset === preset.id ? 'active' : ''}`} onClick={() => applyTemplate(preset.id)}>
                      <strong>{preset.label}</strong>
                      <span>{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </details>

            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title"><NotebookText size={18} />长图信息</span>
              </summary>
              <div className="tool-section-body">
                <label className="tool-field"><span>标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                <label className="tool-field"><span>副标题</span><textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} rows={3} /></label>
              </div>
            </details>

            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title"><FileText size={18} />Markdown 内容</span>
              </summary>
              <div className="tool-section-body">
                <textarea className="markdown-input" value={markdown} onChange={(event) => setMarkdown(event.target.value)} placeholder="把你的内容贴到这里..." />
                <div className="sample-actions">
                  <button type="button" className="tool-chip active" onClick={() => setMarkdown(SAMPLES.article)}>文章示例</button>
                  <button type="button" className="tool-chip" onClick={() => setMarkdown(SAMPLES.notes)}>笔记示例</button>
                  <button type="button" className="tool-chip" onClick={() => navigator.clipboard?.writeText(markdown)}><Copy size={14} />复制 Markdown</button>
                </div>
              </div>
            </details>

            <details className="tool-section">
              <summary className="tool-section-summary">
                <span className="panel-block-title"><LayoutTemplate size={18} />版式设计</span>
              </summary>
              <div className="tool-section-body">
                <div className="chip-grid">
                  {LAYOUTS.map((option) => (
                    <button key={option.id} type="button" className={`tool-chip ${layoutPreset === option.id ? 'active' : ''}`} onClick={() => setLayoutPreset(option.id)}>{option.label}</button>
                  ))}
                </div>
                <div className="chip-grid section-stack">
                  {THEMES.map((option) => (
                    <button key={option.id} type="button" className={`tool-chip ${theme === option.id ? 'active' : ''}`} onClick={() => setTheme(option.id)}>{option.label}</button>
                  ))}
                </div>
              </div>
            </details>

            <details className="tool-section">
              <summary className="tool-section-summary">
                <span className="panel-block-title"><Type size={18} />字体与留白</span>
              </summary>
              <div className="tool-section-body">
                <div className="chip-grid">
                  {FONTS.map((option) => (
                    <button key={option.id} type="button" className={`tool-chip ${fontPreset === option.id ? 'active' : ''}`} onClick={() => setFontPreset(option.id)}>{option.label}</button>
                  ))}
                </div>
                <div className="slider-grid section-stack">
                  <label className="slider-field"><span>标题字号 {style.titleSizeScale.toFixed(2)}x</span><input type="range" min="0.8" max="1.35" step="0.01" value={style.titleSizeScale} onChange={(event) => setStyle((prev) => ({ ...prev, titleSizeScale: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>正文字号 {style.bodySizeScale.toFixed(2)}x</span><input type="range" min="0.82" max="1.3" step="0.01" value={style.bodySizeScale} onChange={(event) => setStyle((prev) => ({ ...prev, bodySizeScale: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>整体比例 {style.scale.toFixed(2)}x</span><input type="range" min="0.9" max="1.15" step="0.01" value={style.scale} onChange={(event) => setStyle((prev) => ({ ...prev, scale: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>行距 {style.lineHeight.toFixed(2)}x</span><input type="range" min="0.94" max="1.2" step="0.01" value={style.lineHeight} onChange={(event) => setStyle((prev) => ({ ...prev, lineHeight: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>版心宽度 {Math.round(style.contentWidth * 100)}%</span><input type="range" min="0.72" max="1" step="0.01" value={style.contentWidth} onChange={(event) => setStyle((prev) => ({ ...prev, contentWidth: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>标题宽度 {Math.round(style.titleWidth * 100)}%</span><input type="range" min="0.62" max="1" step="0.01" value={style.titleWidth} onChange={(event) => setStyle((prev) => ({ ...prev, titleWidth: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>头部留白 {style.topSpacing.toFixed(2)}x</span><input type="range" min="0.9" max="1.24" step="0.01" value={style.topSpacing} onChange={(event) => setStyle((prev) => ({ ...prev, topSpacing: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>模块间距 {style.sectionSpacing.toFixed(2)}x</span><input type="range" min="0.9" max="1.3" step="0.01" value={style.sectionSpacing} onChange={(event) => setStyle((prev) => ({ ...prev, sectionSpacing: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>段落节奏 {style.paragraphSpacing.toFixed(2)}x</span><input type="range" min="0.86" max="1.4" step="0.01" value={style.paragraphSpacing} onChange={(event) => setStyle((prev) => ({ ...prev, paragraphSpacing: Number(event.target.value) }))} /></label>
                  <label className="slider-field"><span>圆角 {style.cardRadius}px</span><input type="range" min="20" max="56" step="2" value={style.cardRadius} onChange={(event) => setStyle((prev) => ({ ...prev, cardRadius: Number(event.target.value) }))} /></label>
                </div>
              </div>
            </details>
          </section>

          <section className="markdown-panel preview-panel">
            <div className="preview-header">
              <div>
                <h2>长图预览</h2>
                <p>右侧预览会固定在视野里，调版心和留白时可以实时观察整体气质变化。</p>
              </div>
            </div>
            <div className="canvas-stage">
              <canvas ref={canvasRef} className="markdown-canvas" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
