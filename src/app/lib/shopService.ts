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
