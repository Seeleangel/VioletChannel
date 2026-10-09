'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion as Motion } from 'framer-motion';
import {
  AlignCenter,
  AlignLeft,
  Aperture,
  ArrowLeft,
  Download,
  ImagePlus,
  LayoutTemplate,
  RefreshCw,
  SlidersHorizontal,
  Type,
  X,
} from 'lucide-react';
import {
  downloadCanvas,
  drawRoundedRect,
  fitImageCover,
  loadImage,
  setCanvasSize,
} from '../../../utils/visual-tools';
import './cover-studio.css';

const FORMAT_OPTIONS = [
  { id: 'portrait', label: '4:5 封面', width: 1080, height: 1350 },
  { id: 'square', label: '1:1 方图', width: 1080, height: 1080 },
  { id: 'story', label: '9:16 竖版', width: 1080, height: 1920 },
];

const LAYOUT_OPTIONS = [
  { id: 'bottom-panel', label: '底部卡面' },
  { id: 'top-banner', label: '顶部横栏' },
  { id: 'left-column', label: '左侧专栏' },
  { id: 'center-stack', label: '居中主视觉' },
  { id: 'edge-title', label: '边缘标题' },
];

const PALETTE_OPTIONS = [
  {
    id: 'cinema',
    label: '电影感',
    background: ['#0f172a', '#1e293b'],
    overlay: 'rgba(10, 16, 30, 0.58)',
    accent: '#f59e0b',
    text: '#f8fafc',
    subtext: 'rgba(241, 245, 249, 0.82)',
    outline: 'rgba(10, 12, 20, 0.48)',
  },
  {
    id: 'editorial',
    label: '杂志感',
    background: ['#faf5ef', '#d9c1ab'],
    overlay: 'rgba(80, 46, 26, 0.28)',
    accent: '#7c2d12',
    text: '#fffaf5',
    subtext: 'rgba(255, 247, 237, 0.84)',
    outline: 'rgba(63, 32, 12, 0.4)',
  },
  {
    id: 'aurora',
    label: '霓光感',
    background: ['#101827', '#312e81'],
    overlay: 'rgba(29, 24, 54, 0.45)',
    accent: '#67e8f9',
    text: '#f5f3ff',
    subtext: 'rgba(221, 214, 254, 0.84)',
    outline: 'rgba(12, 16, 30, 0.5)',
  },
];

const FONT_OPTIONS = [
  {
    id: 'modern',
    label: '清爽无衬线',
    family: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  {
    id: 'editorial',
    label: '杂志衬线',
    family: 'Georgia, "Times New Roman", "Noto Serif SC", serif',
    titleWeight: 700,
    bodyWeight: 400,
  },
  {
    id: 'poster',
    label: '海报手写',
    family: '"KURIYAMAKOUCHIFONT", "PingFang SC", "Microsoft YaHei", sans-serif',
    titleWeight: 500,
    bodyWeight: 500,
  },
  {
    id: 'mono',
    label: '理性等宽',
    family: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
    titleWeight: 700,
    bodyWeight: 500,
  },
];

const FILTER_PRESETS = [
  {
    id: 'none',
    label: '原图',
    values: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 },
  },
  {
    id: 'soft',
    label: '柔光',
    values: { brightness: 103, contrast: 95, saturation: 92, blur: 0, grayscale: 0, sepia: 4 },
  },
  {
    id: 'vivid',
    label: '通透',
    values: { brightness: 102, contrast: 108, saturation: 118, blur: 0, grayscale: 0, sepia: 0 },
  },
  {
    id: 'film',
    label: '胶片',
    values: { brightness: 96, contrast: 110, saturation: 88, blur: 0, grayscale: 6, sepia: 18 },
  },
  {
    id: 'noir',
    label: '黑白',
    values: { brightness: 92, contrast: 114, saturation: 0, blur: 0, grayscale: 92, sepia: 0 },
  },
];

const DEFAULT_TYPOGRAPHY = {
  titleSizeScale: 1,
  bodySizeScale: 1,
  titleLetterSpacing: 0,
  bodyLetterSpacing: 0,
  lineHeightScale: 1,
  shadowOpacity: 18,
  shadowBlur: 16,
  shadowOffsetY: 8,
  outlineWidth: 0,
};

