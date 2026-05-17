'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 页面配置
const pages = [
  { id: 'learning', name: '学习', path: '/' },
  { id: 'import', name: '导入', path: '/import' },
  { id: 'vocabulary', name: '词汇表', path: '/vocabulary' },
  { id: 'progress', name: '进度', path: '/progress' },
  { id: 'settings', name: '设置', path: '/settings' }
];

const Header = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentPage = pages.find(p => p.path === pathname) || pages[0];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="global-nav">
      <div className="nav-content">
        {/* Logo 区域 */}
        <Link href="/" className="logo cursor-pointer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#0066cc'}}>
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <span>FreeWord</span>
        </Link>
        
        {/* 桌面端导航 */}
        <nav className="hidden md:flex space-x-1">
          {pages.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 移动端页面切换按钮 */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            className={`mobile-trigger-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            <span>{currentPage.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={menuOpen ? 'rotate-180' : ''} style={{transition: 'transform 0.2s'}}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="mobile-dropdown-panel">
              {pages.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`mobile-dropdown-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </Link>
                );
              })}
              <div className="menu-footer">FreeWord</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;