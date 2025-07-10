export const contractAddresses = {
    133: {
      stakingOldContract: '0x6b126ad5F9Cd3CeD2A7A8CEB5153d475BeE574c4' as `0x${string}`,
      stakingContract: '0xe41844eAFfD946b138E133E73f55bB9dd98FEa96' as `0x${string}`,
      stHSKToken: '0x' as `0x${string}`,
      veHSKContract: '0xbfDA9cb158CC994e3Af5eE0F006F76126e5c9257',
    },
    177: {
      stakingOldContract: '0x56E45F362cf4Bbfb5a99e631eF177f2907146483' as `0x${string}`,
      stakingContract: '0xD30A4CA3b40ea4FF00e81b0471750AA9a94Ce9b1' as `0x${string}`,
      stHSKToken: '0x' as `0x${string}`,
      veHSKContract: '0xe1045155ee02e0997E6bB4509D854a306c50D914',
    },
  };
  
  // 根据环境变量确定默认链ID
  export const defaultChainId = 133
  
  export const getContractAddresses = (chainId: number) => {
    return contractAddresses[chainId as keyof typeof contractAddresses] || 
      contractAddresses[defaultChainId];
  };

  
