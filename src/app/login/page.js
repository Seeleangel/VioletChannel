'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import '../../pages/Home.css';

export default function Login() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                // 登录成功，跳转回首页
                router.push('/');
                router.refresh(); // 刷新以更新状态
            } else {
                alert('密码错误');
                setPassword('');
            }
        } catch (error) {
            alert('登录出错');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="contact-card"
                style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: '#FFF0F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#FF69B4' }}>
                        <Lock size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '0.5rem' }}>管理员登录</h1>
                    <p style={{ color: '#666' }}>请输入密码以解锁编辑权限</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入密码..."
                            className="form-input"
                            style={{ textAlign: 'center', letterSpacing: '2px' }}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? '验证中...' : '解锁'} <ArrowRight size={18} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
