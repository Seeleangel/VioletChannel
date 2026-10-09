'use client';

import React, { useState, useEffect } from 'react';
import { Save, Key, Globe, Mail } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdmin } from '../../../hooks/useAdmin';
import './settings.css';

export default function SettingsPage() {
  const { checkAuth } = useAdmin({ redirectOnFail: true });
  const [settings, setSettings] = useState({
    siteTitle: "Violet's Channel",
    siteDescription: '一个关于我的个人网站',
    adminEmail: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    setSaving(true);
    try {
      // TODO: 实现设置保存 API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('设置已保存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        <div className="page-header">
          <h1>系统设置</h1>
          <p className="subtitle">管理你的网站配置</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Globe size={20} />
                网站信息
              </h2>
            </div>

            <div className="form-group">
              <label htmlFor="siteTitle">网站标题</label>
              <input
                id="siteTitle"
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="siteDescription">网站描述</label>
              <textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminEmail">管理员邮箱</label>
              <input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <Key size={20} />
                安全设置
              </h2>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">新密码</label>
              <input
                id="newPassword"
                type="password"
                value={settings.newPassword}
                onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                placeholder="留空表示不修改"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                id="confirmPassword"
                type="password"
                value={settings.confirmPassword}
                onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={20} />
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
