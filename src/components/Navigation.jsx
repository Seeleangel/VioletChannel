'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion as Motion } from 'framer-motion';
import './Navigation.css';

function Navigation() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <Motion.nav
      className="navigation"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Link href="/" className="nav-logo">Violet.</Link>

      <div className="nav-links">
        {['ME', 'Information', 'Interests', 'Friends', 'Blog', 'Tools'].map((tab) => {
          let href;
          if (tab === 'Blog') {
            return (
              <Link key={tab} href="/blog">
                <Motion.span
                  className="tab"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ display: 'inline-block' }}
                >
                  {tab}
                </Motion.span>
              </Link>
            );
          }
          if (tab === 'Tools') {
            return (
              <Link key={tab} href="/tools">
                <Motion.span
                  className="tab"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ display: 'inline-block' }}
                >
                  {tab}
                </Motion.span>
              </Link>
            );
          }
          href = tab === 'ME' ? '#me' : `#${tab.toLowerCase()}`;
          return (
            <Motion.a
              key={tab}
              href={href}
              className="tab"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {tab}
            </Motion.a>
          );
        })}
      </div>
    </Motion.nav>
  );
}

export default Navigation;