const SAMPLE_COPY = {
  eyebrow: 'NEW DROP',
  title: '把普通照片排成一张更像样的封面',
  subtitle: '给社媒、博客和作品集做一个更有情绪的视觉开场。',
  footer: 'Visual Diary Studio',
};

const TEMPLATE_PRESETS = [
  {
    id: 'xhs-cover',
    label: '小红书封面',
    description: '醒目标题 + 强对比',
    values: {
      format: 'portrait',
      layoutPreset: 'bottom-panel',
      palette: 'cinema',
      fontPreset: 'modern',
      alignment: 'left',
      filterPreset: 'vivid',
      filterValues: getFilterPreset('vivid').values,
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        titleLetterSpacing: 1,
        shadowOpacity: 28,
        shadowBlur: 20,
      },
    },
  },
  {
    id: 'blog-hero',
    label: '博客封面',
    description: '干净横栏 + 质感文字',
    values: {
      format: 'portrait',
      layoutPreset: 'top-banner',
      palette: 'editorial',
      fontPreset: 'editorial',
      alignment: 'left',
      filterPreset: 'soft',
      filterValues: getFilterPreset('soft').values,
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        lineHeightScale: 1.05,
        shadowOpacity: 12,
      },
    },
  },
  {
    id: 'event-poster',
    label: '活动海报',
    description: '大字居中 + 氛围感',
    values: {
      format: 'story',
      layoutPreset: 'center-stack',
      palette: 'aurora',
      fontPreset: 'poster',
      alignment: 'center',
      filterPreset: 'film',
      filterValues: getFilterPreset('film').values,
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        titleLetterSpacing: 2,
        lineHeightScale: 0.96,
        shadowOpacity: 34,
        shadowBlur: 24,
      },
    },
  },
  {
    id: 'quote-card',
    label: '摘录卡片',
    description: '左侧专栏 + 阅读感',
    values: {
      format: 'square',
      layoutPreset: 'left-column',
      palette: 'editorial',
      fontPreset: 'editorial',
      alignment: 'left',
      filterPreset: 'none',
      filterValues: getFilterPreset('none').values,
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        bodyLetterSpacing: 0.5,
        lineHeightScale: 1.1,
        shadowOpacity: 10,
      },
    },
  },
  {
    id: 'minimal-sign',
    label: '极简签名',
    description: '边缘标题 + 轻量签名',
    values: {
      format: 'portrait',
      layoutPreset: 'edge-title',
      palette: 'cinema',
      fontPreset: 'mono',
      alignment: 'left',
      filterPreset: 'noir',
      filterValues: getFilterPreset('noir').values,
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        titleLetterSpacing: 2,
        bodyLetterSpacing: 1,
        shadowOpacity: 0,
        outlineWidth: 0.5,
      },
    },
  },
];

function getFormat(id) {
  return FORMAT_OPTIONS.find((item) => item.id === id) || FORMAT_OPTIONS[0];
}

function getPalette(id) {
  return PALETTE_OPTIONS.find((item) => item.id === id) || PALETTE_OPTIONS[0];
}

function getFontPreset(id) {
  return FONT_OPTIONS.find((item) => item.id === id) || FONT_OPTIONS[0];
}

function getFilterPreset(id) {
  return FILTER_PRESETS.find((item) => item.id === id) || FILTER_PRESETS[0];
}

function buildCanvasFilter(filterValues) {
  return [
    `brightness(${filterValues.brightness}%)`,
    `contrast(${filterValues.contrast}%)`,
    `saturate(${filterValues.saturation}%)`,
    `blur(${filterValues.blur}px)`,
    `grayscale(${filterValues.grayscale}%)`,
    `sepia(${filterValues.sepia}%)`,
  ].join(' ');
}

function measureSpacedText(ctx, text, letterSpacing) {
  const characters = [...`${text || ''}`];

  return characters.reduce((total, character, index) => {
    const spacing = index === characters.length - 1 ? 0 : letterSpacing;
    return total + ctx.measureText(character).width + spacing;
  }, 0);
}

