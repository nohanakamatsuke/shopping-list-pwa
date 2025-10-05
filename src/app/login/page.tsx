'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    setIsLoading(true);

    try{
      // デバッグ用
      console.log('ログイン試行：', { email, password: '###'});

      // メールアドレスとパスワードでサインイン
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // usersコレクションにデータがあるかどうかチェック
      const userDocRef = doc(db,'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      // usersコレクションにデータがない場合は追加
      if(!userDoc.exists()) {
        console.log('usersコレクションにデータが無いため追加します');
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email || 'unknown@example.com',
          displayName: userCredential.user.displayName || userCredential.user.email || '未設定',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        })
        console.log('usersコレクションにデータ追加完了!');
      }

      console.log('ログイン成功：', userCredential.user);
      // alert('ログインしました！');
      // ホーム画面に遷移
      router.push('/');
    }
    catch(error: any){
      console.error('ログインエラー：', error);

      let errorMessage = 'ログインに失敗しました。';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスのユーザーが見つかりません。';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが正しくありません。';
      } else if (error.code === 'auth/user.invalid-email') {
        errorMessage = '無効なメールアドレス形式です。';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効になっています。';
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
			<div className='w-full max-w-lg px-6'>
			  <form 
          onSubmit={handleSubmit}
          className='space-y-5'>
					<div className=''>
						<label htmlFor="email" className='block text-lg'>メールアドレス</label>
						<input 
              type="email"
              id="email" 
              name="email"
              value={email} 
              required 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded text-black bg-white focus:outline-none"/>
					</div>
					<div>
						<label htmlFor="password" className='block text-lg'>パスワード</label>
						<input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              required 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<button 
            type="submit"
            disabled={isLoading} 
            className={`w-full mt-5 px-2 py-3 bg-custom-red rounded-full text-lg font-bold
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-custom-red hover:bg-red-600'}
            `}>
              {isLoading ? 'ログイン中' : 'ログイン'}
          </button>
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