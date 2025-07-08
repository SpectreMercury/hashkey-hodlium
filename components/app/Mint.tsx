import { useState } from 'react';
import { useMintVeHSK } from '@/hooks/useMintVeHSK'; // Import the hook
import { formatBigInt } from '@/utils/format';

export default function Mint({mintAmount}: {mintAmount: bigint}) {
  const { mintVeHSK, isPending, isConfirming, error } = useMintVeHSK();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMintClick = async () => {
    setSuccessMessage(null); // Clear previous messages
    setErrorMessage(null);
    try {
      const success = await mintVeHSK();
      console.log(success, 'success');
      if (success) {
        setSuccessMessage('Minting successful! Transaction confirmed.');
        // TODO: Optionally trigger a refetch of data that includes MintVeHSKInfo here
      } else {
        // This case might not be reached if errors are always thrown on failure
        setErrorMessage('Minting transaction failed.');
      }
    } catch (err: any) {
      console.error('Minting failed:', err);
      setErrorMessage(`Minting failed: ${err.shortMessage || err.message}`);
    }
  };

  const isLoading = isPending || isConfirming;
  const buttonText = isLoading ? (isConfirming ? 'Confirming...' : 'Minting...') : `Mint veHSK ${formatBigInt(mintAmount)} veHSK`;

  return (
    <>
      <div className="mt-10 flex flex-col items-start space-y-4">
          <button
            onClick={handleMintClick}
            disabled={isLoading}
            className={`inline-flex items-center px-8 py-4 rounded-xl text-white text-lg font-medium shadow-lg transition-colors duration-200 ease-in-out ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary/80 hover:bg-primary hover:shadow-xl'
            }`}
          >
            {buttonText}
            <svg className={`w-5 h-5 ml-2 ${isLoading ? 'animate-spin' : 'coin'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isLoading ? (
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /> // Spinner icon
              ) : (
                <>
                  <circle cx="12" cy="12" r="8" fill="none" />
                  <circle cx="12" cy="12" r="6" fill="gold" />
                  <path d="M12 8v8M8 12h8" strokeWidth="1.5" />
                </>
              )}
            </svg>
          </button>
          {/* Display Success or Error Messages */}
      </div>
    </>
  );
}
