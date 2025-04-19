import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// テスト環境用でユーザーIDでフィルタリングせずに全ショップを取得
export async function getAllShop(){
  try{
    const shopsCollection = collection(db, 'shops');
    const querySnapshot = await getDocs(shopsCollection); 
    const shops: { id: string; [ key:string]: any }[] = [];
    querySnapshot.forEach((docs) =>{
      shops.push({
        id:docs.id,
        ...docs.data()
      });
    });
    return shops;
  }catch (error){
    console.error('全ショップリストの取得中にエラーが発生しました', error);
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
