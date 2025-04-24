'use client';

import { useChainId, usePublicClient, useWalletClient, useSwitchChain, useConfig } from 'wagmi';
import { getContractAddresses } from '@/config/contracts';
import { VeHSKABI } from '@/constants/veHSKAbi';
import { useState } from 'react';
import { Address, TransactionReceipt, UserRejectedRequestError } from 'viem';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

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
      if (!walletClient || !publicClient || !contractAddress || !config) {
        const missing = [
          !walletClient && 'WalletClient',
          !publicClient && 'PublicClient',
          !contractAddress && 'contractAddress',
          !config && 'Wagmi Config',
        ].filter(Boolean).join(', ');
        throw new Error(`Required client or config not available. Missing: ${missing}`);
      }

      // 2. Check and Switch Chain if Necessary
      if (walletClient.chain.id !== chainId) {
        console.log(`Chain mismatch: Wallet is on ${walletClient.chain.id}, need ${chainId}. Attempting to switch...`);
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