'use client';
import React, { use, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    setIsLoading(true);
  
    try{
      // デバッグ用
      console.log('登録試行：', {email, displayName});

      // メールアドレスとパスワードでユーザー登録
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('ユーザー作成成功：', userCredential.user);

      // displayNameを設定
      if (displayName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
        console.log('displayName設定完了：', displayName);
      }

      // userコレクションにもユーザー情報を登録
      await setDoc(doc(db,'users',userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName.trim() || email,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      console.log('userコレクションに保存完了!');

      // alert('アカウントを作成しました！');
      // ホーム画面に遷移
      router.push('/');
    }
    catch(error: any){
      console.error('登録エラー；', error);

// エラーコードに基づいてメッセージをアラートで表示
      if (error.code === 'auth/email-already-in-use') {
        alert('このメールアドレスは既に使用されています。別のメールアドレスを使用するか、ログインしてください。');
      } else if (error.code === 'auth/invalid-email') {
        alert('無効なメールアドレス形式です。');
      } else if (error.code === 'auth/weak-password') {
        alert('パスワードが弱すぎます。6文字以上の強力なパスワードを使用してください。');
      } else {
        alert('登録に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラーが発生しました'));
      }
    } finally {
      setIsLoading(false);
    }
  };

	return (
			<div className='w-full max-w-lg px-6'>
				<form 
          onSubmit={handleSubmit}
          className='space-y-5'>
					<div>
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
					<div>
						<label htmlFor="displayName" className='block text-lg'>表示名</label>
						<input 
              type="text" 
              id="displayName" 
              name="displayName" 
              value={displayName}
              required 
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<button 
            type="submit" 
            disabled={isLoading}
            className={`w-full mt-5 px-2 py-3 bg-custom-red rounded-full text-lg font-bold ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-custom-red hover:bg-red-600'
                }`}>
              {isLoading ? '登録中...' : '新規登録'}
          </button>
				 </form>
			</div>
	);
};
export default SignUpPage;