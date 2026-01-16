'use client';

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

  return (
    <header className="global-nav">
      <div className="nav-content">
        {/* Logo 区域 */}
        <div className="logo cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#0066cc'}}>
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <span>FreeWord</span>
        </div>
        
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
      </div>
    </header>
  );
};

export default Header;