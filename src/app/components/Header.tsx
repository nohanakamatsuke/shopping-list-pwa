'use client';

import { PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const {isAuthenticated, loading} = useAuth();

  return (
    <header className='w-full py-5'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <Link href="/">
          <h1 className='text-3xl text-custom-blue font-black'>Shopping List</h1>
        </Link>
        <div className='flex space-x-4 md:space-x-5 xl:space-x-10 pr-2'>
          {!loading && isAuthenticated && (
            <>
              <PlusIcon className='w-10 md:w-12 text-custom-blue hover:bg-blue-300 hover:text-white rounded-full'/>
              <UserCircleIcon className='w-10 md:w-12 text-custom-blue hover:bg-blue-300 hover:text-white rounded-full'/>
            </>
          )}
        </div> 
      </div>  
    </header>
  );
};

export default Header;