import ShopListClient from "./components/ShopListClient";

interface Items {
  id: string;
  // name: string;
}

interface HomeProps {
  items: Items[];
}


export default async function Home({items}: HomeProps) {

  return (
    <ShopListClient />
  );
}

