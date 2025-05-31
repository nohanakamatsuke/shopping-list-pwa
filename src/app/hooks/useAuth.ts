'use client';

import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

export function useAuth(){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Firebase Authの状態を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // デバッグ用ログ（本番時は削除）
      if (user) {
        console.log('ログインユーザー情報：', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        console.log('ユーザーはログアウトしています');
      }
    });

    // コンポーネントがアンマウントされる時に監視を停止
    return () => unsubscribe();
  }, []);

  // ログアウト関数
  const logout = async () => {
    try {
      await signOut(auth);
      console.log('ログアウトしました');
    }catch (error) {
      console.log('ログアウトエラー：', error);
      throw error;
    }
  };

  return {
    // ユーザー情報
    user,
    // 認証状態の確認中かどうか
    loading,
    // ログインしているかどうか(boolean)
    isAuthenticated: !!user,
    // ユーザーID(string | null)
    userId: user?.uid || null,
    // ログアウト関数
    logout
  };
}