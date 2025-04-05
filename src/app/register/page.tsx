'use client';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const SignUpPage: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
  
    try{
      // メールアドレスとパスワードでユーザー登録
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert('アカウントを作成しました！');
      // ホーム画面に遷移
      router.push('/');
    }
    catch(error){
      console.error(error);
      // エラーコードに基づいてメッセージをアラートで表示
      if ((error as { code?: string }).code === 'auth/email-already-in-use') {
        alert('このメールアドレスは既に使用されています。別のメールアドレスを使用するか、ログインしてください。');
      } else if ((error as { code?: string }).code === 'auth/invalid-email') {
        alert('無効なメールアドレス形式です。');
      } else if ((error as { code?: string }).code === 'auth/weak-password') {
        alert('パスワードが弱すぎます。6文字以上の強力なパスワードを使用してください。');
      } else {
        alert('登録に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラーが発生しました'));
      }
    }
  };

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
			<div className='w-full max-w-lg px-6'>
				<form 
          onSubmit={handleSubmit}
          className='space-y-5'>
					<div>
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
					<div>
						<label htmlFor="password" className='block text-lg'>表示名</label>
						<input type="text" id="show-name" name="show-name" required className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<button type="submit" className='w-full mt-5 px-2 py-3 bg-[#FF5154] rounded-full text-lg font-bold'>新規登録</button>
				 </form>
			</div>
	);
};
export default SignUpPage;