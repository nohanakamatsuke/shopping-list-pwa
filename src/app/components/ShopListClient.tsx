'use client';

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getAllShop } from "../lib/shopService";
import Link from "next/link";

export default function ShopListClient(){

  const [shops, setShops] = useState<{ [key: string]: any }[]>([]);
  const[loading, setLoading]  = useState(true);

  useEffect(() => {
    async function fetchData(){
      try{
        const data = await getAllShop();
        console.log("取得したデータ:", data);
        setShops(data);
      }catch(error){
        console.error("データ取得エラー", error);
        throw error;
      }finally{
        setLoading(false);  
      }  
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return(
    <div className="flex flex-col space-y-4 w-[85%] md:w-1/2 mx-auto">
      {shops.length > 0 ? (
        shops.map(shop =>(
          <Link key={shop.id} href={`/shop/${shop.id}`} className="flex bg-white w-full rounded">
            <div className="w-4 bg-custom-red-light"></div>
            <div className="p-6 pr-10">
              <div className="text-black text-xl font-semibold">{shop.name}</div>
              <div className="flex space-x-2">
                {/* お店のカテゴリーに、更新日時の記載は必要ないか */}
                <div className="text-gray-400 font-light text-sm">{shop.created_at.toDate().toLocaleString()}</div>
                <UserCircleIcon className='w-5 md:w-6 text-gray-600'/>
              </div>
            </div>
          </Link>  
        ))
      ) : (
      <div className="bg-white p-4 rounded text-center">
        買い物リストは0件です
      </div>
      )}
    </div>
  );
}