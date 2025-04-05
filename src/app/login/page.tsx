'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    try{
      // メールアドレスとパスワードでサインイン
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert('ログインしました！');
      // ホーム画面に遷移
      router.push('/');
    }
    catch(error){
      console.error(error);
      // エラーコードに基づいてメッセージをアラートで表示
    }
  };

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

  return (
			<div className='w-full max-w-lg px-6'>
			  <form 
          onSubmit={handleSubmit}
          className='space-y-5'>
					<div className=''>
						<label htmlFor="email" className='block text-lg'>メールアドレス</label>
						<input type="email" id="email" name="email" 
            required 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded text-black bg-white focus:outline-none"/>
					</div>
					<div>
						<label htmlFor="password" className='block text-lg'>パスワード</label>
						<input type="password" id="password" name="password" 
            required 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<button type="submit" className='w-full mt-5 px-2 py-3 bg-[#FF5154] rounded-full text-lg font-bold'>ログイン</button>
					<div className="mt-6 text-center">
            <Link href="/register" className="text-white text-base">
            アカウント作成はこちら
            </Link>
          </div>
				 </form>
			</div>
	);
};
export default LoginPage;