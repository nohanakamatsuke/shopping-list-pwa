'use client';

import React, { useEffect, useState } from 'react';
import { PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Link from 'next/link';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Firebase Authの状態を監視するためのフック
  // コンポーネントのレンダリング後に、非同期的に実行
  useEffect(() => {
    const stopWatching = onAuthStateChanged(auth, (user) => {

      // ユーザーがログインしている場合はtrue、そうでない場合はfalseをセット
      if (user) {
        setIsLoggedIn(true);
        // ユーザー情報をコンソールに表示
        console.log("ログインユーザー情報:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL
        });
      }else{
        setIsLoggedIn(false);
      }
    });
    
    // コンポーネントが消える時に監視を停止
    return () => {
      stopWatching();
    };
  }, []);

  // デバッグ用
  useEffect(() => {
    console.log("現在のログイン状態:", isLoggedIn);
  }, [isLoggedIn]);



  return (
    <header className='w-full py-5'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <Link href="/">
          <h1 className='text-3xl text-custom-blue font-black'>Shopping List</h1>
        </Link>
        <div className='flex space-x-4 md:space-x-5 xl:space-x-10 pr-2'>
          {isLoggedIn && (
            <>
              <PlusIcon className='w-10 md:w-12 text-custom-blue hover:bg-blue-300 hover:text-white rounded-full'/>
              <UserCircleIcon className='w-10 md:w-12 text-custom-blue hover:bg-blue-300 hover:text-white rounded-full'/>
            </>
          )}
        </div> 
      </div>  
    </header>
  );
};


export default Header;