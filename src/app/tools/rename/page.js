'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Download, RefreshCw, FileText, Trash2, ArrowRight, Save, Settings } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './RenameTool.css';
import './ToolsInstructions.css';
import './Dropdown.css';

export default function RenameTool() {
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('sequence');
    const [rules, setRules] = useState({
        sequence: { prefix: 'file_', start: 1, digits: 3, suffix: '' },
        replace: { find: '', replace: '', useRegex: false },
        extension: { newExt: '' },
        add: { text: '', position: 'prefix' }, // position: prefix, suffix
        case: { type: 'none' }, // none, lower, upper, capitalize
    });

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        const newFiles = uploadedFiles.map(file => ({
            originalFile: file,
            originalName: file.name,
            newName: file.name,
            size: file.size,
            id: Math.random().toString(36).substr(2, 9)
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const clearFiles = () => {
        if (confirm('确定要清空列表吗？')) {
            setFiles([]);
        }
    };

    const resetNames = () => {
        setFiles(prev => prev.map(f => ({ ...f, newName: f.originalName })));
    };

    // Apply rules whenever rules or file list changes
    useEffect(() => {
        if (files.length === 0) return;

        setFiles(prevFiles => {
            return prevFiles.map((file, index) => {
                let name = file.originalName;
                const extIndex = name.lastIndexOf('.');
                let baseName = extIndex !== -1 ? name.substring(0, extIndex) : name;
                let ext = extIndex !== -1 ? name.substring(extIndex) : '';

                if (activeTab === 'sequence') {
                    const { prefix, start, digits, suffix } = rules.sequence;
                    const num = String(index + parseInt(start) || 0).padStart(parseInt(digits) || 0, '0');
                    name = `${prefix}${num}${suffix}${ext}`;
                }
                else if (activeTab === 'replace') {
                    const { find, replace, useRegex } = rules.replace;
                    if (find) {
                        if (useRegex) {
                            try {
                                const regex = new RegExp(find, 'g');
                                name = name.replace(regex, replace);
                            } catch (e) { /* ignore invalid regex */ }
                        } else {
                            name = name.split(find).join(replace);
                        }
                    }
                }
                else if (activeTab === 'extension') {
                    const { newExt } = rules.extension;
                    if (newExt) {
                        const cleanExt = newExt.startsWith('.') ? newExt : `.${newExt}`;
                        name = baseName + cleanExt;
                    }
                }
                else if (activeTab === 'add') {
                    const { text, position } = rules.add;
                    if (position === 'prefix') {
                        name = text + baseName + ext;
                    } else {
                        name = baseName + text + ext;
                    }
                }
                else if (activeTab === 'case') {
                    const { type } = rules.case;
                    if (type === 'lower') name = name.toLowerCase();
                    if (type === 'upper') name = name.toUpperCase();
                    if (type === 'capitalize') {
                        // Title Case
                        name = name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                    }
                }

                return { ...file, newName: name };
            });
        });

    }, [rules, activeTab]); // Note: excluding 'files' dependency to avoid infinite loop. 
    // Wait, if I exclude files, it won't update when files are added? 
    // Actually, I should separate raw files and processed files, OR just compute derived state.
    // Better approach: Compute new names on the fly or only trigger update when rules change.

    // Correction: The above useEffect is problematic because it updates state based on state. 
    // Let's make `previewFiles` a derived variable? No, we want to allow manual editing of newName too.
    // So, we have two modes: "Auto Preview" and "Manual Override".
    // For simplicity in this v1tool, let's just Apply Rule manually or auto-apply to all.

    const applyRuleToAll = () => {
        setFiles(prevFiles => {
            return prevFiles.map((file, index) => {
                let name = file.originalName; // Always start from original for non-destructive edits? 
                // Or chain edits? The reference tool usually applies rule to current state or original.
                // Let's restart from originalName to avoid compounding errors in 'Replace' mode.

                const extIndex = name.lastIndexOf('.');
                let baseName = extIndex !== -1 ? name.substring(0, extIndex) : name;
                let ext = extIndex !== -1 ? name.substring(extIndex) : '';

                let newName = name;

                if (activeTab === 'sequence') {
                    const { prefix, start, digits, suffix } = rules.sequence;
                    const num = String(index + parseInt(start || 1)).padStart(parseInt(digits || 1), '0');
                    newName = `${prefix}${num}${suffix}${ext}`;
                }
                else if (activeTab === 'replace') {
                    const { find, replace, useRegex } = rules.replace;
                    if (find) {
                        try {
                            if (useRegex) {
                                const regex = new RegExp(find, 'g');
                                newName = name.replace(regex, replace);
                            } else {
                                newName = name.split(find).join(replace);
                            }
                        } catch (e) { }
                    }
                }
                else if (activeTab === 'extension') {
                    const { newExt } = rules.extension;
                    if (newExt) {
                        const cleanExt = newExt.startsWith('.') ? newExt : `.${newExt}`;
                        newName = baseName + cleanExt;
                    }
                }
                else if (activeTab === 'add') {
                    const { text, position } = rules.add;
                    if (position === 'prefix') {
                        newName = text + baseName + ext;
                    } else {
                        newName = baseName + text + ext;
                    }
                }
                else if (activeTab === 'case') {
                    const { type } = rules.case;
                    if (type === 'lower') newName = name.toLowerCase();
                    if (type === 'upper') newName = name.toUpperCase();
                }

                return { ...file, newName: newName };
            });
        });
    };

    // Auto-apply when rules change
    useEffect(() => {
        if (files.length > 0) {
            applyRuleToAll();
        }
    }, [rules, activeTab]);


    const handleDownloadAll = async () => {
        if (files.length === 0) return;

        const zip = new JSZip();
        files.forEach(file => {
            zip.file(file.newName, file.originalFile);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'renamed_files.zip');
    };

    const handleExportScript = (type) => {
        if (files.length === 0) return;

        let content = '';
        const mimeType = 'text/plain;charset=utf-8';
        let fileName = 'rename_script';

        if (type === 'bat') {
            // Windows Batch
            content += '@echo off\r\n';
            content += 'chcp 65001 >nul\r\n'; // UTF-8
            content += 'echo Renaming files...\r\n';
            files.forEach(f => {
                if (f.originalName !== f.newName) {
                    // Escape quotes if strictly necessary, but simple quotes usually work for ren
                    // ren "old name.ext" "new name.ext"
                    content += `ren "${f.originalName}" "${f.newName}"\r\n`;
                }
            });
            content += 'echo Renaming Complete!\r\n';
            content += 'pause\r\n';
            fileName += '.bat';
        } else {
            // Unix Shell
            content += '#!/bin/bash\n\n';
            files.forEach(f => {
                if (f.originalName !== f.newName) {
                    content += `mv "${f.originalName}" "${f.newName}"\n`;
                }
            });
            fileName += '.sh';
        }

        const blob = new Blob([content], { type: mimeType });
        saveAs(blob, fileName);
    };

    return (
        <div className="rename-tool-container">
            <div className="home-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

                <div className="tool-header">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        文件批量重命名
                    </motion.h1>
                    <p>安全、快速、纯前端处理，您的文件不会上传到服务器</p>
                </div>

                <div className="tool-instructions-wrapper">
                    <details className="tool-instructions">
                        <summary>💡 新手指南：如何使用批量重命名？</summary>
                        <div className="instruction-content">
                            <div className="instruction-item">
                                <span className="step-badge">1</span>
                                <div>
                                    <h4>导入文件</h4>
                                    <p>点击下方虚线区域或直接将文件**拖拽**至此。支持一次性选择多个文件。</p>
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="step-badge">2</span>
                                <div>
                                    <h4>选择规则</h4>
                                    <p><strong>序号格式</strong>：生成 img_001.jpg 这种规范文件名。</p>
                                    <p><strong>查找替换</strong>：批量替换文字，支持正则表达式。</p>
                                    <p><strong>添加字符</strong>：在文件名前/后统一添加文字。</p>
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="step-badge">3</span>
                                <div>
                                    <h4>预览与导出</h4>
                                    <p>表格中实时预览新文件名，支持<strong>手动微调</strong>单个文件。满意后点击底部的“打包下载”即可。</p>
                                </div>
                            </div>
                            <div className="instruction-item">
                                <span className="step-badge">4</span>
                                <div>
                                    <h4>秒杀大文件 🔥</h4>
                                    <p>文件太大下载慢？尝试右下角的<strong>“导出脚本”</strong>。下载脚本到文件同级目录，双击运行即可瞬间完成重命名！</p>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                <motion.div
                    className="rename-glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* File Uploader */}
                    <div className="file-uploader" onClick={() => document.getElementById('fileInput').click()}>
                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <Upload className="upload-icon" />
                        <h3>点击或拖拽文件到这里</h3>
                        <p style={{ color: '#999', marginTop: '0.5rem' }}>支持任意格式，数量不限</p>
                    </div>

                    {/* Rule Controls */}
                    <div className="rule-tabs">
                        {[
                            { id: 'sequence', label: '序号格式' },
                            { id: 'replace', label: '查找替换' },
                            { id: 'extension', label: '扩展名' },
                            { id: 'add', label: '添加字符' },
                            { id: 'case', label: '大小写' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="rule-panel">
                        {activeTab === 'sequence' && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>前缀文本</label>
                                    <input
                                        className="tool-input"
                                        placeholder="例如: img_"
                                        value={rules.sequence.prefix}
                                        onChange={(e) => setRules({ ...rules, sequence: { ...rules.sequence, prefix: e.target.value } })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>起始序号</label>
                                    <input
                                        className="tool-input"
                                        type="number"
                                        placeholder="1"
                                        value={rules.sequence.start}
                                        onChange={(e) => setRules({ ...rules, sequence: { ...rules.sequence, start: e.target.value } })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>序号位数</label>
                                    <input
                                        className="tool-input"
                                        type="number"
                                        placeholder="3 (即 001)"
                                        value={rules.sequence.digits}
                                        onChange={(e) => setRules({ ...rules, sequence: { ...rules.sequence, digits: e.target.value } })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>后缀文本</label>
                                    <input
                                        className="tool-input"
                                        placeholder="可选"
                                        value={rules.sequence.suffix}
                                        onChange={(e) => setRules({ ...rules, sequence: { ...rules.sequence, suffix: e.target.value } })}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'replace' && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>查找内容</label>
                                    <input
                                        className="tool-input"
                                        placeholder="输入要查找的文字"
                                        value={rules.replace.find}
                                        onChange={(e) => setRules({ ...rules, replace: { ...rules.replace, find: e.target.value } })}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}><ArrowRight color="#ccc" /></div>
                                <div className="input-group">
                                    <label>替换为</label>
                                    <input
                                        className="tool-input"
                                        placeholder="留空则删除查找内容"
                                        value={rules.replace.replace}
                                        onChange={(e) => setRules({ ...rules, replace: { ...rules.replace, replace: e.target.value } })}
                                    />
                                </div>
                                <div className="input-group" style={{ flex: '0 0 auto', justifyContent: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginTop: '30px' }}>
                                        <input
                                            type="checkbox"
                                            checked={rules.replace.useRegex}
                                            onChange={(e) => setRules({ ...rules, replace: { ...rules.replace, useRegex: e.target.checked } })}
                                        /> 正则表达式
                                    </label>
                                </div>
                            </div>
                        )}
                        {activeTab === 'extension' && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>新扩展名 (不含.)</label>
                                    <input
                                        className="tool-input"
                                        placeholder="例如: jpg, png, mp4"
                                        value={rules.extension.newExt}
                                        onChange={(e) => setRules({ ...rules, extension: { ...rules.extension, newExt: e.target.value } })}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'add' && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>插入位置</label>
                                    <select
                                        className="tool-input"
                                        value={rules.add.position}
                                        onChange={(e) => setRules({ ...rules, add: { ...rules.add, position: e.target.value } })}
                                    >
                                        <option value="prefix">添加到开头</option>
                                        <option value="suffix">添加到结尾</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>文本内容</label>
                                    <input
                                        className="tool-input"
                                        placeholder="输入要添加的文字"
                                        value={rules.add.text}
                                        onChange={(e) => setRules({ ...rules, add: { ...rules.add, text: e.target.value } })}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'case' && (
                            <div className="input-row">
                                <div className="input-group">
                                    <label>转换模式</label>
                                    <select
                                        className="tool-input"
                                        value={rules.case.type}
                                        onChange={(e) => setRules({ ...rules, case: { ...rules.case, type: e.target.value } })}
                                    >
                                        <option value="none">保持原样</option>
                                        <option value="lower">全部小写 (lowercase)</option>
                                        <option value="upper">全部大写 (UPPERCASE)</option>
                                        <option value="capitalize">首字母大写 (Title Case)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Table */}
                    {files.length > 0 && (
                        <div className="preview-table-container">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th>原文件名</th>
                                        <th style={{ width: '30px' }}><ArrowRight size={16} /></th>
                                        <th>新文件名</th>
                                        <th style={{ width: '80px' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file, index) => (
                                        <tr key={file.id}>
                                            <td style={{ color: '#999' }}>{index + 1}</td>
                                            <td style={{ wordBreak: 'break-all' }}>{file.originalName}</td>
                                            <td><ArrowRight size={14} color="#FF69B4" /></td>
                                            <td>
                                                <input
                                                    value={file.newName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, newName: val } : f));
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '5px',
                                                        border: '1px solid transparent',
                                                        background: 'transparent',
                                                        color: file.newName !== file.originalName ? '#FF69B4' : 'inherit',
                                                        fontWeight: file.newName !== file.originalName ? '500' : 'normal'
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ff4d4f' }}
                                                    title="移除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Sticky Action Bar */}
                {files.length > 0 && (
                    <motion.div
                        className="action-bar"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                    >
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={clearFiles}>
                                <Trash2 size={16} style={{ marginRight: '5px' }} /> 清空
                            </button>
                            <button className="btn-secondary" onClick={resetNames}>
                                <RefreshCw size={16} style={{ marginRight: '5px' }} /> 还原
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: '#666', marginRight: '1rem' }}>
                                共 {files.length} 个文件
                            </span>
                            <div className="export-action-group">
                                <button className="btn-primary" onClick={handleDownloadAll} title="适用于小文件">
                                    <Download size={18} /> 打包下载 (Zip)
                                </button>
                                <div className="export-dropdown">
                                    <button className="btn-outline-primary dropdown-trigger">
                                        <FileText size={18} /> 导出脚本
                                    </button>
                                    <div className="dropdown-menu">
                                        <div onClick={() => handleExportScript('bat')} className="dropdown-item">
                                            <span>Windows (.bat)</span>
                                            <small>推荐大文件</small>
                                        </div>
                                        <div onClick={() => handleExportScript('sh')} className="dropdown-item">
                                            <span>Mac/Linux (.sh)</span>
                                            <small>推荐大文件</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