function wrapSpacedText(ctx, text, maxWidth, letterSpacing) {
  const normalized = `${text || ''}`.replace(/\r\n/g, '\n');
  const paragraphs = normalized.split('\n');
  const lines = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (!paragraph.trim()) {
      lines.push('');
      return;
    }

    let current = '';

    [...paragraph].forEach((character) => {
      const candidate = current + character;

      if (measureSpacedText(ctx, candidate, letterSpacing) <= maxWidth || current.length === 0) {
        current = candidate;
        return;
      }

      lines.push(current);
      current = character;
    });

    if (current) {
      lines.push(current);
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
}

function drawSpacedText(ctx, text, x, y, letterSpacing, align, shouldStroke) {
  const content = `${text || ''}`;
  const totalWidth = measureSpacedText(ctx, content, letterSpacing);
  let cursorX = x;

  if (align === 'center') {
    cursorX -= totalWidth / 2;
  }

  if (align === 'right') {
    cursorX -= totalWidth;
  }

  [...content].forEach((character) => {
    if (shouldStroke) {
      ctx.strokeText(character, cursorX, y);
    }

    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + letterSpacing;
  });
}

function drawTextBlock(ctx, options) {
  const { text, x, y, maxWidth, lineHeight, letterSpacing, align, shouldStroke } = options;
  let cursorY = y;
  const lines = wrapSpacedText(ctx, text, maxWidth, letterSpacing);

  lines.forEach((line) => {
    if (!line) {
      cursorY += lineHeight * 0.6;
      return;
    }

    drawSpacedText(ctx, line, x, cursorY, letterSpacing, align, shouldStroke);
    cursorY += lineHeight;
  });

  return cursorY;
}

function getLayoutConfig(layoutPreset, width, height, alignment) {
  if (layoutPreset === 'top-banner') {
    return {
      panel: { x: 60, y: 72, width: width - 120, height: Math.min(height * 0.26, 320), radius: 36 },
      textX: alignment === 'center' ? width / 2 : 110,
      textWidth: width - 220,
      textStartY: 140,
      footerX: alignment === 'center' ? width / 2 : 110,
      footerY: height - 88,
      align: alignment === 'center' ? 'center' : 'left',
    };
  }

  if (layoutPreset === 'left-column') {
    return {
      panel: { x: 60, y: 60, width: Math.min(width * 0.42, 420), height: height - 120, radius: 40 },
      textX: alignment === 'center' ? 270 : 108,
      textWidth: Math.min(width * 0.42, 420) - 96,
      textStartY: 148,
      footerX: alignment === 'center' ? 270 : 108,
      footerY: height - 100,
      align: alignment === 'center' ? 'center' : 'left',
    };
  }

  if (layoutPreset === 'center-stack') {
    return {
      panel: { x: 84, y: height * 0.18, width: width - 168, height: Math.min(height * 0.46, 560), radius: 40 },
      textX: width / 2,
      textWidth: width - 280,
      textStartY: height * 0.28,
      footerX: width / 2,
      footerY: height - 96,
      align: 'center',
    };
  }

  if (layoutPreset === 'edge-title') {
    return {
      panel: { x: 52, y: height - 300, width: width * 0.66, height: 220, radius: 34 },
      textX: 84,
      textWidth: width * 0.58,
      textStartY: height - 228,
      footerX: width - 84,
      footerY: 92,
      align: 'left',
      footerAlign: 'right',
    };
  }

  return {
    panel: {
      x: 60,
      y: height - Math.min(height * 0.42, 560) - 60,
      width: width - 120,
      height: Math.min(height * 0.42, 560),
      radius: 36,
    },
    textX: alignment === 'center' ? width / 2 : 110,
    textWidth: alignment === 'center' ? width - 280 : width - 200,
    textStartY: height - Math.min(height * 0.42, 560) + 26,
    footerX: alignment === 'center' ? width / 2 : 100,
    footerY: height - 86,
    align: alignment === 'center' ? 'center' : 'left',
  };
}

export default function CoverStudioPage() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [format, setFormat] = useState('portrait');
  const [layoutPreset, setLayoutPreset] = useState('bottom-panel');
  const [palette, setPalette] = useState('cinema');
  const [fontPreset, setFontPreset] = useState('modern');
  const [templatePreset, setTemplatePreset] = useState('xhs-cover');
  const [filterPreset, setFilterPreset] = useState('none');
  const [filterValues, setFilterValues] = useState(() => ({ ...getFilterPreset('none').values }));
  const [alignment, setAlignment] = useState('left');
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [copy, setCopy] = useState(SAMPLE_COPY);
  const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);
  const [fontRevision, setFontRevision] = useState(0);

  useEffect(() => {
    return () => {
      if (coverImageUrl) {
        URL.revokeObjectURL(coverImageUrl);
      }
    };
  }, [coverImageUrl]);

  useEffect(() => {
    let active = true;

    loadImage(coverImageUrl)
      .then((image) => {
        if (active) {
          setCoverImage(image);
        }
      })
      .catch(() => {
        if (active) {
          setCoverImage(null);
        }
      });

    return () => {
      active = false;
    };
  }, [coverImageUrl]);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      return undefined;
    }

    const currentFont = getFontPreset(fontPreset);

    Promise.all([
      document.fonts.load(`700 72px ${currentFont.family}`),
      document.fonts.load(`400 32px ${currentFont.family}`),
      document.fonts.load(`500 24px ${currentFont.family}`),
      document.fonts.load('500 72px "KURIYAMAKOUCHIFONT"'),
    ]).finally(() => {
      setFontRevision((value) => value + 1);
    });

    return undefined;
  }, [fontPreset]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const formatConfig = getFormat(format);
    const paletteConfig = getPalette(palette);
    const fontConfig = getFontPreset(fontPreset);
    const ctx = setCanvasSize(canvas, formatConfig.width, formatConfig.height);
    const width = formatConfig.width;
    const height = formatConfig.height;
    const titleSize = (format === 'story' ? 88 : 78) * typography.titleSizeScale;
    const titleLineHeight = titleSize * 1.18 * typography.lineHeightScale;
    const bodySize = 34 * typography.bodySizeScale;
    const eyebrowSize = 26 * typography.bodySizeScale;
    const footerSize = 24 * typography.bodySizeScale;
    const bodyLineHeight = bodySize * 1.48 * typography.lineHeightScale;
    const shouldStroke = typography.outlineWidth > 0;
    const layout = getLayoutConfig(layoutPreset, width, height, alignment);

    ctx.clearRect(0, 0, width, height);

    if (coverImage) {
      ctx.save();
      ctx.filter = buildCanvasFilter(filterValues);
      fitImageCover(ctx, coverImage, 0, 0, width, height);
      ctx.restore();
    } else {
      const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
      backgroundGradient.addColorStop(0, paletteConfig.background[0]);
      backgroundGradient.addColorStop(1, paletteConfig.background[1]);
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, width, height);
    }

    const topGlow = ctx.createRadialGradient(
      width * 0.16,
      height * 0.08,
      30,
      width * 0.16,
      height * 0.08,
      width * 0.72,
    );
    topGlow.addColorStop(0, `${paletteConfig.accent}55`);
    topGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, 'rgba(15, 23, 42, 0.14)');
    overlay.addColorStop(0.48, paletteConfig.overlay);
    overlay.addColorStop(1, 'rgba(10, 12, 20, 0.78)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    if (layout.panel) {
      ctx.save();
      drawRoundedRect(
        ctx,
        layout.panel.x,
        layout.panel.y,
        layout.panel.width,
        layout.panel.height,
        layout.panel.radius,
      );
      const panelGradient = ctx.createLinearGradient(
        layout.panel.x,
        layout.panel.y,
        layout.panel.x + layout.panel.width,
        layout.panel.y + layout.panel.height,
      );
      panelGradient.addColorStop(0, 'rgba(8, 15, 28, 0.30)');
      panelGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx.fillStyle = panelGradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.shadowColor = `rgba(8, 12, 20, ${typography.shadowOpacity / 100})`;
    ctx.shadowBlur = typography.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = typography.shadowOffsetY;
    ctx.strokeStyle = paletteConfig.outline;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = typography.outlineWidth;

    let cursorY = layout.textStartY;

    if (copy.eyebrow.trim()) {
      ctx.fillStyle = paletteConfig.accent;
      ctx.font = `600 ${eyebrowSize}px ${fontConfig.family}`;
      drawSpacedText(
        ctx,
        copy.eyebrow.toUpperCase(),
        layout.textX,
        cursorY,
        typography.bodyLetterSpacing + 2,
        layout.align,
        shouldStroke,
      );
      cursorY += 54;
    }

    if (copy.title.trim()) {
      ctx.fillStyle = paletteConfig.text;
      ctx.font = `${fontConfig.titleWeight} ${titleSize}px ${fontConfig.family}`;
      cursorY = drawTextBlock(ctx, {
        text: copy.title,
        x: layout.textX,
        y: cursorY,
        maxWidth: layout.textWidth,
        lineHeight: titleLineHeight,
        letterSpacing: typography.titleLetterSpacing,
        align: layout.align,
        shouldStroke,
      });
      cursorY += 18;
    }

    if (copy.subtitle.trim()) {
      ctx.fillStyle = paletteConfig.subtext;
      ctx.font = `${fontConfig.bodyWeight} ${bodySize}px ${fontConfig.family}`;
      cursorY = drawTextBlock(ctx, {
        text: copy.subtitle,
        x: layout.textX,
        y: cursorY,
        maxWidth: layout.textWidth,
        lineHeight: bodyLineHeight,
        letterSpacing: typography.bodyLetterSpacing,
        align: layout.align,
        shouldStroke,
      });
    }

    if (copy.footer.trim()) {
      ctx.save();
      ctx.fillStyle = paletteConfig.text;
      ctx.font = `500 ${footerSize}px ${fontConfig.family}`;
      drawSpacedText(
        ctx,
        copy.footer,
        layout.footerX,
        layout.footerY,
        typography.bodyLetterSpacing,
        layout.footerAlign || layout.align,
        shouldStroke,
      );
      ctx.restore();
    }
  }, [alignment, copy, coverImage, filterValues, fontPreset, fontRevision, format, layoutPreset, palette, typography]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (coverImageUrl) {
      URL.revokeObjectURL(coverImageUrl);
    }

    setCoverImageUrl(URL.createObjectURL(file));
    event.target.value = '';
  };

  const resetEditor = () => {
    setCopy(SAMPLE_COPY);
    setTemplatePreset('xhs-cover');
    setAlignment('left');
    setLayoutPreset('bottom-panel');
    setPalette('cinema');
    setFormat('portrait');
    setFontPreset('modern');
    setFilterPreset('none');
    setFilterValues({ ...getFilterPreset('none').values });
    setTypography(DEFAULT_TYPOGRAPHY);
  };

  const applyTemplatePreset = (presetId) => {
    const preset = TEMPLATE_PRESETS.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setTemplatePreset(preset.id);
    setFormat(preset.values.format);
    setLayoutPreset(preset.values.layoutPreset);
    setPalette(preset.values.palette);
    setFontPreset(preset.values.fontPreset);
    setAlignment(preset.values.alignment);
    setFilterPreset(preset.values.filterPreset);
    setFilterValues({ ...preset.values.filterValues });
    setTypography({ ...preset.values.typography });
  };

  return (
    <div className="cover-studio-page">
      <div className="cover-studio-shell">
        <div className="tool-topbar">
          <Link href="/tools" className="tool-back-link">
            <ArrowLeft size={18} />
            返回工具箱
          </Link>
          <div className="tool-topbar-actions">
            <button type="button" className="tool-ghost-button" onClick={resetEditor}>
              <RefreshCw size={16} />
              重置示例
            </button>
            <button
              type="button"
              className="tool-primary-button"
              onClick={() => downloadCanvas(canvasRef.current, 'cover-studio-export.png')}
            >
              <Download size={16} />
              导出 PNG
            </button>
          </div>
        </div>

        <div className="tool-intro">
          <Motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            封面文案排版器
          </Motion.h1>
          <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            把一张图和一句标题排成社媒封面，适合小红书、博客封面、活动海报和作品集开场。
          </Motion.p>
        </div>

        <div className="cover-studio-layout">
          <section className="cover-panel controls-panel">
            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <LayoutTemplate size={18} />
                  模板预设
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="template-grid">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`template-card ${templatePreset === preset.id ? 'active' : ''}`}
                      onClick={() => applyTemplatePreset(preset.id)}
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </details>

            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <ImagePlus size={18} />
                  背景图片
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="upload-row">
                  <button type="button" className="tool-primary-button" onClick={() => fileInputRef.current?.click()}>
                    选择图片
                  </button>
                  {coverImageUrl && (
                    <button
                      type="button"
                      className="tool-ghost-button"
                      onClick={() => {
                        URL.revokeObjectURL(coverImageUrl);
                        setCoverImageUrl(null);
                        setCoverImage(null);
                      }}
                    >
                      <X size={16} />
                      清除
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                <p className="panel-tip">不传图也能直接用渐变底生成封面。</p>
              </div>
            </details>

            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <Type size={18} />
                  文案内容
                </span>
              </summary>
              <div className="tool-section-body">
                <label className="tool-field">
                  <span>眉题</span>
                  <input
                    value={copy.eyebrow}
                    onChange={(event) => setCopy((prev) => ({ ...prev, eyebrow: event.target.value }))}
                    placeholder="例如 NEW DROP"
                  />
                </label>
                <label className="tool-field">
                  <span>主标题</span>
                  <textarea
                    value={copy.title}
                    onChange={(event) => setCopy((prev) => ({ ...prev, title: event.target.value }))}
                    rows={4}
                    placeholder="输入最核心的一句话"
                  />
                </label>
                <label className="tool-field">
                  <span>小字说明</span>
                  <textarea
                    value={copy.subtitle}
                    onChange={(event) => setCopy((prev) => ({ ...prev, subtitle: event.target.value }))}
                    rows={3}
                    placeholder="一句补充信息、时间地点或简短描述"
                  />
                </label>
                <label className="tool-field">
                  <span>页脚签名</span>
                  <input
                    value={copy.footer}
                    onChange={(event) => setCopy((prev) => ({ ...prev, footer: event.target.value }))}
                    placeholder="例如 Visual Diary Studio"
                  />
                </label>
              </div>
            </details>

            <details className="tool-section" open>
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <LayoutTemplate size={18} />
                  版式设计
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="chip-grid">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`tool-chip ${layoutPreset === option.id ? 'active' : ''}`}
                      onClick={() => setLayoutPreset(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="chip-grid section-stack">
                  {FORMAT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`tool-chip ${format === option.id ? 'active' : ''}`}
                      onClick={() => setFormat(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="chip-grid section-stack">
                  {PALETTE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`tool-chip ${palette === option.id ? 'active' : ''}`}
                      onClick={() => setPalette(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="align-toggle section-stack">
                  <button
                    type="button"
                    className={`icon-toggle ${alignment === 'left' ? 'active' : ''}`}
                    onClick={() => setAlignment('left')}
                  >
                    <AlignLeft size={16} />
                    左对齐
                  </button>
                  <button
                    type="button"
                    className={`icon-toggle ${alignment === 'center' ? 'active' : ''}`}
                    onClick={() => setAlignment('center')}
                  >
                    <AlignCenter size={16} />
                    居中
                  </button>
                </div>
              </div>
            </details>

            <details className="tool-section">
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <Type size={18} />
                  字体风格
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="chip-grid">
                  {FONT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`tool-chip ${fontPreset === option.id ? 'active' : ''}`}
                      onClick={() => setFontPreset(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            <details className="tool-section">
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <Aperture size={18} />
                  滤镜
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="chip-grid">
                  {FILTER_PRESETS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`tool-chip ${filterPreset === option.id ? 'active' : ''}`}
                      onClick={() => {
                        setFilterPreset(option.id);
                        setFilterValues({ ...option.values });
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="slider-grid section-stack">
                  <label className="slider-field">
                    <span>亮度 {filterValues.brightness}%</span>
                    <input type="range" min="70" max="140" value={filterValues.brightness} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, brightness: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>对比 {filterValues.contrast}%</span>
                    <input type="range" min="70" max="140" value={filterValues.contrast} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, contrast: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>饱和 {filterValues.saturation}%</span>
                    <input type="range" min="0" max="160" value={filterValues.saturation} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, saturation: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>柔焦 {filterValues.blur}px</span>
                    <input type="range" min="0" max="6" step="0.5" value={filterValues.blur} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, blur: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>灰度 {filterValues.grayscale}%</span>
                    <input type="range" min="0" max="100" value={filterValues.grayscale} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, grayscale: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>褐调 {filterValues.sepia}%</span>
                    <input type="range" min="0" max="100" value={filterValues.sepia} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setFilterPreset('custom');
                      setFilterValues((prev) => ({ ...prev, sepia: nextValue }));
                    }} />
                  </label>
                </div>
                <button
                  type="button"
                  className="tool-ghost-button filter-reset-button"
                  onClick={() => {
                    const preset = getFilterPreset('none');
                    setFilterPreset('none');
                    setFilterValues({ ...preset.values });
                  }}
                >
                  <SlidersHorizontal size={16} />
                  重置滤镜
                </button>
              </div>
            </details>

            <details className="tool-section">
              <summary className="tool-section-summary">
                <span className="panel-block-title">
                  <SlidersHorizontal size={18} />
                  文字细调
                </span>
              </summary>
              <div className="tool-section-body">
                <div className="slider-grid">
                  <label className="slider-field">
                    <span>标题字号 {typography.titleSizeScale.toFixed(2)}x</span>
                    <input type="range" min="0.8" max="1.35" step="0.01" value={typography.titleSizeScale} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, titleSizeScale: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>正文字号 {typography.bodySizeScale.toFixed(2)}x</span>
                    <input type="range" min="0.82" max="1.3" step="0.01" value={typography.bodySizeScale} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, bodySizeScale: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>标题字距 {typography.titleLetterSpacing}px</span>
                    <input type="range" min="-1" max="12" step="0.5" value={typography.titleLetterSpacing} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, titleLetterSpacing: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>正文字距 {typography.bodyLetterSpacing}px</span>
                    <input type="range" min="-1" max="8" step="0.5" value={typography.bodyLetterSpacing} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, bodyLetterSpacing: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>行距 {typography.lineHeightScale.toFixed(2)}x</span>
                    <input type="range" min="0.85" max="1.4" step="0.05" value={typography.lineHeightScale} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, lineHeightScale: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>阴影透明 {typography.shadowOpacity}%</span>
                    <input type="range" min="0" max="70" value={typography.shadowOpacity} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, shadowOpacity: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>阴影模糊 {typography.shadowBlur}px</span>
                    <input type="range" min="0" max="40" value={typography.shadowBlur} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, shadowBlur: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>阴影偏移 {typography.shadowOffsetY}px</span>
                    <input type="range" min="0" max="24" value={typography.shadowOffsetY} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, shadowOffsetY: nextValue }));
                    }} />
                  </label>
                  <label className="slider-field">
                    <span>描边粗细 {typography.outlineWidth}px</span>
                    <input type="range" min="0" max="8" step="0.5" value={typography.outlineWidth} onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setTypography((prev) => ({ ...prev, outlineWidth: nextValue }));
                    }} />
                  </label>
                </div>
                <button
                  type="button"
                  className="tool-ghost-button filter-reset-button"
                  onClick={() => setTypography(DEFAULT_TYPOGRAPHY)}
                >
                  <RefreshCw size={16} />
                  重置文字参数
                </button>
              </div>
            </details>
          </section>

          <section className="cover-panel preview-panel">
            <div className="preview-header">
              <div>
                <h2>实时预览</h2>
                <p>右侧预览会固定在视野内，并自动缩放到当前工作区，不需要额外滚动。</p>
              </div>
            </div>
            <div className="canvas-stage">
              <canvas ref={canvasRef} className={`cover-canvas format-${format}`} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
