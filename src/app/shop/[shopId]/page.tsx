import ItemListClient from "@/app/components/ItemListClient";

interface PageProps {
  params: Promise<{ shopId: string} >;
}

export default async function ShopPage ({ params }: PageProps) {
  const { shopId } = await params;
  return <ItemListClient shopId={shopId} />
}