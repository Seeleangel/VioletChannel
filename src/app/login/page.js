'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion as Motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import './login.css';

export default function Login() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const nextPath = new URLSearchParams(window.location.search).get('next') || '/admin';
        router.push(nextPath);
        router.refresh();
        return;
      }

      if (res.status === 500 && data?.error === 'ADMIN_PASSWORD is not configured') {
        setError('服务器没有配置管理员密码，请先在部署环境设置 ADMIN_PASSWORD。');
      } else {
        setError('密码错误');
      }

      setPassword('');
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-header">
          <div className="lock-icon">
            <Lock size={32} />
          </div>
          <h1>管理后台登录</h1>
          <p>欢迎回来，Violet</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入管理员密码"
              required
              autoFocus
            />
          </div>

          {error ? <div className="error-message">{error}</div> : null}

          <button type="submit" className="login-btn" disabled={loading}>
            <LogIn size={20} />
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">返回首页</a>
        </div>
      </Motion.div>
    </div>
  );
}
