'use client';

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";

// テスト環境用でユーザーIDでフィルタリングせずに全アイテムを取得
export  async function getAllItemsByShopId(shopId: string) {

  
  try {
    const itemsCollection = collection(db, 'items');

    const q = query(
      itemsCollection,
      where('shop_id', '==', shopId),
    );

    const querySnapshot =  await getDocs(q);
    
    const items: { id: string; [key: string]: any }[] = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return items;
  } catch (error) {
    console.error('全買い物リストの取得中にエラーが発生しました', error);
    throw error;
  }
}