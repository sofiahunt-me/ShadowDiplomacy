import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  if (!process.env.INFURA_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("INFURA_API_KEY is not set. Deployment may fail on public networks.");
  }

  const deployedContract = await deploy("ShadowDiplomacy", {
    from: deployer,
    log: true,
  });

  console.log(`ShadowDiplomacy contract: `, deployedContract.address);
};
export default func;
func.id = "deploy_shadow_diplomacy"; // id required to prevent reexecution
func.tags = ["ShadowDiplomacy"];
