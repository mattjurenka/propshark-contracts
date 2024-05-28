import { SuiClient, type SuiObjectChange } from '@mysten/sui.js/client';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export const deploy_directory = async (directory: string): Promise<SuiObjectChange[] | null | undefined> => {
    const mnemonic = process.env.DEPLOYER_PRIVKEY
    if (!mnemonic) {
        console.error("Must provide DEPLOYER_PRIVKEY as env var")
        process.exit(1)
    }

    const client = new SuiClient({ url: "http://127.0.0.1:9000" })

    const { schema, secretKey } = decodeSuiPrivateKey(mnemonic);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);

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