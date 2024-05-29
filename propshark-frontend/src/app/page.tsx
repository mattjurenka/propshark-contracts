"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from 'next/dynamic'
import { ConnectButton, ConnectModal, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui.js/utils";
import USDCBalance from "@/components/usdc_balance";
import { Progress } from "@/components/ui/progress";
import LoginButton from "@/components/connect_button";
import RaiseCard from "@/components/raise";


export default function Home() {
  const current_account = useCurrentAccount()

  return (
    <main>
      <div className="flex flex-col justify-center px-4">
        <div className="flex w-full max-w-7xl py-4 gap-2 items-center">
          <img src="shark.svg" className="h-6 w-6" />
          <h3 className="leading-[36px] scroll-m-20 text-lg font-semibold tracking-tight text-nowrap">
            PropShark Protocol
          </h3>
          <div className="ml-auto flex gap-4">
            <LoginButton />
          </div>
        </div>
        <div className="relative gap-4 mt-4 items-center">
          <img src="shark_painting.png" className="h-40 w-40 rounded-xl" />
          <div className="absolute right-0 bottom-2 bg-[#6593f3a0] text-[#000000] rounded-xl px-4 py-2">
            <h3 className="scroll-m-20 text-2xl font-bold tracking-normal leading-normal text-nowrap">
              Real Investments:<br /> Real Returns
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Open Raises
          </h3>
          <RaiseCard img="housetwo.jpg" address="701 Jeffry Cliff, Port Armandinaland, MO 25172" annual_yield={51680} cap_rate={0.0544} raise_target={950000} sqft={2016} total_raised={731040} user_contribution={0} />
          <RaiseCard img="houseone.webp" address="440 Rockville Street, Hephzibah, GA 30815" annual_yield={30350} cap_rate={0.0607} raise_target={500000} sqft={4000} total_raised={258000} user_contribution={0} />
        </div>
      </div>
    </main>
  );
}

        //<div className="ml-auto flex gap-4">
        //  {current_account && 
        //    <div className="flex gap-4">
        //      <USDCBalance address={current_account.address} />
        //      <p className="leading-[36px] font-bold">{formatAddress(current_account.address)}</p>
        //    </div>
        //  }
        //  <ConnectModal trigger={current_account ? <Button>Disconnect Wallet</Button> : <Button>Connect Wallet</Button>} />
        //</div>