import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "./firebase";

// userIdでフィルタリングしてショップ情報を取得
export async function getShopByUserId(userId: string){
  try{
    const shopsCollection = collection(db, 'shops');
    const q = query(
      shopsCollection,
      where('owner_id', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const shops: {id : string; name : string; owner_id : string; created_at : Timestamp; updated_at? : Timestamp;}[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      shops.push({
        id: doc.id,
        name: data.name,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    })
    return shops;
  }catch (error){
    console.error('ユーザーIDでフィルタリングしてショップ情報を取得中にエラーが発生しました', error);
    throw error;
  }
}


export async function getAllAccessibleShops(userId: string) {
  try {
    // 自分が作成したお店を取得
    const ownShopsQuery = query(
      collection(db, 'shops'),
      where('owner_id', '==', userId)
    );
    const ownShopsSnapshot = await getDocs(ownShopsQuery);
    
    // 自分と共有されているお店を取得
    const sharedShopsQuery = query(
      collection(db, 'shops'),
      where('sharedWith', 'array-contains', userId)
    );
    const sharedShopsSnapshot = await getDocs(sharedShopsQuery);
    
    // データを整形
    const ownShops = ownShopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isOwner: true,        // 自分のお店フラグ
      isShared: false       // 共有されたお店フラグ
    }));
    
    const sharedShops = sharedShopsSnapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data(),
      isOwner: false,       // 自分のお店フラグ
      isShared: true        // 共有されたお店フラグ
    }));
    
    // 重複除去（同じお店を所有 & 共有されている場合）
    const allShops = [...ownShops];
    sharedShops.forEach(sharedShop => {
      // 既に自分のお店として存在しないかチェック
      if (!ownShops.find(ownShop => ownShop.id === sharedShop.id)) {
        allShops.push(sharedShop);
      }
    });
    
    
    console.log('取得したお店一覧:', allShops);
    return allShops;
    
  } catch (error) {
    console.error('アクセス可能なお店取得エラー:', error);
    throw error;
  }
}


export async function getShopById(shopId: string){
  try{
    const shopRef = doc(db, "shops", shopId);
    const shopSnapshot = await getDoc(shopRef);

    if (!shopSnapshot.exists()) {
      throw new Error("お店が見つかりません");
    }
    
    return {
      id: shopSnapshot.id,
      ...shopSnapshot.data()
    };
  }catch (error) {
    console.error('ショップ情報取得エラー', error);
    throw error;
  }


}
