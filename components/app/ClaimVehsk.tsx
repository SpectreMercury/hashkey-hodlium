import { useRouter } from 'next/navigation';

export default function Mint() { // 移除了 mintAmount prop
  const router = useRouter();

  const handleNavigateToMintPage = () => {
    router.push('/mint'); // 跳转到 /mint 页面
  };

  const buttonText = "Claim VeHSK";

  return (
    <>
      <div className="mt-10 flex flex-col items-start space-y-4">
          <button
            onClick={handleNavigateToMintPage}
            className="inline-flex items-center px-8 py-4 rounded-xl text-white text-lg font-medium shadow-lg transition-colors duration-200 ease-in-out bg-primary/80 hover:bg-primary hover:shadow-xl"
          >
            {buttonText}
            {/* 保留了原有的金币图标，移除了加载动画相关的类名 */}
            <svg className="w-5 h-5 ml-2 coin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" fill="none" />
              <circle cx="12" cy="12" r="6" fill="gold" />
              <path d="M12 8v8M8 12h8" strokeWidth="1.5" />
            </svg>
          </button>
      </div>
    </>
  );
}
