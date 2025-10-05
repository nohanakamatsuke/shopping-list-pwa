'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // メニューの開閉状態を現在とは反対にする関数
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // メニューを閉じる関数
  const closeMenu = () => {
    setIsMenuOpen(false);
  }


  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      // ログアウト後はホーム画面に遷移
      window.location.href = '/';
    }catch (error) {
      console.log('ログアウトエラー：', error);
    }
  }

  return (
    <>
      <div className='mt-2 container mx-auto px-4 flex justify-between items-center'>
        {/* ロゴ */}
        <Link href="/" onClick={closeMenu}>
          <div className='flex items-center text-white'>
            <span className='text-3xl md:text-2xl font-bold'>
              Shopping List
            </span>
          </div>
        </Link>

        {/* ハンバーガーメニューボタン */}
        <div className='flex space-x-4 md:space-x-5 xl:space-x-10 pr-2'>
          {isAuthenticated && (
            <button
              onClick={toggleMenu}
              className=''
            >
              {isMenuOpen ? (
                <XMarkIcon className='w-10 h-10'/>
              ):(
                <Bars3Icon className='w-10 h-10'/>
              )}
            </button>    
          )}
        </div> 

        {/* サイドメニューオーバーレイ */}
        {isAuthenticated && isMenuOpen && (
          <div
            onClick={closeMenu}
            className='fixed inset-0 bg-balck bg-opacity-50 z-40'
          />
        )}

        {/* サイドメニュー */}
        {isAuthenticated && (
        <div className={`fixed top-0 right-0 h-full w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* メニューヘッダー */}
          <div className="bg-custom-red text-white p-4 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{user?.displayName || 'ユーザー'}</p>
                <p className="text-xs opacity-90">{user?.email}</p>
              </div>
              <button
                onClick={closeMenu}
                className="p-1 rounded-md hover:bg-red-600"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* メニュー項目 */}
          <nav className="p-4">
            <div className="space-y-2">
              {/* お店を追加 */}
              <Link
                href="/add-shop"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMenu}
              >
                <span className="text-lg mr-3">🏪</span>
                <span>お店を追加</span>
              </Link>

              {/* 友達を追加 */}
              <Link
                href="/add-friends"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMenu}
              >
                <span className="text-lg mr-3">👥</span>
                <span>友達を追加</span>
              </Link>

              {/* 友達一覧 */}
              <Link
                href="/friends"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMenu}
              >
                <span className="text-lg mr-3">📋</span>
                <span>友達一覧</span>
              </Link>

              {/* プロフィール */}
              {/* <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMenu}
              >
                <span className="text-lg mr-3">👤</span>
                <span>プロフィール</span>
              </Link> */}

              {/* 区切り線 */}
              <hr className="my-4" />

              {/* ログアウト */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <span className="text-lg mr-3">🚪</span>
                <span>ログアウト</span>
              </button>
            </div>
          </nav>
        </div>
      )}
      </div>  
    </>  
  );
};

