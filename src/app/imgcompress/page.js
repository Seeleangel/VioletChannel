'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Download, Trash2, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import DropZone from '../../components/DropZone';
import SettingsPanel from '../../components/SettingsPanel';
import ImageItem from '../../components/ImageItem';
import { compressImage } from '../../utils/compressor';
import '../../pages/Home.css'; // Assuming we want global styles or specific styles.
// ImgCompress might have had its own styles, usually in index.css or direct.
// Since Home.css is imported in layout, we might not need to import it here again if it's global,
// but importing it ensures specific classes are available if not global.

export default function ImgCompress() {
    const [files, setFiles] = useState([]);
    const [settings, setSettings] = useState({
        quality: 0.8,
        maxWidthOrHeight: 1920,
        maxSizeMB: 1
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const updateSettings = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const startCompression = async (itemsToCompress) => {
        setIsProcessing(true);

        const concurrency = 3;
        for (let i = 0; i < itemsToCompress.length; i += concurrency) {
            const chunk = itemsToCompress.slice(i, i + concurrency);
            await Promise.all(chunk.map(async (item) => {
                setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'compressing', progress: 10 } : f));

                try {
                    const result = await compressImage(item.originalFile, settings);
                    const url = URL.createObjectURL(result);

                    setFiles(prev => prev.map(f => f.id === item.id ? {
                        ...f,
                        status: 'done',
                        progress: 100,
                        compressedFile: result,
                        url
                    } : f));
                } catch (error) {
                    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', progress: 0 } : f));
                }
            }));
        }

        setIsProcessing(false);
    };

    const onFilesAddedWrapper = (newFiles) => {
        const newItems = newFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            originalFile: file,
            compressedFile: null,
            status: 'pending',
            progress: 0,
            url: null,
            preview: URL.createObjectURL(file) // Stable preview URL
        }));

        setFiles(prev => [...prev, ...newItems]);
        startCompression(newItems);
    };

    const removeFile = (id) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file) {
                if (file.url) URL.revokeObjectURL(file.url);
                if (file.preview) URL.revokeObjectURL(file.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const clearAll = () => {
        files.forEach(f => {
            if (f.url) URL.revokeObjectURL(f.url);
            if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setFiles([]);
    };

    const downloadAll = async () => {
        const zip = new JSZip();
        const completedFiles = files.filter(f => f.status === 'done' && f.compressedFile);

        if (completedFiles.length === 0) return;

        completedFiles.forEach(f => {
            zip.file(`compressed-${f.originalFile.name}`, f.compressedFile);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'images-compressed.zip');
    };

    const recompressAll = () => {
        if (files.length === 0 || isProcessing) return;

        const resetFiles = files.map(f => ({
            ...f,
            status: 'pending',
            progress: 0,
            compressedFile: null,
            url: f.url
        }));

        setFiles(resetFiles);
        startCompression(resetFiles);
    };

    const completedCount = files.filter(f => f.status === 'done').length;

    return (
        <div className="container" style={{ paddingTop: '80px' }}>
            <header style={{ marginBottom: '3rem', marginTop: '2rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'var(--glass-bg)', borderRadius: '99px', border: '1px solid var(--glass-border)' }}>
                        <Sparkles size={18} className="text-gradient" style={{ color: '#c084fc' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Next-Gen Image Optimizer</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                        Batch <span className="text-gradient">Compress</span>
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        Privately compress your images directly in your browser.
                    </p>
                </motion.div>
            </header>

            <main>
                <SettingsPanel settings={settings} updateSettings={updateSettings} disabled={isProcessing} />

                <div style={{ marginBottom: '2rem' }}>
                    <DropZone onFilesAdded={onFilesAddedWrapper} />
                </div>

                {files.length > 0 && (
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={20} color="var(--color-primary)" />
                                <h3 style={{ margin: 0 }}>Images ({files.length})</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {completedCount > 0 && (
                                    <button onClick={downloadAll} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                        <Download size={16} /> Download All
                                    </button>
                                )}
                                <button onClick={clearAll} className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <Trash2 size={16} /> Clear All
                                </button>
                                <button onClick={recompressAll} className="btn" disabled={isProcessing} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <RefreshCw size={16} className={isProcessing ? "animate-spin" : ""} /> Re-compress
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <AnimatePresence>
                                {files.map(file => (
                                    <ImageItem key={file.id} item={file} onRemove={removeFile} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)', paddingBottom: '2rem' }}>
                <p>© {new Date().getFullYear()} ImageExpress. Built with the future in mind.</p>
            </footer>
        </div>
    );
}
