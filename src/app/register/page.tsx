import Link from 'next/link';
import React from 'react';

const LoginPage: React.FC = () => {
	return (
		<div className='min-h-screen flex items-center justify-center'>
			<div className='w-full max-w-md px-6'>
				<form className='space-y-5'>
					<div className=''>
						<label htmlFor="email" className='block text-lg'>メールアドレス</label>
						<input type="email" id="email" name="email" required className="w-full p-3 rounded text-black bg-white focus:outline-none"/>
					</div>
					<div>
						<label htmlFor="password" className='block text-lg'>パスワード</label>
						<input type="password" id="password" name="password" required className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<div>
						<label htmlFor="password" className='block text-lg'>表示名</label>
						<input type="text" id="show-name" name="show-name" required className="w-full p-3 rounded text-black bg-white focus:outline-none text-black"/>
					</div>
					<button type="submit" className='w-full mt-5 px-2 py-3 bg-[#FF5154] rounded-full text-lg font-bold'>新規登録</button>
				 </form>
			</div>
				
		</div>
	);
};
export default LoginPage;