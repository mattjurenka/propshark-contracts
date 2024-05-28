import { ConnectModal, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui.js/utils"
import { Button } from "./ui/button"

export default function LoginButton() {
    let current_account = useCurrentAccount()
    if (current_account) {
        return <p className="leading-[36px] font-bold">{formatAddress(current_account.address)}</p>
    } else {
        return <ConnectModal trigger={<Button>Connect Wallet</Button>} /> 
    }
}