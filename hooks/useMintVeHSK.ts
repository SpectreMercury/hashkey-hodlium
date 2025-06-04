'use client';

import { useChainId, usePublicClient, useWalletClient, useSwitchChain, useConfig, useAccount } from 'wagmi';
import { getContractAddresses } from '@/config/contracts';
import { VeHSKABI } from '@/constants/veHSKAbi';
import { useState, useEffect } from 'react';
import { Address, TransactionReceipt, UserRejectedRequestError } from 'viem';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { MintableAmountInfo } from '@/types/contracts';

export function useMintVeHSK() {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync, isPending: isSwitchingChain, error: switchChainError } = useSwitchChain();
  const config = useConfig();
  const contractAddress = getContractAddresses(chainId).veHSKContract as Address;

  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const mintVeHSK = async (): Promise<boolean> => {
    try {
      setIsPending(true);
      setError(null);
      setTxHash(null);
      
      // 1. Check Prerequisites
      if (!publicClient || !contractAddress || !config) {
        const missing = [
          !publicClient && 'PublicClient',
          !contractAddress && 'contractAddress',
          !config && 'Wagmi Config',
        ].filter(Boolean).join(', ');
        throw new Error(`Required client or config not available. Missing: ${missing}`);
      }

      // 2. Check and Switch Chain if Necessary
      if (publicClient.chain.id !== chainId) {
        console.log(`Chain mismatch: Wallet is on ${publicClient.chain.id}, need ${chainId}. Attempting to switch...`);
        if (!switchChainAsync) {
          throw new Error('Switch chain function not available.');
        }
        try {
          await switchChainAsync({ chainId });
          console.log(`Switched chain to ${chainId} successfully.`);
        } catch (switchError: any) {
          if (switchError instanceof UserRejectedRequestError) {
            throw new Error('User rejected network switch request.');
          }
          throw new Error(`Failed to switch network: ${switchError.message || 'Unknown error'}`);
        }
      }

      // 3. Send Transaction
      console.log(`Minting veHSK on chain ${chainId} to contract ${contractAddress}`);
      const hash = await writeContract(config, {
        address: contractAddress,
        abi: VeHSKABI,
        functionName: 'mint',
        args: [],
        chainId,
      });
      setTxHash(hash);
      console.log('Transaction submitted with hash:', hash);

      // 4. Wait for Transaction Confirmation
      setIsConfirming(true);
      const receipt: TransactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });
      console.log('Transaction confirmed:', receipt);

      return receipt.status === 'success';
    } catch (submitError: any) {
      console.error('Minting veHSK failed:', submitError);
      setError(submitError instanceof Error ? submitError : new Error('Minting failed'));
      throw submitError;
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    mintVeHSK,
    isPending,
    isConfirming,
    isSwitchingChain,
    error: error || switchChainError,
    txHash,
  };
}
// 0xCC488872237c7682f7c4211Dda7f687695701c68 184089
// 0xcAbA40D6D806A617bD65d16CE330ffABc9c16D75 9917
// 0x3C4A794213C2f300eB79383693DBf0429C680360 1235
// 0x20CE63aC14Da383d69150A4BfE36389d5E17A78E 36
// 0x761F68e5b50e1cc6771234c0E3a3ED4a9E78037E 38
export function useMintableAmount() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  const [data, setData] = useState<{
    mintableAmount: MintableAmountInfo | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    mintableAmount: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchMintableAmount = async () => {
      if (!address || !publicClient) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const contractAddress = getContractAddresses(chainId).veHSKContract;
        
        const mintableInfo = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: VeHSKABI,
          functionName: 'getMintableAmount',
          // args: ["0x761F68e5b50e1cc6771234c0E3a3ED4a9E78037E"],
          args: [address],
        }) as [bigint, bigint, bigint, bigint, bigint];
        setData({
          mintableAmount: {
            mintableTotal: mintableInfo[0],
            flexibleMintable: mintableInfo[1],
            lockedMintable: mintableInfo[2],
            flexibleStakeCount: mintableInfo[3],
            lockedStakeCount: mintableInfo[4],
          },
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error('获取可铸造数量失败:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('获取可铸造数量失败'),
        }));
      }
    };

    fetchMintableAmount();
    
    // 每 5 分钟自动刷新一次
    const intervalId = setInterval(fetchMintableAmount, 300000); 
    
    // 清除定时器
    return () => clearInterval(intervalId);
  }, [address, chainId, publicClient]);

  return data;
}

