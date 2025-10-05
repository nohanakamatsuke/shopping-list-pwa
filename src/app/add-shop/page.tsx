'use client';

import { useAuth } from "@/app/hooks/useAuth";
import { db } from "@/app/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function AddShopPage() {
  const { userId, isAuthenticated, loading:authLoading } = useAuth();
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try{
      console.log('お店作成試行：',{shopName, userId});

      // FireStoreに新しいお店を追加
      const docRef = await addDoc(collection(db, 'shops'),{
        name: shopName.trim(),
        owner_id: userId,
        created_at: serverTimestamp()
      });
      console.log('お店作成成功：', docRef.id);
      // alert('お店を追加しました！');

      // メインページに戻る
      router.push('/');

    }catch (error) {
      console.log('お店作成エラー：', error);
      setError('お店の作成に失敗しました');
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-6">新しいお店を追加</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md">
        <div className="mb-4">
          <label htmlFor="shopName" className="block text-gray-700 font-medium mb-2">
            お店の名前 *
          </label>
          <input
            type="text"
            id="shopName"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="例: イオン、コストコ"
            required
          />
        </div>

        <div className="flex justify-between">
          <Link
            href="/"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </Link>
          
          <button
            type="submit"
            disabled={isLoading || !shopName.trim()}
            className={`px-4 py-2 text-white rounded-md ${
              isLoading || !shopName.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-custom-red hover:bg-red-600'
            }`}
          >
            {isLoading ? '作成中...' : '作成する'}
          </button>
        </div>
      </form>

      {/* デバッグ情報（開発中のみ） */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
        <p>現在のユーザーID: {userId}</p>
      </div> */}
    </div>
  );
}