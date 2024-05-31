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
import { bcs } from "@mysten/sui.js/bcs";
import Dashboard from "@/components/Dashboard";
import PropertyCard from "@/components/Property";

const get_txb = (address: string) => {
  const txb = new TransactionBlock()
  Object.keys(house_data).forEach(house => {
    txb.moveCall({
      target: `${propshark_addresses.propshark_package_id}::propshark_contracts::get_fundraise_contribution`,
      arguments: [txb.object((house_data as any)[house].fundraise_id), txb.pure(address)],
      typeArguments: [propshark_addresses.types.mock_usdc_type, (house_data as any)[house]["types"]["house_type"]]
    })
  })
  return txb
}

type OptionU64 = {
  Some: undefined
  None: true
} | {
  Some: bigint
  None: undefined
}

export default function Home() {
  const current_account = useCurrentAccount()
  const { data } = useSuiClientQuery("devInspectTransactionBlock", {
    sender: current_account?.address || "0x0",
    transactionBlock: get_txb(current_account?.address || "0x0"),
  })

  // CODE IS UGLY
  const values_map = data ? data.results?.reduce((acc, cur, idx) => {
    if (!cur.returnValues) return acc
    let [first_arg, second_arg] = cur.returnValues

    const [bytes, type] = first_arg
    const result: OptionU64 = bcs.de("Option<u64>", Uint8Array.from(bytes))
    let xd_result = undefined
    if (result.Some) {
      xd_result = Number(result.Some)
    }

    const [bytes_two] = second_arg
    const result_u64 = bcs.de("u64", Uint8Array.from(bytes_two))

    acc[Object.keys(house_data)[idx]] = [xd_result, result_u64]
    return acc
  }, {} as { [house_name: string]: [number | undefined, number] }) : undefined

  console.log(values_map)

  return (
    <main>
      <div className="flex flex-col justify-center px-4 pb-8">
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
        <Dashboard />
        <div className="flex flex-col gap-4">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Open Raises
          </h3>
          {Object.keys(house_data).map((house_name) => {
            const {cap_rate, raise_target, sqft, type, img, address} = (house_data as any)[house_name].metadata
            let needs_kyc = true
            let total_raised = 0
            let user_contribution = 0
            if (values_map) {
              const [found_user_contribution, found_total_raised] = values_map[house_name]
              if (found_user_contribution !== undefined) {
                needs_kyc = false
                user_contribution = found_user_contribution
              }
              total_raised = found_total_raised
            }
            
            if (house_name == "house_one") {
              total_raised = 83000
              user_contribution = 37000
              needs_kyc = false
            }

            return <RaiseCard
              address={address} annual_yield={raise_target * cap_rate / 100 * 0.92} cap_rate={cap_rate} raise_target={raise_target} sqft={sqft}
              type={type} img={img} total_raised={total_raised} user_contribution={user_contribution} needs_kyc={needs_kyc} house_name={house_name} key={address}
            />
          })}
        </div>
        <h3 className="mt-8 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight">
          Owned Properties
        </h3>
        <PropertyCard />
      </div>
    </main>
  );
}