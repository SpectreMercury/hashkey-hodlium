'use client';

import React, { useState } from 'react';
import MainLayout from '../main-layout';
import { useMintVeHSK, useMintableAmount } from '@/hooks/useMintVeHSK';
import { formatBigInt } from '@/utils/format';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Passed' | 'Failed';
  tallyUrl: string;
}

// 精选提案数据
const featuredProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase Staking Rewards Pool',
    description: 'Proposal to increase the annual staking rewards budget by 20% to incentivize more participation in the HashKey Chain ecosystem.',
    status: 'Active',
    tallyUrl: 'https://tally.xyz/gov/hashkey'
  },
  {
    id: '2', 
    title: 'Implement New Governance Framework',
    description: 'Introduction of a new governance framework to enhance decentralized decision-making and community participation.',
    status: 'Active',
    tallyUrl: 'https://tally.xyz/gov/hashkey'
  },
  {
    id: '3',
    title: 'Upgrade Staking Contract Security',
    description: 'Security upgrade for the staking smart contract with additional safety mechanisms and audit recommendations.',
    status: 'Passed',
    tallyUrl: 'https://tally.xyz/gov/hashkey'
  }
];

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mintVeHSK, isPending, isConfirming, error } = useMintVeHSK();
  const { mintableAmount, isLoading: isMintableAmountLoading } = useMintableAmount();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMintClick = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!mintableAmount?.mintableTotal || mintableAmount.mintableTotal === BigInt(0)) {
      toast.error('No veHSK available to claim');
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const success = await mintVeHSK();
      if (success) {
        setSuccessMessage('veHSK claimed successfully! Transaction confirmed.');
        toast.success('veHSK claimed successfully!');
      } else {
        setErrorMessage('Claiming transaction failed.');
        toast.error('Claiming transaction failed.');
      }
    } catch (err: any) {
      console.error('Claiming failed:', err);
      const errorMsg = `Claiming failed: ${err.shortMessage || err.message}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleProposalClick = (proposal: Proposal) => {
    window.open(proposal.tallyUrl, '_blank');
  };

  const isLoading = isPending || isConfirming;
  const hasClaimableAmount = mintableAmount?.mintableTotal && mintableAmount.mintableTotal > BigInt(0);

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-white mb-4">Claim veHSK</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Claim your voting power tokens based on your staking positions
              </p>
            </div>

            {/* Claimable Amount Display with Celebration Animation */}
            <div className={`relative bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8 overflow-hidden ${hasClaimableAmount ? 'celebration-container' : ''}`}>
              {/* Celebration Animation - Only show when there's claimable amount */}
              {!!hasClaimableAmount && (
                <>
                  {/* Left side celebration stripes */}
                  <div className="celebration-stripes celebration-stripes-left">
                    <div className="stripe stripe-1"></div>
                    <div className="stripe stripe-2"></div>
                    <div className="stripe stripe-3"></div>
                    <div className="stripe stripe-4"></div>
                    <div className="stripe stripe-5"></div>
                  </div>
                  
                  {/* Right side celebration stripes */}
                  <div className="celebration-stripes celebration-stripes-right">
                    <div className="stripe stripe-1"></div>
                    <div className="stripe stripe-2"></div>
                    <div className="stripe stripe-3"></div>
                    <div className="stripe stripe-4"></div>
                    <div className="stripe stripe-5"></div>
                  </div>

                  {/* Floating particles */}
                  <div className="celebration-particles">
                    <div className="particle particle-1"></div>
                    <div className="particle particle-2"></div>
                    <div className="particle particle-3"></div>
                    <div className="particle particle-4"></div>
                    <div className="particle particle-5"></div>
                    <div className="particle particle-6"></div>
                  </div>
                </>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <svg className="w-8 h-8 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-light text-white">Available to Claim</h2>
                  </div>
                  
                  {isMintableAmountLoading ? (
                    <div className="animate-pulse mb-8">
                      <div className="h-16 bg-slate-700 rounded w-64 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className={`text-6xl font-light mb-2 transition-all duration-500 ${hasClaimableAmount ? 'text-emerald-400 celebration-glow' : 'text-white'}`}>
                        {mintableAmount?.mintableTotal ? formatBigInt(mintableAmount.mintableTotal, 18, 4) : '0'}
                      </div>
                      <div className="text-2xl text-slate-400">veHSK</div>
                    </div>
                  )}

                  {/* Breakdown
                  {!isMintableAmountLoading && mintableAmount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="text-sm text-slate-400 mb-1">From Flexible Stakes</div>
                        <div className="text-xl font-medium text-white">
                          {formatBigInt(mintableAmount.flexibleMintable, 18, 4)} veHSK
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {mintableAmount.flexibleStakeCount.toString()} positions
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="text-sm text-slate-400 mb-1">From Locked Stakes</div>
                        <div className="text-xl font-medium text-white">
                          {formatBigInt(mintableAmount.lockedMintable, 18, 4)} veHSK
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {mintableAmount.lockedStakeCount.toString()} positions
                        </div>
                      </div>
                    </div>
                  )} */}

                  {/* Claim Button */}
                  <button
                    onClick={handleMintClick}
                    disabled={isLoading || !hasClaimableAmount || !isConnected}
                    className={`inline-flex items-center px-12 py-4 rounded-xl text-white text-lg font-medium shadow-lg transition-all duration-200 ease-in-out ${
                      isLoading || !hasClaimableAmount || !isConnected
                        ? 'bg-gray-600 cursor-not-allowed'
                        : hasClaimableAmount 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 hover:shadow-xl hover:scale-105 celebration-button-glow'
                        : 'bg-primary/80 hover:bg-primary hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isConfirming ? 'Confirming...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        Claim veHSK
                        <svg className={`w-5 h-5 ml-3 ${hasClaimableAmount ? 'celebration-coin-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="8" fill="none" />
                          <circle cx="12" cy="12" r="6" fill="gold" />
                          <path d="M12 8v8M8 12h8" strokeWidth="1.5" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Connection Warning */}
                  {!isConnected && (
                    <div className="mt-4 text-yellow-500 text-sm">
                      Please connect your wallet to claim veHSK
                    </div>
                  )}

                  {/* No Claimable Amount Warning */}
                  {isConnected && !isMintableAmountLoading && !hasClaimableAmount && (
                    <div className="mt-4 text-slate-400 text-sm">
                      No veHSK available to claim. Start staking to earn veHSK tokens.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-200">{successMessage}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-200">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* What is veHSK Section */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 mb-8">
              <h3 className="text-2xl font-light text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About veHSK
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Voting Power</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Participate in governance decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Vote on protocol upgrades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Shape the future of HashKey Chain</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">How It Works</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Earned from staking HSK tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Non-transferable governance token</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm">Claim anytime based on stake duration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Featured Proposals Section */}
            {/* <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
              <h3 className="text-2xl font-light text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Featured Governance Proposals
              </h3>
              <p className="text-slate-400 mb-8">
                Use your veHSK tokens to participate in these important governance decisions
              </p>
              
              <div className="space-y-4">
                {featuredProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    onClick={() => handleProposalClick(proposal)}
                    className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50 hover:border-primary/50 transition-all cursor-pointer hover:bg-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-medium text-white hover:text-primary transition-colors">
                        {proposal.title}
                      </h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        proposal.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : proposal.status === 'Passed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {proposal.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Tally
                      </div>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.open('https://tally.xyz/gov/hashkey', '_blank')}
                  className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  View All Proposals
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

    </MainLayout>
  );
}