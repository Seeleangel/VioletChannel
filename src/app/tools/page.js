'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Image, Edit, ArrowRight } from 'lucide-react';
import './Tools.css';

export default function ToolsPage() {
    const tools = [
        {
            id: 'imgcompress',
            title: '图片批量压缩',
            desc: '纯前端处理，支持多格式批量压缩，保护隐私',
            icon: Image,
            link: '/imgcompress',
            color: '#FF69B4',
            bgColor: '#FFF0F5'
        },
        {
            id: 'rename',
            title: '批量重命名',
            desc: '支持序号、替换、扩展名修改等多种规则',
            icon: Edit,
            link: '/tools/rename',
            color: '#9370DB',
            bgColor: '#E6E6FA'
        }
    ];

    return (
        <div className="tools-container">
            <div className="tools-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    实用工具箱
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    提升效率的小帮手，全部运行在您的浏览器本地
                </motion.p>
            </div>

            <div className="tools-grid">
                {tools.map((tool, index) => (
                    <Link href={tool.link} key={tool.id} style={{ textDecoration: 'none' }}>
                        <motion.div
                            className="tool-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        >
                            <div className="tool-icon-wrapper" style={{ background: tool.bgColor, color: tool.color }}>
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
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
