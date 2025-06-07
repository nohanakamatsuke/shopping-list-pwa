'use client';

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Friend {
  id: string;
  name: string;
  email: string;
}

interface ShareModalProps {
  isOpen: boolean;              
  onClose: () => void;          
  shopId: string;               
  shopName: string;             
  currentSharedWith: string[];  
  onUpdate: () => void;         
}

export default function ShareModal({
  isOpen,
  onClose,
  shopId,
  shopName,
  currentSharedWith,
  onUpdate
}:ShareModalProps) {
  const { userId } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchFriends = async () => {
    if(!userId) return;
    setLoading(true);

    try{
      // 自分が申請して承認された友達を取得
      const sentRequestsQuery = query(
        collection(db, 'friendships'),
        where('requester_id', '==', userId),
        where('status', '==', 'accepted'), 
      );

      // 自分が受信して承認した友達を取得
      const receivedRequestsQuery = query(
        collection(db, 'friendships'),
        where('receiver_id', '==', userId),
        where('status', '==', 'accepted'), 
      );

      // 両方のクエリを並行実行
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentRequestsQuery),
        getDocs(receivedRequestsQuery)
      ]);

      const friendsData: Friend[] = [];

      // 自分が申請した友達データの整形
      sentSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friendsData.push({
          id: data.receiver_id,        // 相手のID
          name: data.receiver_name,    // 相手の名前
          email: data.receiver_email   // 相手のメール
        });
      });

      // 自分が受信した友達データの整形
      receivedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friendsData.push({
          id: data.requester_id,       // 申請者のID
          name: data.requester_name,   // 申請者の名前
          email: data.requester_email  // 申請者のメール
        });
      });

      // 重複除去
      const uniqueFriends = friendsData.filter((friend, index, self) => 
        self.findIndex(f => f.id === friend.id) === index
      );

      console.log('双方向で取得した友達一覧:', uniqueFriends);
      setFriends(uniqueFriends);

      // 現在共有中の友達を選択状態にする
      const validSharedWith = currentSharedWith.filter(uid => 
        uniqueFriends.some(friend => friend.id === uid)
      );
      setSelectedFriends([...validSharedWith]);

    }catch (error) {
      console.log('友達情報取得エラー：', error);
    }finally{
      setLoading(false);
    }
  };

  const handleFriendToggle = (friendId: string) => {
    // 現在の選択状態を元に更新
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id!== friendId)
        : [...prev, friendId] 
    );
  };
  
  // 保存処理
  const handleSave = async () => {
    // 保存中状態にする
    setSaving(true);
    try{
      // Firestoreのshopコレクションの該当箇所を更新
      await updateDoc(doc(db, 'shops', shopId), {
        sharedWith: selectedFriends
      });

      console.log('共有更新完了：', selectedFriends);
      // 親コンポーネントに更新したと通知
      onUpdate();
      // モーダルを閉じる
      onClose();

    }catch (error) {
      console.log('保存エラー:', error);
    }finally{
      // 保存中状態を解除
      setSaving(false);
    }
  };


  // モーダルが開かれた時だけ、友達データを取得する
  useEffect(() => {
    if (isOpen && userId) {
      fetchFriends();
    }
  }, [isOpen]);

  // モーダルが閉じている時は何も表示しない
  if (!isOpen) return null;

  return(
    // 背景の黒いオーバーレイ
    <div className="fixed inset-0 bg-black bg-opacity-10 z-[9999] flex items-center justify-center p-4">
      {/* モーダル本体の白い箱 */}
      <div className="bg-white rounded-lg max-w-md w-full">

        <div className="p-4 border-b">
          <h3 className="text-lg font-bold text-black">「{shopName}」を共有</h3>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          {loading ? (
            // 読み込み中の表示
            <div className="text-center py-4">読み込み中...</div>
          ) : friends.length === 0 ? (
            // 友達がいない場合の表示
            <div className="text-center py-4 text-gray-500">友達がいません</div>
          ) : (
            // 友達リストの表示
            <div className="space-y-2">
              {friends.map((friend) => (
                <label 
                  key={friend.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input 
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => handleFriendToggle(friend.id)}  
                    className="mr-3"
                  />
                  {/* 友達の情報 */}
                  <div>
                    <p className="font-medium text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-600">{friend.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ボタン部分 */}
        <div className="p-4 border-t flex justify-between">
          {/* キャンセルボタン */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700  bg-gray-200 hover:bg-gray-300 rounded"
          >
            キャンセル
          </button>
          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-white rounded ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}>
              {saving ? '保存中...' : '保存'}
            </button>
        </div>
      </div>
    </div>
  )


}