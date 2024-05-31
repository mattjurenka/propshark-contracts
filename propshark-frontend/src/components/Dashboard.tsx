import { useCurrentWallet } from "@mysten/dapp-kit"
import { Button } from "./ui/button"

export default function Dashboard() {
    const account = useCurrentWallet()
    if (!account.currentWallet) {
        return <></>
    }

    return <div>
          <h3 className="mt-8 mb-2 scroll-m-20 text-2xl font-semibold tracking-tight">
            Dashboard
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="font-bold text-xl">$25,000</p>
                <p className="text-xs">Total Position</p>
            </div>
            <div>
                <p className="font-bold text-xl">$3,000</p>
                <p className="text-xs">Total Claimed Rent</p>
            </div>
            <div>
                <p className="font-bold text-xl">$50,000</p>
                <p className="text-xs">Locked in Raises</p>
            </div>
            <div>
                <p className="font-bold text-xl">1</p>
                <p className="text-xs">Properties Held</p>
            </div>
          </div>
          <h3 className="mt-4 mb-2 scroll-m-20 text-2xl font-semibold tracking-tight">
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
                <p className="font-bold text-xl">$2,360</p>
                <p className="text-xs">Unclaimed Rent</p>
            </div>
            <Button variant={"secondary"} className="bg-[#6593f3a0]">Claim</Button>
            <div>
                <p className="font-bold text-xl">1</p>
                <p className="text-xs">Open Proposals</p>
            </div>
            <Button variant={"secondary"} className="bg-[#6593f3a0]">Vote</Button>
          </div>
    </div>
}