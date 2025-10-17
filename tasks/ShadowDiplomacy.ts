import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "ShadowDiplomacy";

task("game:address", "Prints the ShadowDiplomacy address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const contract = await deployments.get(CONTRACT_NAME);

  console.log(`${CONTRACT_NAME} address is ${contract.address}`);
});

task("game:register", "Register a player with a unique name")
  .addParam("name", "Desired player name")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const { name } = taskArguments;

    const contractDeployment = await deployments.get(CONTRACT_NAME);
    const contract = await ethers.getContractAt(CONTRACT_NAME, contractDeployment.address);

    const [signer] = await ethers.getSigners();
    const tx = await contract.connect(signer).register(name);
    console.log(`Waiting for register tx ${tx.hash}...`);
    await tx.wait();
    console.log(`Registration complete for ${name}`);
  });

task("game:players", "List registered players in id order").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments, ethers } = hre;

  const contractDeployment = await deployments.get(CONTRACT_NAME);
  const contract = await ethers.getContractAt(CONTRACT_NAME, contractDeployment.address);

  const players = await contract.getPlayers();
  console.log("Registered players:");
  players.forEach((player: { id: bigint; name: string; account: string }) => {
    console.log(` - #${player.id.toString()} ${player.name} (${player.account})`);
  });
});

task("game:action", "Submit an encrypted action against another player")
  .addParam("target", "Target player address")
  .addParam("action", "Action to perform: alliance | attack | cancel")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { action, target } = taskArguments;
    const { deployments, ethers, fhevm } = hre;

    const normalized = String(action).toLowerCase();
    let actionValue: number;
    if (normalized === "alliance" || normalized === "ally" || normalized === "1") {
      actionValue = 1;
    } else if (normalized === "attack" || normalized === "2") {
      actionValue = 2;
    } else if (normalized === "cancel" || normalized === "cancelalliance" || normalized === "3") {
      actionValue = 3;
    } else {
      throw new Error("Unknown action. Use alliance, attack, or cancel");
    }

    const contractDeployment = await deployments.get(CONTRACT_NAME);
    const contract = await ethers.getContractAt(CONTRACT_NAME, contractDeployment.address);
    const [signer] = await ethers.getSigners();

    await fhevm.initializeCLIApi();
    const encryptedInput = await fhevm
      .createEncryptedInput(contractDeployment.address, signer.address)
      .add8(actionValue)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .submitAction(target, actionValue, encryptedInput.handles[0], encryptedInput.inputProof);

    console.log(`Waiting for action tx ${tx.hash}...`);
    await tx.wait();
    console.log(`Submitted action ${actionValue} to ${target}`);
  });
