// アイテム追加ページ

import AddItemClient from "@/app/components/AddItemForm";

interface PageProps {
  params: Promise<{ shopId: string }>;
}

export default async function AddItemPage ({ params }: PageProps){
  const { shopId } = await params;
  return <AddItemClient shopId={shopId} />
}