import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Shadow Diplomacy',
  projectId: 'shadow-diplomacy-demo',
  chains: [sepolia],
  ssr: false,
});
