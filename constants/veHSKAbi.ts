export const VeHSKABI = [
  {
      "type": "constructor",
      "inputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "CLOCK_MODE",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "DEFAULT_ADMIN_ROLE",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "ONE_YEAR_IN_DAYS",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "RATIO_DECIMAL_PRECISION",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "TIMELOCKER_ROLE",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "UPGRADE_INTERFACE_VERSION",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "allocateStrategic",
      "inputs": [
          {
              "name": "to",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "allowance",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "approve",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "balanceOfAt",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "blockNumber",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "banAccessTier",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "checkpoints",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "pos",
              "type": "uint32",
              "internalType": "uint32"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "tuple",
              "internalType": "struct Checkpoints.Checkpoint208",
              "components": [
                  {
                      "name": "_key",
                      "type": "uint48",
                      "internalType": "uint48"
                  },
                  {
                      "name": "_value",
                      "type": "uint208",
                      "internalType": "uint208"
                  }
              ]
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "clock",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint48",
              "internalType": "uint48"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "configureAccessGroup",
      "inputs": [
          {
              "name": "accounts",
              "type": "address[]",
              "internalType": "address[]"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "consumeVotePower",
      "inputs": [
          {
              "name": "voter",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "decimals",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint8",
              "internalType": "uint8"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "delegate",
      "inputs": [
          {
              "name": "delegatee",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "delegateBySig",
      "inputs": [
          {
              "name": "delegatee",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "nonce",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "expiry",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "v",
              "type": "uint8",
              "internalType": "uint8"
          },
          {
              "name": "r",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "s",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "delegates",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "fields",
              "type": "bytes1",
              "internalType": "bytes1"
          },
          {
              "name": "name",
              "type": "string",
              "internalType": "string"
          },
          {
              "name": "version",
              "type": "string",
              "internalType": "string"
          },
          {
              "name": "chainId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "verifyingContract",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "extensions",
              "type": "uint256[]",
              "internalType": "uint256[]"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "enableParticipant",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "flexibleRatio",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getDelegatee",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getFlexibleMintableAmount",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "stakeId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getLockedMintableAmount",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "stakeId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getMintableAmount",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "mintableTotal",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "flexibleMintable",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "lockedMintable",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "flexibleStakeCount",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "lockedStakeCount",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getMintedAmount",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "isLocked",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "stakeId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getPastTotalSupply",
      "inputs": [
          {
              "name": "timepoint",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getPastVotes",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "blockNumber",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getRoleAdmin",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVotes",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "grantRole",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "grantTimeLockerRole",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "hasAccessTier",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "hasRole",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "initialize",
      "inputs": [
          {
              "name": "_stakingContract",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "_initialTimelocker",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "locked180DaysRatio",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "locked30DaysRatio",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "locked365DaysRatio",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "locked90DaysRatio",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "mint",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "mintedTotal",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "flexibleCount",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "lockedCount",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "mintFlexibleVeHSK",
      "inputs": [
          {
              "name": "stakeId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "mintLockedVeHSK",
      "inputs": [
          {
              "name": "stakeId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "name",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "nonces",
      "inputs": [
          {
              "name": "owner",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "numCheckpoints",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint32",
              "internalType": "uint32"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "owner",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "processReservedAllocation",
      "inputs": [
          {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "proxiableUUID",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [

      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "renounceRole",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "callerConfirmation",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "revokeRole",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "revokeTimeLockerRole",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setFlexibleRatio",
      "inputs": [
          {
              "name": "_newRatio",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setLocked180DaysRatio",
      "inputs": [
          {
              "name": "_newRatio",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setLocked30DaysRatio",
      "inputs": [
          {
              "name": "_newRatio",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setLocked365DaysRatio",
      "inputs": [
          {
              "name": "_newRatio",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setLocked90DaysRatio",
      "inputs": [
          {
              "name": "_newRatio",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setStakingContract",
      "inputs": [
          {
              "name": "_stakingContract",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "stakingContract",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
          {
              "name": "interfaceId",
              "type": "bytes4",
              "internalType": "bytes4"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "symbol",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "totalSupply",
      "inputs": [

      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "totalSupplyAt",
      "inputs": [
          {
              "name": "blockNumber",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "transfer",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
          {
              "name": "newOwner",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "undelegate",
      "inputs": [

      ],
      "outputs": [

      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "upgradeToAndCall",
      "inputs": [
          {
              "name": "newImplementation",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [

      ],
      "stateMutability": "payable"
  },
  {
      "type": "event",
      "name": "AddressRemovedFromWhitelist",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "AddressWhitelisted",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "Approval",
      "inputs": [
          {
              "name": "owner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "spender",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "value",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DelegateChanged",
      "inputs": [
          {
              "name": "delegator",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "fromDelegate",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "toDelegate",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DelegateChanged",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "delegatee",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DelegateVotesChanged",
      "inputs": [
          {
              "name": "delegate",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "previousVotes",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "newVotes",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DirectMint",
      "inputs": [
          {
              "name": "to",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "amount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "EIP712DomainChanged",
      "inputs": [

      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "Initialized",
      "inputs": [
          {
              "name": "version",
              "type": "uint64",
              "indexed": false,
              "internalType": "uint64"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "Mint",
      "inputs": [
          {
              "name": "user",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "isLocked",
              "type": "bool",
              "indexed": false,
              "internalType": "bool"
          },
          {
              "name": "stakeId",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "amount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
          {
              "name": "previousOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "newOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "RatioUpdated",
      "inputs": [
          {
              "name": "ratioType",
              "type": "string",
              "indexed": false,
              "internalType": "string"
          },
          {
              "name": "oldRatio",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "newRatio",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "RoleAdminChanged",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "indexed": true,
              "internalType": "bytes32"
          },
          {
              "name": "previousAdminRole",
              "type": "bytes32",
              "indexed": true,
              "internalType": "bytes32"
          },
          {
              "name": "newAdminRole",
              "type": "bytes32",
              "indexed": true,
              "internalType": "bytes32"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "RoleGranted",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "indexed": true,
              "internalType": "bytes32"
          },
          {
              "name": "account",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "sender",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "RoleRevoked",
      "inputs": [
          {
              "name": "role",
              "type": "bytes32",
              "indexed": true,
              "internalType": "bytes32"
          },
          {
              "name": "account",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "sender",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "StakingContractUpdated",
      "inputs": [
          {
              "name": "stakingContract",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "Transfer",
      "inputs": [
          {
              "name": "from",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "to",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "value",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "Upgraded",
      "inputs": [
          {
              "name": "implementation",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "VotePowerConsumed",
      "inputs": [
          {
              "name": "voter",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "amount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "error",
      "name": "AccessControlBadConfirmation",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "AccessControlUnauthorizedAccount",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "neededRole",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ]
  },
  {
      "type": "error",
      "name": "AddressEmptyCode",
      "inputs": [
          {
              "name": "target",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "CheckpointUnorderedInsertion",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "ECDSAInvalidSignature",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "ECDSAInvalidSignatureLength",
      "inputs": [
          {
              "name": "length",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "ECDSAInvalidSignatureS",
      "inputs": [
          {
              "name": "s",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC1967InvalidImplementation",
      "inputs": [
          {
              "name": "implementation",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC1967NonPayable",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "ERC20ExceededSafeSupply",
      "inputs": [
          {
              "name": "increasedSupply",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "cap",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InsufficientAllowance",
      "inputs": [
          {
              "name": "spender",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "allowance",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "needed",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InsufficientBalance",
      "inputs": [
          {
              "name": "sender",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "balance",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "needed",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InvalidApprover",
      "inputs": [
          {
              "name": "approver",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InvalidReceiver",
      "inputs": [
          {
              "name": "receiver",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InvalidSender",
      "inputs": [
          {
              "name": "sender",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC20InvalidSpender",
      "inputs": [
          {
              "name": "spender",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC5805FutureLookup",
      "inputs": [
          {
              "name": "timepoint",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "clock",
              "type": "uint48",
              "internalType": "uint48"
          }
      ]
  },
  {
      "type": "error",
      "name": "ERC6372InconsistentClock",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "FailedCall",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "InvalidAccountNonce",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "currentNonce",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "InvalidInitialization",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "NotInitializing",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
          {
              "name": "owner",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "ReentrancyGuardReentrantCall",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "SafeCastOverflowedUintDowncast",
      "inputs": [
          {
              "name": "bits",
              "type": "uint8",
              "internalType": "uint8"
          },
          {
              "name": "value",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "StakingContractNotSet",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "UUPSUnauthorizedCallContext",
      "inputs": [

      ]
  },
  {
      "type": "error",
      "name": "UUPSUnsupportedProxiableUUID",
      "inputs": [
          {
              "name": "slot",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ]
  },
  {
      "type": "error",
      "name": "VotesExpiredSignature",
      "inputs": [
          {
              "name": "expiry",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  }
] as const;