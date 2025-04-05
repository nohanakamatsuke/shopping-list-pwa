
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { UserCircleIcon } from "@heroicons/react/24/outline";

interface Items {
  id: number;
  name: string;
}

interface HomeProps {
  items: Items[];
}


export default function Home({items}: HomeProps) {
  return (
    <>
     <div className="flex flex-col space-y-4 w-[85%] md:w-1/2 mx-auto">
     <div className="flex bg-white w-full rounded">
        <div className="w-4 bg-custom-red-light"></div>
        <div className="p-6 pr-10">
          <div className="text-black text-xl font-semibold">業務スーパー</div>
          <div className="flex space-x-2">
            <div className="text-gray-400 font-light text-sm">updated_at 2025/02/22</div>
            <UserCircleIcon className='w-5 md:w-6 text-gray-600'/>
          </div>
        </div>
      </div>
      <div className="flex bg-white w-full rounded">
        <div className="w-4 bg-custom-blue-light"></div>
        <div className="p-6 pr-10">
          <div className="text-black text-xl font-semibold">SHOP NAME</div>
          <div className="flex space-x-2">
            <div className="text-gray-400 font-light text-sm">updated_at 2025/02/19</div>
            <UserCircleIcon className='w-5 md:w-6 text-gray-600'/>
          </div>
        </div>
      </div>
      <div className="flex bg-white w-full rounded">
        <div className="w-4 bg-custom-purple-light"></div>
        <div className="p-6 pr-10">
          <div className="text-black text-xl font-semibold">SHOP NAME</div>
          <div className="flex space-x-2">
            <div className="text-gray-400 font-light text-sm">updated_at 2025/04/01</div>
            <UserCircleIcon className='w-4 md:w-6 text-gray-600'/>
          </div>
        </div>
      </div>
     </div>
    </>
  );
}

