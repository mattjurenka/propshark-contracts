import { TransactionBlock } from "@mysten/sui.js/transactions";
import { deploy_directory, find_created_object, find_published_package_id, get_client, write_json } from "./base";
import * as TOML from "@iarna/toml"

const propshark_move_file = await Bun.file("../propshark-contracts/Move.toml").text()
const parsed_toml = TOML.parse(propshark_move_file)
delete (parsed_toml as any)["package"]["published-at"];
(parsed_toml["addresses"] as any)["propshark_contracts"] = "0x0"

await Bun.write("../propshark-contracts/Move.toml", TOML.stringify(parsed_toml))

const changes = await deploy_directory("propshark-contracts")

const addresses: any = { types: {} }

console.log(changes)

const package_id = find_published_package_id(changes)
addresses.propshark_package_id = package_id

const accounting_token_type = `${package_id}::propshark_accounting_token::PROPSHARK_ACCOUNTING_TOKEN`
const mock_usdc_type = `${package_id}::mock_usdc::MOCK_USDC`

const accounting_token_tcap_type = `0x2::coin::TreasuryCap<${accounting_token_type}>`
const mock_usdc_tcap_type = `0x2::coin::TreasuryCap<${mock_usdc_type}>`

addresses.types.accounting_token_tcap_type = accounting_token_tcap_type
addresses.types.accounting_token_type = accounting_token_type
addresses.types.mock_usdc_tcap_type = mock_usdc_tcap_type
addresses.types.mock_usdc_type = mock_usdc_type

const mock_usdc_tcap_id = find_created_object(changes, mock_usdc_tcap_type)
const accounting_token_tcap_id = find_created_object(changes, accounting_token_tcap_type)
addresses.mock_usdc_tcap_id = mock_usdc_tcap_id
addresses.accounting_token_tcap_id = accounting_token_tcap_id

const [client, keypair] = get_client()
const trx = new TransactionBlock()
trx.moveCall({
    target: `${package_id}::propshark_contracts::create_accounting_token_holder`,
    arguments: [trx.object(accounting_token_tcap_id)]
})

const treasury_holder_type = `${package_id}::propshark_contracts::AccountingTokenTreasuryHolder`

const { objectChanges } = await client.signAndExecuteTransactionBlock({
    signer: keypair, transactionBlock: trx, options: {showObjectChanges: true}
})

const treasury_holder_id = find_created_object(objectChanges, treasury_holder_type)

addresses.types.treasury_holder_type = treasury_holder_type
addresses.treasury_holder_id = treasury_holder_id
console.log(objectChanges)

;(parsed_toml as any)["package"]["published-at"] = package_id;
(parsed_toml["addresses"] as any)["propshark_contracts"] = package_id
await Bun.write("../propshark-contracts/Move.toml", TOML.stringify(parsed_toml))

write_json(addresses, "propshark")