'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

interface FriendRequest {
  docId: string;
  requester_name: string;
  requester_email: string;
  requester_id: string;
  receiver_id: string;
  receiver_name: string;
  receiver_email: string;
  status: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
}

export default function FriendsPage() {
  const { userId, isAuthenticated, loading: authLoading, user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // データ取得
  const fetchData = async () => {
    if (!userId) return;
    console.log('userID:',userId);
    try {
      // 自分宛の申請（pending）
      const requestsQuery = query(
        collection(db, 'friendships'),
        where('receiver_id', '==', userId),
        where('status', '==', 'pending')
      );

      // 自分が receiver の友達（accepted）
      const friendsAsReceiverQuery = query(
        collection(db, 'friendships'),
        where('receiver_id', '==', userId),
        where('status', '==', 'accepted')
      );

      // 自分が requester の友達 (accepted)
      const friendsAsRequesterQuery = query(
        collection(db,'friendships'),
        where('requester_id', '==', userId),
        where('status', '==', 'accepted')
      )

      const [requestsSnapshot, friendsAsReceiverSnapshot, friendsAsRequesterSnapshot] = await Promise.all([
        getDocs(requestsQuery),
        getDocs(friendsAsReceiverQuery),
        getDocs(friendsAsRequesterQuery)
      ]);
      
      // 申請データ変換
      const requestsData = requestsSnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })) as FriendRequest[];

      // 友達データの統合
      const friendsData: Friend[] = [];

      // 自分が receiver の場合（requester の情報を友達として追加）
      friendsAsReceiverSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friendsData.push({
          id: data.requester_id,
          name: data.requester_name || `ユーザー ${data.requester_id.slice(-4)}`,
          email: data.requester_email || `${data.requester_id}@unknown.com`,
        });
      });

      // 自分が requester の場合（receiver の情報を友達として追加）
      friendsAsRequesterSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friendsData.push({
          id: data.receiver_id,
          name: data.receiver_name || `ユーザー ${data.receiver_id.slice(-4)}`,
          email: data.receiver_email || `${data.receiver_id}@unknown.com`,
        });
      });
      // 重複除去（念のため）
      const uniqueFriends = friendsData.filter((friend, index, self) => 
        self.findIndex(f => f.id === friend.id) === index
      );

      setRequests(requestsData);
      setFriends(uniqueFriends);

      
      console.log('取得完了:', { requests: requestsData.length, friends: friendsData.length });
      console.log(requestsData);
      console.log(friendsData);


    } catch (error) {
      console.error('取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 承認
  const accept = async (docId: string) => {
    try {
      await updateDoc(doc(db, 'friendships', docId), {
        status: 'accepted',
        receiver_name: user?.displayName || null,
        receiver_email: user?.email || '',
        updated_at: serverTimestamp()
      });
      fetchData(); // 再読み込み
    } catch (error) {
      console.error('承認エラー:', error);
    }
  };

  // 拒否
  const reject = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'friendships', docId));
      fetchData(); // 再読み込み
    } catch (error) {
      console.error('拒否エラー:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // 認証確認
  if (authLoading) {
    return <div className="flex justify-center items-center">認証確認中...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">ログインが必要です</h2>
          <Link href="/login" className="px-4 py-2 bg-custom-red text-white rounded">
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center">読み込み中...</div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <h1 className="text-2xl font-bold text-white mb-6">友達</h1>

        {/* 申請リスト - 申請がある場合のみ表示 */}
        {requests.length > 0 && (
        <div className="bg-white rounded-md shadow-md mb-6 p-4">
          <h2 className="text-lg font-bold mb-4 text-black">申請 ({requests.length})</h2>
          
          {requests.map((req) => (
            <div key={req.docId} className="flex justify-between items-center p-3 border rounded mb-2">
              <div>
                <p className="font-semibold text-black">{req.requester_name}</p>
                <p className="text-sm text-gray-500">{req.requester_email}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => accept(req.docId)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  承認
                </button>
                <button
                  onClick={() => reject(req.docId)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  拒否
                </button>
              </div>
            </div>
          ))}
         </div>
        )}

      {/* 友達リスト */}
      <div className="bg-white rounded-md shadow-md p-4">
        <h2 className="text-lg font-bold mb-4 text-black">友達 ({friends.length})</h2>
        
        {friends.length === 0 ? (
          <p className="text-gray-500">友達がいません</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="flex justify-between items-center p-3 border rounded mb-2">
              <div>
                <p className="font-semibold text-black">{friend.name}</p>
                <p className="text-sm text-gray-600">{friend.email}</p>
              </div>
              <div className="text-green-600 font-bold">友達</div>
            </div>
          ))
        )}
      </div>

      {/* ボタン */}
      <div className="mt-6 flex justify-between">
        <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded">
          ホームに戻る
        </Link>
        <Link href="/add-friends" className="px-7 py-2 bg-blue-500 text-white rounded">
          友達追加
        </Link>
      </div>
    </div>
  );
}