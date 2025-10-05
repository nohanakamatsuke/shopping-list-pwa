'use client';

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getAllAccessibleShops } from "../lib/shopService";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function ShopListClient(){
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [shops, setShops] = useState<{ [key: string]: any }[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError] = useState<String | null>(null);

  useEffect(() => {
    async function fetchUserShops(){
      // 認証状態の確認が完了するまで待機
      if (authLoading) return;

      // ログインしていない場合
      if (!isAuthenticated || !user) {
        setShops([]);
        setLoading(false);
        return;
      }

      try{
        setError(null);

        const data = await getAllAccessibleShops(user.uid);
        console.log("取得したユーザーのショップデータ:", data);
        setShops(data);
      }catch(error){
        console.error("ショップデータ取得エラー", error);
        setError('ショップデータの取得に失敗しました');
      }finally{
        setLoading(false);  
      }  
    }

    fetchUserShops();
  }, [user, authLoading, isAuthenticated]);


  // 認証状態のローディング中
  if (authLoading) {
    return(
      <div className="mt-24">認証状態を確認中...</div>
    )
  }

  // ログインしていない場合
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center space-y-4 w-[85%] md:w-1/2 mx-auto mt-24">
        <div className="bg-white p-6 rounded text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ログインが必要です
          </h2>
          <p className="text-gray-600 mb-4">
            買い物リストを表示するにはログインしてください
          </p>
          <Link 
            href="/login"
            className="inline-block px-6 py-2 bg-custom-red text-white rounded hover:bg-red-600 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  // データローディング中
  if (loading) {
    return <div className="mt-24">ショップデータを読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col space-y-4 w-[85%] md:w-1/2 mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return(
    <div className="flex flex-col space-y-3 w-[85%] md:w-1/2 mx-auto mt-13">
      {shops.length > 0 ? (
        shops.map(shop =>(
          <Link key={shop.id} href={`/shop/${shop.id}`} className="flex bg-white w-full rounded">
            <div className="w-4 bg-custom-red-light"></div>
            <div className="p-2">
              <div className="text-black text-sm font-semibold">{shop.name}</div>
              <div className="flex space-x-2">
                {/* お店のカテゴリーに、更新日時の記載は必要ないか */}
                <div></div>
                <div className="text-gray-400 font-light text-xs">作成日:{shop.created_at.toDate().toLocaleString()}</div>
                {/* <UserCircleIcon className='w-3 md:w-6 text-gray-600'/> */}
              </div>
            </div>
          </Link>  
        ))
      ) : (
      <div className="p-4 rounded text-center">
        <p className="text-white">まだ買い物リストがありません</p>
        <p className="text-sm text-white mt-2">新しいお店を追加して買い物リストを作成しましょう</p>
      </div>
      )}
    </div>
  );
}