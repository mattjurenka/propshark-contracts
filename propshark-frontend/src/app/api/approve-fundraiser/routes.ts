"use server"
import { SuiClient } from '@mysten/sui.js/client'
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import house_addresses from "../../../../../deployed-addresses/houses.json"
import propshark_addresses from "../../../../../deployed-addresses/propshark.json"

const client = new SuiClient({ url: "https://1b22-2001-19f0-1000-2f9b-5400-4ff-fef0-223.ngrok-free.app/" })

export async function test(house_name: string, address: string) {
    const { schema, secretKey } = decodeSuiPrivateKey(process.env.PRIVKEY!);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    
    const house_info = (house_addresses as any)[house_name]

    const txb = new TransactionBlock()
    txb.moveCall({
        target: `${propshark_addresses.propshark_package_id}::propshark_contracts::authorize_fundraise_contributor`,
        arguments: [txb.object(house_info.fundraise_id), txb.pure(address), txb.object(house_info.fundraise_manager_cap)],
        typeArguments: [propshark_addresses.types.mock_usdc_type, house_info.types.house_type]
    })
    await client.signAndExecuteTransactionBlock({
        signer: keypair, transactionBlock: txb
    })
}
