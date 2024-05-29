"use client"
import { Progress } from "@radix-ui/react-progress";
import { Button } from "./ui/button";
import LoginButton from "./connect_button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { money_format } from "@/lib/utils";

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
}

export default function RaiseCard({ img, raise_target, total_raised, user_contribution, annual_yield, cap_rate, sqft, address, type }: RaiseProps) {
    const current_account = useCurrentAccount()
    return <div className="rounded-xl bg-gray-200">
        <img src={img} className="rounded-t-xl object-cover max-h-48 w-full"></img>
        <Progress value={50} className="rounded-none [&>*]:bg-[#6593f3]" />
        <div className="border border-t-0 border-gray rounded-b-xl pt-2 px-2 pb-4">
            <p className="font-bold text-lg">{money_format.format(total_raised)} / {money_format.format(raise_target)}</p>
            <div className="flex gap-4 mt-2">
            <div>
                <p className="font-bold">{money_format.format(annual_yield)}</p>
                <p className="leading-tight">Annual Yield</p>
            </div>
            <div>
                <p className="font-bold">{cap_rate.toFixed(2)}%</p>
                <p className="leading-tight">Cap Rate</p>
            </div>
            <div>
                <p className="font-bold">{sqft.toLocaleString()} sqft</p>
                <p className="leading-tight">{type}</p>
            </div>
            </div>
            <p className="mt-2 text-sm">{address}</p>
            <p className="text-sm mb-4">Managed by Barracuda Properties</p>
            {current_account?.address ?
            <div className="text-center">
                <table className="w-full">
                    <tbody>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Amount Contributed
                            </td>
                            <td className="text-right">
                                {money_format.format(user_contribution)}
                            </td>
                        </tr>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Ownership Stake
                            </td>
                            <td className="text-right">
                                {(user_contribution / raise_target * 100).toFixed(2)}%
                            </td>
                        </tr>
                        <tr className="m-0 border-t p-0 even:bg-muted">
                            <td className="text-left font-bold">
                                Expected Annual Yield
                            </td>
                            <td className="text-right">
                                {money_format.format(user_contribution * cap_rate)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="flex gap-4 mt-2">
                    <Button className="">Participate</Button>
                    <Button onClick={() => window.open("/propsharkincorporation.pdf", "_blank")}>View Documents</Button>
                </div>
            </div> :
            <div className="text-center"><LoginButton></LoginButton></div>
            }
        </div>
    </div>
}