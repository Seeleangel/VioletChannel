'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import './Navigation.css';

function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <motion.nav
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
                <motion.span
                  className="tab"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ display: 'inline-block' }}
                >
                  {tab}
                </motion.span>
              </Link>
            );
          }
          if (tab === 'Tools') {
            return (
              <Link key={tab} href="/tools">
                <motion.span
                  className="tab"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ display: 'inline-block' }}
                >
                  {tab}
                </motion.span>
              </Link>
            );
          }
          href = tab === 'ME' ? '#me' : `#${tab.toLowerCase()}`;
          return (
            <motion.a
              key={tab}
              href={href}
              className="tab"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {tab}
            </motion.a>
          );
        })}
      </div>
    </motion.nav>
  );
}

export default Navigation;
