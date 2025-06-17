'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addItem } from "../lib/itemListService";
import { useParams } from "next/navigation";
import { getShopById } from "../lib/shopService";

interface AddItemFormProps {
  shopId: string;
}

export default function AddItemForm({ shopId }: AddItemFormProps){

  const router = useRouter();

  // 状態管理
  const [shop, setShop] = useState<{ [key: string]: string; id: string } | null>(null);
  const [itemName, setItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ショップ情報を取得
   useEffect(() => {
     async function fetchData(){
       try{
         if (!shopId) {
           throw new Error("shopId is undefined");
         }
 
         // ショップ情報を取得
         const shopData = await getShopById(shopId as string);
         console.log('取得したショップデータ:', shopData);
         setShop(shopData);
       }catch(error){
         console.error("データ取得エラー", error);
         throw error;
       }finally{
         setLoading(false);  
       }  
     }
     fetchData();
   }, [shopId]);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション
    if (!itemName.trim()) {
      setError('アイテム名は必須です');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try{
      await addItem(
        shopId as string, {
          name: itemName
        } 
      );
      // 成功したらアイテムリストページに戻る
      router.push(`/shop/${shopId}`);
    }catch(error){
      console.error('アイテム追加エラー:', error);
    }finally{
      setIsSubmitting(false);
    }
  };

  return(
    <div className="w-full max-w-lg mx-auto px-6">
    <h1 className="text-2xl font-bold text-white mb-4">
      {shop ? `${shop.name}  アイテム追加` : 'アイテム追加'}
    </h1>

    {error && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    )}
    
    <form onSubmit={handleSubmit} className="bg-white p-6 py-10 rounded-md shadow-md">
      <div className="mb-4">
        <label htmlFor="itemName" className="block text-gray-700 font-medium mb-2">
          アイテム名 *
        </label>
        <input
          type="text"
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 牛乳"
          required
        />
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push(`/shop/${shopId}`)}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          キャンセル
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || !itemName.trim()}
          className={`px-4 py-2 text-white rounded-md ${
            isSubmitting || !itemName.trim()
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '追加中...' : '追加する'}
        </button>
      </div>
    </form>
  </div>        
    );
  }