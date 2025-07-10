import React, { useState, useEffect } from 'react';
import { useWatchAsset, useAccount } from 'wagmi';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from 'next/image';
import { toast } from 'react-toastify';


// mainnet stHSK address
const veHSKAddress = '0xe1045155ee02e0997E6bB4509D854a306c50D914';

export default function VeAddressBar() {
  const { watchAsset } = useWatchAsset();
  const { isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    setCopied(true);
  };

  const handleAddToWallet = () => {
    if (!isConnected) {
      toast.error("Please connect to a wallet to add watch the token");
      return;
    }

    watchAsset({
      type: 'ERC20',
      options: {
        address: veHSKAddress,
        symbol: 'veHSK',
        decimals: 18,
      },
    });
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 transition-all hover:border-primary/30 hover:bg-slate-800/80 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-slate-300 mb-1">veHSK Token Address</h3>
            <p className="text-xs text-slate-400 font-mono hidden md:block">{veHSKAddress}</p>
            <p className="text-xs text-slate-400 font-mono md:hidden">{`${veHSKAddress.substring(0, 6)}...${veHSKAddress.substring(veHSKAddress.length - 6)}`}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-8">
          <CopyToClipboard text={veHSKAddress} onCopy={handleCopy}>
            <div className="relative group">
              <div className="p-1 rounded-md hover:bg-gray-700 transition-colors">
                <Image
                  src={copied ? "/tick-circle.png" : "/copy.png"}
                  alt=""
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </div>
              <span className="absolute bottom-full right-0 mb-1 hidden group-hover:inline bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap border border-slate-700">
                {copied ? "Copied" : "Copy"}
              </span>
            </div>
          </CopyToClipboard>
          
          <div className="relative group">
            <div className="p-1 rounded-md hover:bg-gray-700 transition-colors">
              <Image
                src="/wallet.png"
                alt=""
                width={24}
                height={24}
                className="cursor-pointer"
                onClick={handleAddToWallet}
              />
            </div>
            <span className="absolute bottom-full right-0 mb-1 hidden group-hover:inline bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap border border-slate-700">
              Add to Wallet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 