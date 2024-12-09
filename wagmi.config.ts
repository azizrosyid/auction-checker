import { defineConfig } from '@wagmi/cli';
import { etherscan } from '@wagmi/cli/plugins';
import { baseSepolia } from 'viem/chains';

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      abi: [
        {
          inputs: [
            { internalType: 'uint256', name: '_price', type: 'uint256' },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          name: 'getPrice',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'price',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_price', type: 'uint256' },
          ],
          name: 'setPrice',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      name: 'MockOracle',
    },
  ],
  plugins: [
    etherscan({
      apiKey: 'ESJVMZGG1C79FG8YZDQCPUESX6PYKESIUV',
      chainId: baseSepolia.id,
      contracts: [
        {
          name: 'MockArtha',
          address: '0x11d89C52498627a63D42f3Fc2c56F72C308B804A',
        },
      ],
    }),
  ],
});
