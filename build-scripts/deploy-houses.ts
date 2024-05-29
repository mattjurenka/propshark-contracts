import { TransactionBlock } from "@mysten/sui.js/transactions";
import { deploy_directory, find_created_object, find_published_package_id, get_client, write_json } from "./base";
import { suitears_package_id } from "../deployed-addresses/suitears.json"
import { propshark_package_id, types as propshark_types } from "../deployed-addresses/propshark.json"
import * as TOML from "@iarna/toml";

const directories: any = {
    "house_one": {
        cap_rate: 6.06,
        raise_target: 950_000,
        sqft: 2016,
        type: "Office",
        img: "houseone.webp",
        address: "87823 O'Conner Fork, East Estebanbury, TN 43935"
    },
    "house_two": {
        cap_rate: 5.44,
        raise_target: 560_000,
        sqft: 3750,
        type: "Multifamily",
        img: "housetwo.jpg",
        address: "Apt. 215 66501 Lizabeth Ville, North Mee, CO 07749"
    },
    "house_three": {
        cap_rate: 6.10,
        raise_target: 2_360_000,
        sqft: 4305,
        type: "Retail",
        img: "housethree.jpg",
        address: "38288 Oberbrunner View, Gleasonshire, NH 67131"
    },
    "house_four": {
        cap_rate: 5.57,
        raise_target: 543_000,
        sqft: 2440,
        type: "Multifamily",
        img: "housefour.jpg",
        address: "52546 Conn Forge, Lake Malik, MT 93001"
    },
    "house_five": {
        cap_rate: 5.21,
        raise_target: 643000,
        sqft: 1950,
        type: "Multifamily",
        img: "housefive.jpg",
        address: "Suite 740 2482 Heathcote Field, Port Hoashire, WY 91606"
    }
}
const all_addresses: any = {}

const fix_move_toml = async (directory: string) => {
    const propshark_move_file = await Bun.file(`../property-contracts/${directory}/Move.toml`).text()
    const parsed_toml = TOML.parse(propshark_move_file);
    (parsed_toml["addresses"] as any)["propshark_contracts"] = propshark_package_id

    await Bun.write(`../property-contracts/${directory}/Move.toml`, TOML.stringify(parsed_toml))
}


for (const directory in directories) {
    await fix_move_toml(directory)

    const publish_changes = await deploy_directory("property-contracts/" + directory)

    const addresses: any = { types: {} }

    console.log(publish_changes)

    const package_id = find_published_package_id(publish_changes)
    addresses.house_one_package_id = package_id

    const house_type = `${package_id}::${directory}::${directory.toUpperCase()}`
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
    addresses.metadata = directories[directory]
    all_addresses[directory] = addresses
}

write_json(all_addresses, "houses")