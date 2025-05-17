'use client';

import { useEffect, useState } from "react";
import { getAllItemsByShopId, updateItemCheckStatus } from "../lib/itemListService";
import { useParams } from "next/navigation";
import { getShopById } from "../lib/shopService";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";

export default function ItemListClient(){

  // URLからshopIdを取得
  const params = useParams();
  const shopId = params.shopId;

  // 状態管理
  const [shop, setShop] = useState<{ [key: string]: string; id: string } | null>(null);
  const [items, setItems] = useState<{ id: string; name: string; is_checked: boolean }[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const[loading, setLoading]  = useState(true);

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

        // アイテム情報を取得
        const itemsData = await getAllItemsByShopId(shopId as string);
        console.log("取得したアイテムデータ:", itemsData);
        setItems(itemsData);


      }catch(error){
        console.error("データ取得エラー", error);
        throw error;
      }finally{
        setLoading(false);  
      }  
    }
    fetchData();
  }, [shopId]);

  // アイテム追加ページへの遷移処理
  const router = useRouter();

  const handleAddItem = () => {
    router.push(`/shop/${shopId}/add`);
  };

  // チェックボックスの状態変更処理
  const handleCheckChange = async (itemId: string, currentStatus: boolean) => {
    try{
      // firestoreのデータを更新
      await updateItemCheckStatus(itemId, !currentStatus);

      // 更新が成功したら、ローカルの状態も更新
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, is_checked: !currentStatus } 
            : item
        )
      );

    }catch(error){
      console.error('チェック状態更新エラー:', error);
      alert('状態の更新に失敗しました。');
    }
  }

  // 完了したアイテムを隠す処理
  const filteredItems = hideCompleted 
  ? items.filter(item => !item.is_checked) 
  : items;

  //アイテムの削除処理
 const swipeHandlers = useSwipeable({
  onSwipedLeft: () => ,
  trackMouse: true,
 })


  if (loading) {
    return <div>読み込み中...</div>;
  }

  return(
    <>
      <div className="w-full max-w-[85%] md:max-w-[50%] mx-auto self-start mt-12">
        
        <div className="flex flex-col space-y-4">
          {shop &&(
            <div className="flex justify-between items-center">
              <h1 className="text-custom-red text-3xl font-bold">{shop.name}</h1>
              <button
                onClick={handleAddItem}
                aria-label="アイテムを追加">
                <PlusIcon className="h-7 w-7 text-custom-red bg-gray-600 bg-opacity-25 rounded hover:text-white hover:bg-custom-blue "/>
              </button>
            </div>
          )}
          
          <div className="flex items-center bg-white bg-opacity-20 p-2 rounded">
            <label className="flex items-center text-black cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={() => setHideCompleted(!hideCompleted)}
                className="mr-2 text-black"
              />
              完了したアイテムを隠す
            </label>
          </div>


          {filteredItems.map(item =>(
          // itemのidをkeyにする
            <div key={item.id} className="flex bg-white w-full rounded-sm" {...swipeHandlers}>
              <input 
                type="checkbox"
                 checked={item.is_checked === true} 
                 onChange={() => handleCheckChange(item.id, item.is_checked)}
                 className="w-5 ml-3 my-auto"
              />   
              <div className="p-6 pr-10">
                <h1 className={`text-xl font-semibold ${
                  item.is_checked 
                  ? 'line-through text-gray-400' // チェック済みの場合
                  : 'text-black'                 // 未チェックの場合
                }`}>  
                  {item.name}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>    
    </> 
    );
  }