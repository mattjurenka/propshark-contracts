import { SuiClient, type SuiObjectChange } from '@mysten/sui.js/client';
import { Keypair, decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export const get_client = (): [SuiClient, Keypair] => {
    const mnemonic = process.env.DEPLOYER_PRIVKEY
    if (!mnemonic) {
        console.error("Must provide DEPLOYER_PRIVKEY as env var")
        process.exit(1)
    }

    const client = new SuiClient({ url: "https://1b22-2001-19f0-1000-2f9b-5400-4ff-fef0-223.ngrok-free.app/" })

    const { schema, secretKey } = decodeSuiPrivateKey(mnemonic);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    return [client, keypair]
}

export const deploy_directory = async (directory: string): Promise<SuiObjectChange[] | null | undefined> => {
    const [client, keypair] = get_client()
    const contracts_directory = import.meta.dir + "/../" + directory

    const deploy_proc = Bun.spawn(["sui", "move", "build", "--silence-warnings", "--dump-bytecode-as-base64", "--path", contracts_directory]);

    const output = await new Response(deploy_proc.stdout).text();
    console.log(output)
    const { modules, dependencies } = JSON.parse(output)

    const deploy_trx = new TransactionBlock()
    const [upgrade_cap] = deploy_trx.publish({ modules, dependencies })
    deploy_trx.transferObjects([upgrade_cap], deploy_trx.pure(keypair.toSuiAddress()))

    const { balanceChanges, objectChanges } = await client.signAndExecuteTransactionBlock({
        signer: keypair, transactionBlock: deploy_trx,
        options: { showBalanceChanges: true, showObjectChanges: true }    
    })
    
    return objectChanges
}

export const write_json = async (contents: any, filename: string) => {
    Bun.write(import.meta.dir + "/../deployed-addresses/" + filename + ".json", JSON.stringify(contents, undefined, 4))
}

export const find_published_package_id = (changes: SuiObjectChange[] | null | undefined): string => {
    const found = changes?.find(x => x.type == "published")
    if (found?.type !== "published") {
        console.log("Error, didnt find any published modules")
        process.exit(1)
    }
    return found.packageId
}

export const find_created_object = (changes: SuiObjectChange[] | null | undefined, object_type: string): string => {
    const found = changes?.find(x => x.type == "created" && x.objectType == object_type)
    if (found?.type !== "created") {
        console.log("Error, didnt find any created objects with type: " + object_type)
        process.exit(1)
    }
    return found.objectId
}