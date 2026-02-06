'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight, FileImage, Download } from 'lucide-react';
import { formatBytes } from '../utils/compressor';

const ImageItem = ({ item, onRemove }) => {
    const { originalFile, compressedFile, status, progress, url, preview } = item;

    const compressionRatio = compressedFile
        ? ((1 - (compressedFile.size / originalFile.size)) * 100).toFixed(1)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-panel"
            style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Progress Bar Background */}
            {status === 'compressing' && (
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '2px',
                        background: 'var(--color-primary)',
                        zIndex: 10
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            )}

            {/* Thumbnail */}
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#000'
            }}>
                <img
                    src={url || preview}
                    alt={originalFile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {originalFile.name}
                    </h4>
                    {status === 'done' && (
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>
                            -{compressionRatio}%
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <span>{formatBytes(originalFile.size)}</span>
                    <ArrowRight size={14} />
                    <span style={{ color: status === 'done' ? 'white' : 'inherit', fontWeight: status === 'done' ? 600 : 400 }}>
                        {status === 'done' ? formatBytes(compressedFile.size) : '...'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {status === 'done' && (
                    <a
                        href={url}
                        download={`compressed-${originalFile.name}`}
                        className="btn-icon"
                        title="Download"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Download size={18} />
                    </a>
                )}
                <button
                    onClick={() => onRemove(item.id)}
                    className="btn-icon"
                    title="Remove"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.1)' }}
                >
                    <X size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default ImageItem;
