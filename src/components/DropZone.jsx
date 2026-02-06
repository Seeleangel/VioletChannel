'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, FileUp } from 'lucide-react';
import clsx from 'clsx';

const DropZone = ({ onFilesAdded }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            onFilesAdded(files);
        }
    };

    const handleChange = (e) => {
        const files = Array.from(e.target.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            onFilesAdded(files);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <motion.div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "relative flex flex-col items-center justify-center w-full min-h-[300px] rounded-[var(--radius-lg)] border-2 border-dashed cursor-pointer transition-colors duration-300",
                isDragActive
                    ? "border-[var(--color-primary)] bg-[rgba(139,92,246,0.1)]"
                    : "border-[var(--glass-border)] hover:border-[var(--color-primary-hover)] hover:bg-[var(--glass-bg)]"
            )}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            style={{
                borderStyle: 'dashed',
                borderWidth: '2px',
                background: isDragActive ? 'rgba(139,92,246,0.1)' : 'var(--glass-bg)',
                borderColor: isDragActive ? 'var(--color-primary)' : 'var(--glass-border)',
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '1.5rem',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    marginBottom: '1.5rem',
                    color: isDragActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                }}>
                    {isDragActive ? <FileUp size={48} /> : <Upload size={48} />}
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isDragActive ? "Drop images here" : "Drag & Drop images"}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    or click to browse files
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                    Supports JPG, PNG, WEBP
                </p>
            </div>
        </motion.div>
    );
};

export default DropZone;
