'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { addItem, deleteItem, getAllItemsByShopId, updateItemCheckStatus } from "../lib/itemListService";
import { getShopById } from "../lib/shopService";
import SwipeableItem from "./SwipeableItem";
import ShareModal from "./ShareModal";
import { useAuth } from "../hooks/useAuth";

interface ItemListClientProps {
  shopId: string;
}

export default function ItemListClient({ shopId }: ItemListClientProps){

  const { user } = useAuth();

  // 状態管理
  const [shop, setShop] = useState<{ [key: string]: string; id: string } | null>(null);
  const [items, setItems] = useState<{ id: string; name: string; is_checked: boolean }[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [loading, setLoading]  = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // データ取得
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

  // 所有者判定
  const isOwner = shop && user && shop.owner_id == user.uid;

  // アイテム保存処理（Enter/Done両方で使用）
  const handleSaveNewItem = async () => {
    if(!newItemText.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      
      const savedItem = await addItem(shopId as string, {
        name: newItemText.trim()
      }) as {id: string; name: string; is_checked: boolean;};
      
      setItems(prevItems => [...prevItems, savedItem]);
      setNewItemText("");
      
      // 「もう1つ追加」ボタンを3秒間表示
      setShowAddMore(true);
      setTimeout(() => setShowAddMore(false), 3000);
      
    } catch(error) {
      console.error('アイテム追加エラー:', error);
      alert('アイテムの追加に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // Enterキーで保存
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNewItem();
    }
  };
  // 保存して入力を継続
  const handleSaveAndContinue = async () => {
    if(!newItemText.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      
      const savedItem = await addItem(shopId as string, {
        name: newItemText.trim()
      }) as {id: string; name: string; is_checked: boolean;};
      
      setItems(prevItems => [...prevItems, savedItem]);
      setNewItemText("");
      
      // フォーカスを維持
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      
    } catch(error) {
      console.error('アイテム追加エラー:', error);
      alert('アイテムの追加に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // アイテム削除処理
  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      // Firestoreからアイテムを削除
      await deleteItem(itemId);

      // UI状態を更新（削除したアイテムを配列からフィルタリング）
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('アイテム削除エラー:', error);
      alert('アイテムの削除に失敗しました。');
    }
  }, []);
  
  if (loading) {
    return <div>読み込み中...</div>;
  }

  return(
    
    <>
      <div className="w-full max-w-[85%] md:max-w-[50%] mx-auto self-start">
        
        <div className="flex flex-col space-y-3">
          {shop &&(
            <div className="flex justify-between items-center">
              <h1 className="text-custom-red text-2xl font-bold">{shop.name}</h1>
              
              <div className="space-x-4 flex items-center">
                {isOwner && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    aria-label="リストを共有"
                    className="h-7 px-3 bg-green-700 rounded">
                      共有
                  </button>
                )}

                {/* 友達共有モーダル */}
                {isOwner && (
                  <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    shopId={shopId as string}
                    shopName={shop.name} 
                    currentSharedWith={Array.isArray(shop.sharedWith) ? shop.sharedWith : []} 
                    onUpdate={async () => {
                      const updatedShop = await getShopById(shopId as string);
                      setShop(updatedShop);
                      console.log('更新後のshop:', updatedShop);
                  }}/>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center  bg-opacity-20 p-1 rounded text-xs">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={() => setHideCompleted(!hideCompleted)}
                className="mr-2 text-black"
              />
              完了したアイテムを隠す
            </label>
          </div>

          {filteredItems.map(item => (
            <SwipeableItem 
              key={item.id}
              id={item.id}
              name={item.name}
              isChecked={item.is_checked}
              onToggleCheck={handleCheckChange}
              onDelete={handleDeleteItem}
            />
          ))}

          {/* 入力ボックス */}
          <div className="flex gap-2 items-center">
            <div className="flex bg-white flex-1 rounded p-3">
              <input
                ref={inputRef}
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyPress}
                // onBlurを削除
                placeholder="アイテム名を入力..."
                className="flex-1 outline-none text-black"
                disabled={isSaving}
              />
            </div>
            
            {newItemText.trim() && (
              <button
                type="button"
                onClick={handleSaveAndContinue}
                className="bg-blue-500 text-white py-3 px-4 rounded whitespace-nowrap hover:bg-blue-600 transition-colors"
              >
                ➕ 追加
              </button>
            )}
          </div>
          {/* スペーサー - ボタンの高さ分確保 */}
          <div className="h-24"></div>
        </div>
      </div>    
    </> 
    );
  }