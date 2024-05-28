import { TransactionBlock } from "@mysten/sui.js/transactions";
import { deploy_directory, find_created_object, find_published_package_id, get_client, write_json } from "./base";
import { suitears_package_id } from "../deployed-addresses/suitears.json"
import { propshark_package_id, types as propshark_types } from "../deployed-addresses/propshark.json"

const publish_changes = await deploy_directory("property-contracts/house-one")

const addresses: any = { types: {} }

console.log(publish_changes)

const package_id = find_published_package_id(publish_changes)
addresses.house_one_package_id = package_id

const house_type = `${package_id}::house_one::HOUSE_ONE`
const dao_type = `${suitears_package_id}::dao::Dao<${house_type}>`
const dao_treasury_type = `${suitears_package_id}::dao_treasury::DaoTreasury<${house_type}>`
addresses.types.house_type = house_type
addresses.types.dao_type = dao_type
addresses.types.dao_treasury_type = dao_treasury_type

const dao_id = find_created_object(publish_changes, dao_type)
const dao_treasury_id = find_created_object(publish_changes, dao_treasury_type)
addresses.dao_id = dao_id
addresses.dao_treasury_id = dao_treasury_id

const fundraise_type = `${propshark_package_id}::propshark_contracts::Fundraise<${propshark_types.mock_usdc_type}, ${house_type}>`
const property_manager_cap_type = `${propshark_package_id}::propshark_contracts::PropertyManagerCap`
addresses.types.fundraise_type = fundraise_type
addresses.types.property_manager_cap_type = property_manager_cap_type

const [client, keypair] = get_client()
const trx = new TransactionBlock()
const [fundraiser, manager_cap] = trx.moveCall({
    target: `${propshark_package_id}::propshark_contracts::create_fundraise`,
    arguments: [trx.pure(500_000 * 1_000_000), trx.object(dao_id), trx.object(dao_treasury_id)],
    typeArguments: [propshark_types.mock_usdc_type, house_type]
})
trx.moveCall({
    target: "0x2::transfer::public_share_object",
    arguments: [fundraiser],
    typeArguments: [fundraise_type]
})
trx.transferObjects([manager_cap], keypair.toSuiAddress())

const { objectChanges } = await client.signAndExecuteTransactionBlock({
    signer: keypair, transactionBlock: trx, options: {showObjectChanges: true}
})


const fundraise_id = find_created_object(objectChanges, fundraise_type)
const fundraise_manager_cap = find_created_object(objectChanges, property_manager_cap_type)

addresses.fundraise_id = fundraise_id
addresses.fundraise_manager_cap = fundraise_manager_cap

console.log(objectChanges)

write_json(addresses, "houses")