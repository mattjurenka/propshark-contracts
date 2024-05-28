import { TransactionBlock } from "@mysten/sui.js/transactions";
import { types, mock_usdc_tcap_id } from "../deployed-addresses/propshark.json"

import { deploy_directory, find_created_object, find_published_package_id, get_client, write_json } from "./base";

const [client, keypair] = get_client()

const trx = new TransactionBlock()
const [minted] = trx.moveCall({
    target: "0x2::coin::mint",
    arguments: [trx.object(mock_usdc_tcap_id), trx.pure(100_000 * 1_000_000)],
    typeArguments: [types.mock_usdc_type]
})
trx.transferObjects([minted], Bun.argv[2])

const { objectChanges } = await client.signAndExecuteTransactionBlock({
    signer: keypair, transactionBlock: trx, options: {showObjectChanges: true}
})

console.log("new object", find_created_object(objectChanges, `0x2::coin::Coin<${types.mock_usdc_type}>`))