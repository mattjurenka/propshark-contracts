import { deploy_directory, write_json } from "./base";

const changes = await deploy_directory("suitears/contracts")

const found = changes?.find(x => x.type == "published")
if (found?.type !== "published") {
    console.log("Error, didnt find published module")
    process.exit(1)
}

const package_id = found.packageId

write_json({ suitears_package_id: package_id }, "suitears")