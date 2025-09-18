import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { z } from 'zod';
import Header from '../components/Header';

import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Keypair, Transaction } from '@solana/web3.js';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';

// Define the schema for form validation
const poolSchema = z.object({
  tokenName: z.string().min(3, 'Token name must be at least 3 characters'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokenLogo: z.instanceof(File, { message: 'Token logo is required' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

interface FormValues {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: File | undefined;
  website?: string;
  twitter?: string;
}

export default function CreatePool() {
  const { publicKey, signTransaction } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const [isLoading, setIsLoading] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);

  const form = useForm({
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenLogo: undefined,
      website: '',
      twitter: '',
    } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        const { tokenLogo } = value;
        if (!tokenLogo) {
          toast.error('Token logo is required');
          return;
        }

        if (!signTransaction) {
          toast.error('Wallet not connected');
          return;
        }

        const reader = new FileReader();

        // Convert file to base64
        const base64File = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(tokenLogo);
        });

        const keyPair = Keypair.generate();

        // Step 1: Upload to Arweave and get transaction
        const uploadResponse = await fetch('/api/upload-arweave', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenLogo: base64File,
            mint: keyPair.publicKey.toBase58(),
            tokenName: value.tokenName,
            tokenSymbol: value.tokenSymbol,
            userWallet: address,
          }),
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error);
        }

        const { poolTx } = await uploadResponse.json();
        const transaction = Transaction.from(Buffer.from(poolTx, 'base64'));

        // Step 2: Sign with keypair first
        transaction.sign(keyPair);

        // Step 3: Then sign with user's wallet
        const signedTransaction = await signTransaction(transaction);

        // Step 4: Send signed transaction
        const sendResponse = await fetch('/api/send-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction.serialize().toString('base64'),
          }),
        });

        if (!sendResponse.ok) {
          const error = await sendResponse.json();
          throw new Error(error.error);
        }

        const { success } = await sendResponse.json();
        if (success) {
          toast.success('Pool created successfully');
          setPoolCreated(true);
        }
      } catch (error) {
        console.error('Error creating pool:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create pool');
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = poolSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
        return undefined;
      },
    },
  });

  return (
    <>
      <Head>
        <title>Create Pool - Virtual Curve</title>
        <meta
          name="description"
          content="Create a new token pool on Virtual Curve with customizable price curves."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />
        {/* Page Content */}
        <main className="max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 text-[#1a1a1a]">Create Pool</h1>
            <p className="text-lg text-[#666] leading-relaxed">Launch your token with permanent metadata storage on Arweave</p>
          </div>

          {poolCreated && !isLoading ? (
            <PoolCreationSuccess />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              {/* Token Details Section */}
              <div className="bg-[#fafbfc] rounded-2xl border border-[#e1e5e9] p-4 sm:p-6 lg:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#1a1a1a]">Token Details</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#374151]">Token Name*</label>
                      {form.Field({
                        name: 'tokenName',
                        children: (field) => (
                          <input
                            className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 placeholder-[#9ca3af]"
                            placeholder="e.g. Virtual Coin"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            minLength={3}
                          />
                        ),
                      })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#374151]">Token Symbol*</label>
                      {form.Field({
                        name: 'tokenSymbol',
                        children: (field) => (
                          <input
                            className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 placeholder-[#9ca3af]"
                            placeholder="e.g. VRTL"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            maxLength={10}
                          />
                        ),
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#374151]">Token Logo*</label>
                    <div className="mb-3 text-sm text-[#6b7280] flex items-center gap-2">
                      <span className="iconify ph--lock-simple text-[#f59e42]" />
                      Permanently stored on Arweave blockchain
                    </div>
                    {form.Field({
                      name: 'tokenLogo',
                      children: (field) => (
                        <div className="border-2 border-dashed border-[#d1d5db] rounded-xl p-8 flex flex-col items-center justify-center bg-white hover:border-[#9ca3af] transition-colors duration-200">
                          <span className="iconify ph--upload-simple text-4xl mb-3 text-[#9ca3af]" />
                          <div className="text-sm text-[#6b7280] mb-1 font-medium">PNG, JPG or SVG (max. 2MB)</div>
                          <div className="text-xs text-[#9ca3af] mb-4">Files are stored permanently on Arweave</div>
                          <input
                            type="file"
                            id="tokenLogo"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.handleChange(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="tokenLogo"
                            className="px-6 py-2 bg-white border border-[#d1d5db] rounded-lg text-[#374151] font-medium hover:bg-[#f9fafb] hover:border-[#9ca3af] cursor-pointer transition-all duration-200"
                          >
                            Browse Files
                          </label>
                          {field.state.value && (
                            <div className="mt-3 text-sm text-[#059669] font-medium">
                              ✓ {field.state.value.name}
                            </div>
                          )}
                        </div>
                      ),
                    })}
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="bg-[#fafbfc] rounded-2xl border border-[#e1e5e9] p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6 text-[#1a1a1a]">
                  Social Links <span className="font-normal text-lg text-[#6b7280]">(Optional)</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#374151]">Website</label>
                    {form.Field({
                      name: 'website',
                      children: (field) => (
                        <input
                          className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 placeholder-[#9ca3af]"
                          placeholder="https://yourwebsite.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="url"
                        />
                      ),
                    })}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#374151]">Twitter</label>
                    {form.Field({
                      name: 'twitter',
                      children: (field) => (
                        <input
                          className="w-full border border-[#d1d5db] rounded-lg px-4 py-3 text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 placeholder-[#9ca3af]"
                          placeholder="https://twitter.com/yourusername"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="url"
                        />
                      ),
                    })}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {form.state.errors && form.state.errors.length > 0 && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 space-y-2">
                  {form.state.errors.map((error, index) =>
                    Object.entries(error || {}).map(([, value]) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="iconify ph--warning-circle text-[#dc2626] mt-0.5" />
                        <p className="text-[#b91c1c] text-sm">
                          {Array.isArray(value)
                            ? value.map((v: any) => v.message || v).join(', ')
                            : typeof value === 'string'
                              ? value
                              : String(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <SubmitButton isSubmitting={isLoading} />
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  if (!publicKey) {
    return (
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 flex items-center gap-2 text-base"
      >
        <span className="iconify ph--wallet w-5 h-5" />
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#ff4e9b] to-[#a259ff] shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 flex items-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="iconify ph--spinner w-5 h-5 animate-spin" />
          Creating Pool...
        </>
      ) : (
        <>
          <span className="iconify ph--rocket-bold w-5 h-5" />
          Launch Pool on Arweave
        </>
      )}
    </button>
  );
};

const PoolCreationSuccess = () => {
  return (
    <div className="bg-[#fafbfc] rounded-2xl border border-[#e1e5e9] p-8 shadow-sm text-center">
      <div className="bg-[#dcfce7] p-4 rounded-full inline-flex mb-6">
        <span className="iconify ph--check-bold w-12 h-12 text-[#059669]" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-[#1a1a1a]">Pool Created Successfully!</h2>
      <p className="text-[#6b7280] mb-8 max-w-lg mx-auto leading-relaxed">
        Your token pool has been created and is now live on the platform. Users can
        now buy and trade your tokens with permanent metadata stored on Arweave.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-white border border-[#d1d5db] px-6 py-3 rounded-xl font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#9ca3af] transition-all duration-200"
        >
          Explore Pools
        </Link>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="cursor-pointer bg-gradient-to-r from-[#ff4e9b] to-[#a259ff] px-6 py-3 rounded-xl font-medium text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Create Another Pool
        </button>
      </div>
    </div>
  );
};
