'use client';

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../lib/firebase";

export default function AddFriendPage() {
  const { userId, isAuthenticated, loading: authLoading, user } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // 認証確認
  if (authLoading) {
    return <div className="flex justify-center items-center">認証確認中...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">ログインが必要です</h2>
          <Link href="/login" className="px-4 py-2 bg-custom-red text-white rounded">
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  // ユーザー検索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      setMessage({ type: 'error', text: 'メールアドレスを入力してください' });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setMessage(null);

    try {
      console.log('ユーザー検索:', searchEmail);

      // usersコレクションでメールアドレス検索
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', searchEmail.trim())
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        setMessage({ type: 'info', text: 'ユーザーが見つかりませんでした' });
        return;
      }

      // 検索結果取得
      const userData = querySnapshot.docs[0].data() as User;
      console.log('検索結果:', userData);

      // 自分自身は表示しない
      if (userData.uid === userId) {
        setMessage({ type: 'error', text: '自分自身は追加できません' });
        return;
      }

      setSearchResult(userData);
      setMessage({ type: 'success', text: 'ユーザーが見つかりました！' });

    } catch (error) {
      console.error('検索エラー:', error);
      setMessage({ type: 'error', text: '検索に失敗しました' });
    } finally {
      setIsSearching(false);
    }
  };

  // 友達申請送信
  const handleSendRequest = async () => {
    if (!searchResult) return;

    setIsSending(true);
    setMessage(null);

    try {
      console.log('送信するデータ：', )
      console.log('友達申請送信:', { from: userId, to: searchResult.uid });

      // 既存の申請をチェック（重複防止）
      const existingQuery = query(
        collection(db, 'friendships'),
        where('requester_id', '==', userId),
        where('receiver_id', '==', searchResult.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        setMessage({ type: 'error', text: '既に申請済みです' });
        return;
      }

      // 友達申請をfriendshipsコレクションに追加
      const friendshipData = {
        id: `${userId}_${searchResult.uid}`,
        requester_id: userId,
        requester_name: user?.displayName || 'ユーザー',
        requester_email: user?.email || '',
        receiver_id: searchResult.uid,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      console.log('送信するデータ', friendshipData);

      await addDoc(collection(db, 'friendships'), friendshipData);
      
      console.log('友達申請送信完了');
      setMessage({ type: 'success', text: '友達申請を送信しました！' });
      
      // フォームリセット
      setSearchEmail('');
      setSearchResult(null);

    } catch (error) {
      console.error('申請送信エラー:', error);
      setMessage({ type: 'error', text: '申請の送信に失敗しました' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-6">友達を追加</h1>
      
      {/* メッセージ表示 */}
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
          message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
          'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-md shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="searchEmail" className="block text-gray-700 font-medium mb-2">
            友達のメールアドレス
          </label>
          <input
            type="email"
            id="searchEmail"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="friend@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className={`w-full px-4 py-2 text-white rounded-md ${
            isSearching
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSearching ? '検索中...' : '検索'}
        </button>
      </form>

      {/* 検索結果 */}
      {searchResult && (
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">検索結果</h3>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div>
              <p className="font-medium text-gray-900">{searchResult.displayName}</p>
              <p className="text-sm text-gray-600">{searchResult.email}</p>
            </div>
            
            <button
              onClick={handleSendRequest}
              disabled={isSending}
              className={`px-4 py-2 text-white rounded-md ${
                isSending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-custom-red hover:bg-red-600'
              }`}
            >
              {isSending ? '送信中...' : '友達申請'}
            </button>
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div className="mt-6 flex justify-between">
        <Link
          href="/"
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ホームに戻る
        </Link>
        
        <Link
          href="/friends"
          className="px-7 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
        >
          友達一覧
        </Link>
      </div>

      {/* デバッグ情報 */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
        <p>現在のユーザーID: {userId}</p>
      </div>
    </div>
  );
}