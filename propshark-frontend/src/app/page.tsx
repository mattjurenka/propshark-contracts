"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from 'next/dynamic'
import { ConnectButton, ConnectModal, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui.js/utils";
import USDCBalance from "@/components/usdc_balance";
import { Progress } from "@/components/ui/progress";
import LoginButton from "@/components/connect_button";


export default function Home() {
  const current_account = useCurrentAccount()

  return (
    <main>
      <div className="flex flex-col justify-center px-4">
        <div className="flex w-full max-w-7xl py-4 gap-4">
          <img src="shark.svg" className="h-8 w-8" />
          <h3 className="leading-[36px] scroll-m-20 text-xl font-semibold tracking-tight">
            PropShark Protocol
          </h3>
          <div className="ml-auto flex gap-4">
            <LoginButton />
          </div>
        </div>
        <div className="flex gap-8 mt-4 items-center">
          <img src="shark_painting.png" className="h-40 w-40 rounded-xl" />
          <div>
            <h3 className="scroll-m-20 text-3xl font-bold tracking-tight leading-relaxed">
              Real Projects:<br /> Real Yield
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Open Raises
          </h3>
          <div className="rounded-xl bg-gray-200">
            <img src="houseone.webp" className="rounded-t-xl object-cover max-h-48 w-full"></img>
            <Progress value={Math.round((258 / 500) * 100)} className="rounded-none [&>*]:bg-[#6593f3]" />
            <div className="border border-t-0 border-gray rounded-b-xl pt-2 px-2 pb-4">
              <p className="font-bold text-lg">$258,000 / $500,000</p>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="font-bold">$30,350</p>
                  <p className="leading-tight">Annual Yield</p>
                </div>
                <div>
                  <p className="font-bold">6.07%</p>
                  <p className="leading-tight">Cap Rate</p>
                </div>
                <div>
                  <p className="font-bold">4,000 sqft</p>
                  <p className="leading-tight">Multifamily Apartments</p>
                </div>
              </div>
              <p className="mt-2 text-sm">440 Rockville Street, Hephzibah, GA 30815</p>
              <p className="text-sm mb-4">Managed by Barracuda Properties</p>
              {current_account?.address ?
                <div className="flex">
                  <p className="leading-[36px] font-bold">$0 / 500,000 -&gt; 0%</p>
                  <Button className="ml-auto">Participate</Button>
                </div> :
                <div className="text-center"><LoginButton></LoginButton></div>
              }
            </div>
          </div>
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