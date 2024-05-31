"use client"
import { Progress } from "@radix-ui/react-progress";
import { Button } from "./ui/button";
import LoginButton from "./connect_button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { money_format } from "@/lib/utils";
import ApproveKycDialog from "./ApproveKycDialog";
import GovernanceModal from "./GovernanceModal";
import BuyAndSell from "./BuyAndSell";

export interface RaiseProps {
    raise_target: number,
    total_raised: number,
    user_contribution: number,
    annual_yield: number,
    cap_rate: number,
    sqft: number,
    address: string
    img: string
    type: string
    needs_kyc: boolean
    house_name: string
}

export default function PropertyCard() {
    return <div className="rounded-xl bg-gray-200">
        <img src={"housesix.webp"} className="rounded-t-xl object-cover max-h-48 w-full"></img>
        <div className="border border-t-0 border-gray rounded-b-xl pt-2 px-2 pb-4">
            <p className="font-bold text-lg">$25,000 <span className="font-normal text-xs mr-4">Owned</span> $730,000 <span className="font-normal text-xs">Total Value</span></p>
            <div className="flex gap-4 mt-2">
            <div>
                <p className="font-bold">$34,520.24</p>
                <p className="leading-tight">Annual Yield</p>
            </div>
            <div>
                <p className="font-bold">5.14%</p>
                <p className="leading-tight">Cap Rate</p>
            </div>
            <div>
                <p className="font-bold">4 Units</p>
                <p className="leading-tight">Multifamily</p>
            </div>
            </div>
            <p className="mt-2 text-sm">{}</p>
            <p className="text-sm mb-4">Managed by Barracuda Properties</p>
            <div className="text-center">
                <table className="w-full">
                    <tbody>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Ownership Stake
                            </td>
                            <td className="text-right">
                                3.42%
                            </td>
                        </tr>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Expected Annual Yield
                            </td>
                            <td className="text-right">
                                $1,180
                            </td>
                        </tr>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Unclaimed Rents
                            </td>
                            <td className="text-right">
                                $2,360
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="flex flex-wrap justify-between gap-2 mt-2">
                    <Button>Claim Rent</Button>
                    <BuyAndSell />
                    <GovernanceModal />
                </div>
            </div>
        </div>
    </div>
}