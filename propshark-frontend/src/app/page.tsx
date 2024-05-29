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
import house_data from "../../../deployed-addresses/houses.json"
import propshark_addresses from "../../../deployed-addresses/propshark.json"
import { TransactionBlock } from "@mysten/sui.js/transactions";

const txb = new TransactionBlock()
txb.moveCall({
  target: []
})


export default function Home() {
  const current_account = useCurrentAccount()
  const x = useSuiClientQuery("devInspectTransactionBlock", {

  })

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
          {Object.keys(house_data).map((house_name) => {
            const {cap_rate, raise_target, sqft, type, img, address} = (house_data as any)[house_name].metadata
            return <RaiseCard address={address} annual_yield={raise_target * cap_rate / 100 * 0.92} cap_rate={cap_rate} raise_target={raise_target} sqft={sqft} type={type} img={img} total_raised={0} user_contribution={0} />
          })}
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