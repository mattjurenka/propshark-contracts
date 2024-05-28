import { useSuiClientQuery } from "@mysten/dapp-kit"
import { types } from "../../../deployed-addresses/propshark.json"

interface USDCBalanceProps {
    address: string
}

const format = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", })

export default function USDCBalance({ address }: USDCBalanceProps) {
    const { data, isLoading } = useSuiClientQuery("getBalance", {owner: address, coinType: types.mock_usdc_type })
    
    if (isLoading || data === undefined) {
        return <p>Loading USDC Balance...</p>
    }

    const padded = data.totalBalance.padStart(7, "0")
    const with_period = padded.slice(0, -6) + "." + padded.slice(-6)

    return (
        <div className="flex gap-4 items-center">
            <p className="leading-[36px] font-bold">{format.format(Number(with_period))}</p>
            <img src="https://strapi-dev.scand.app/uploads/usdc_8cc5687a10.png" className="h-8 w-8" />
        </div>
    )
}