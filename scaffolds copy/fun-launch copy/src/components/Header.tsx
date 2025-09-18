import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    // In a real implementation, this would connect to a Solana wallet
    setShowModal(true);
  };

  return (
    <header className="w-full bg-[#f1f5f9] border-b border-[#cbd5e1] px-4 py-4 shadow-sm">
      <div className="max-w-[80%] mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <span className="whitespace-nowrap text-lg md:text-2xl font-bold text-[#1a1a1a]">Fun Launch</span>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <CreatePoolButton />
          {address ? (
            <Button onClick={() => disconnect()}>{shortenAddress(address)}</Button>
          ) : (
            <Button
              onClick={() => {
                handleConnectWallet();
              }}
            >
              <span className="hidden md:block">Connect Wallet</span>
              <span className="block md:hidden">Connect</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
