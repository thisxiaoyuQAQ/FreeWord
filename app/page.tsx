import { redirect } from 'next/navigation';

const Home = () => {
  // 重定向到学习页面
  redirect('/learning');
};

export default Home;