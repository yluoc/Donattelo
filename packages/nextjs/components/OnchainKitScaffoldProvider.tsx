import { PropsWithChildren } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { useAccount } from "wagmi";

export const OnchainKitScaffoldProvider = ({ children }: PropsWithChildren) => {
  const { chain } = useAccount();

  // Map chain IDs to viem chains and cast them to avoid version conflicts
  const getOnchainKitChain = (chainId?: number) => {
    switch (chainId) {
      case 1:
        return mainnet as any;
      case 8453:
        return base as any;
      case 137:
        return polygon as any;
      case 42161:
        return arbitrum as any;
      case 10:
        return optimism as any;
      default:
        return base as any; // Default to base if chain is not supported
    }
  };

  return (
    <OnchainKitProvider
      chain={getOnchainKitChain(chain?.id)}
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      config={{
        appearance: {
          mode: "auto",
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
};
