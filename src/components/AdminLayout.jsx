'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Image,
  Music,
  Mail,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  User
} from 'lucide-react';
import './AdminLayout.css';

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin' },
  { icon: User, label: '个人资料', path: '/admin/profile' },
  { icon: FileText, label: '博客管理', path: '/admin/blog' },
  { icon: MapPin, label: '旅行管理', path: '/admin/travels' },
  { icon: Image, label: '图片管理', path: '/admin/images' },
  { icon: Music, label: '音乐管理', path: '/admin/music' },
  { icon: Mail, label: '联系表单', path: '/admin/contacts' },
  { icon: Settings, label: '系统设置', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <motion.aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
      >
        <div className="sidebar-header">
          <Link href="/" className="brand">
            {sidebarOpen ? "Violet's Admin" : 'V'}
          </Link>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="nav-item">
            <Home size={20} />
            {sidebarOpen && <span>返回首页</span>}
          </Link>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
