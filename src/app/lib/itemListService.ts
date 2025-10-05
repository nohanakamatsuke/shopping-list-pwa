import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { VALIDATION_RULES } from "./validation";

// テスト環境用でユーザーIDでフィルタリングせずに全アイテムを取得
export  async function getAllItemsByShopId(shopId: string) {

  try {
    const itemsCollection = collection(db, 'items');

    const q = query(
      itemsCollection,
      where('shop_id', '==', shopId),
    );

    const querySnapshot =  await getDocs(q);
    
    const items: { id: string; name: string; is_checked: boolean }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      items.push({
        id: doc.id,
        name: data.name || '不明なアイテム',
        is_checked: data.is_checked || false,
      });
    });
    
    return items;
  } catch (error) {
    console.error('全買い物リストの取得中にエラーが発生しました', error);
    throw error;
  }
}

// アイテム追加
export async function addItem(shopId: string, itemData: {name: string }) {

  try{
    // バリデーション
    const nameRules = VALIDATION_RULES.item.name;
    if (nameRules.reqired && !itemData.name) {
      throw new Error('アイテム名は必須です');
    }

    if (itemData.name.length < nameRules.minlength) {
      throw new Error(`アイテム名は${nameRules.minlength}文字以上で入力してください`);
    }

    if (itemData.name.length > nameRules.maxlength) {
      throw new Error(`アイテム名は${nameRules.maxlength}文字以内で入力してください`)
    }

    const itemsCollection = collection(db, 'items');

    const newItem = {
      ...itemData,// 既存のitemDataオブジェクト全てのプロパティをコピー
      shop_id: shopId,
      is_checked: false,// 追加時は未チェックに設定
      created_at: serverTimestamp(),
    };
   
    // firestoreにドキュメント追加
    const docRef = await addDoc(itemsCollection, newItem);
    
    // 保存したドキュメントを再取得して返す
    const newDocSnapshot = await getDoc(docRef);
    
    if (newDocSnapshot.exists()){
      return {
        id: newDocSnapshot.id,
        ...newDocSnapshot.data()
      };
    }else{
      throw new Error('ドキュメントの取得に失敗しました');
    }
  }catch(error){
    console.error('アイテム追加エラー', error);
    throw error;
  }
}

// アイテム削除

export async function deleteItem(itemId: string) {
  const itemRef = doc(db, 'items', itemId);
  await deleteDoc(itemRef);
  return true;
}


// アイテムのチェック状態を更新
export async function updateItemCheckStatus(itemId: string, isChecked: boolean){

  try{
    const itemRef = doc(db, 'items', itemId)
    await updateDoc(itemRef, {
      is_checked: isChecked,
      updated_at: serverTimestamp()
    });
    return{ success: true};

  }catch(error){
    console.error('アイテム状態更新エラー:', error);
    throw error;
  }
}