'use client';

import { useEffect, useState } from "react";
import { getAllItemsByShopId } from "../lib/itemListService";
import { useParams } from "next/navigation";
import { getShopById } from "../lib/shopService";

export default function ItemListClient(){

  const params = useParams();
  const shopId = params.shopId;

  const [shop, setShop] = useState<{ [key: string]: string; id: string } | null>(null);
  const [items, setItems] = useState<{ [key: string]: string; id: string }[]>([]);
  const[loading, setLoading]  = useState(true);

  useEffect(() => {
    async function fetchData(){
      try{
        // shopIdはURLから取得する 
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
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return(
    <>
      <div className="w-full max-w-[85%] md:max-w-[50%] mx-auto self-start mt-12">
        
        <div className="flex flex-col space-y-4">
          {shop &&(
            <div>
              <h1 className="text-custom-red text-3xl font-bold">{shop.name}</h1>
            </div>
          )}
          {items.map(item =>(
          // itemのidをkeyにする
            <div key={item.id} className="flex bg-white w-full rounded-sm">
              <input type="checkbox" className="w-5 ml-3"/>
              <div className="p-6 pr-10">
                <h1 className="text-black text-xl font-semibold">{item.name}</h1>
              </div>
            </div>
          ))}
        </div>
      </div>    
    </>
    );
  }