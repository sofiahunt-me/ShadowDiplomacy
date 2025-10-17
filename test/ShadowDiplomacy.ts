import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ethers, fhevm } from "hardhat";
import { ShadowDiplomacy, ShadowDiplomacy__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ShadowDiplomacy")) as ShadowDiplomacy__factory;
  const contract = (await factory.deploy()) as ShadowDiplomacy;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("ShadowDiplomacy", function () {
  let signers: Signers;
  let contract: ShadowDiplomacy;
  let contractAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite requires the FHEVM mock environment");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  async function encryptAction(actor: HardhatEthersSigner, actionValue: number) {
    return fhevm
      .createEncryptedInput(contractAddress, actor.address)
      .add8(actionValue)
      .encrypt();
  }

  it("registers players with unique names and sequential ids", async function () {
    await contract.connect(signers.alice).register("Alice");
    await contract.connect(signers.bob).register("Bob");

    const players = await contract.getPlayers();
    expect(players.length).to.equal(2);
    expect(players[0].name).to.equal("Alice");
    expect(players[0].id).to.equal(1n);
    expect(players[1].name).to.equal("Bob");
    expect(players[1].id).to.equal(2n);

    await expect(contract.connect(signers.charlie).register("Alice")).to.be.revertedWithCustomError(contract, "NameTaken");
  });

  it("stores encrypted actions and updates alliance state", async function () {
    await contract.connect(signers.alice).register("Alice");
    await contract.connect(signers.bob).register("Bob");

    const encryptedAlliance = await encryptAction(signers.alice, 1);
    await contract
      .connect(signers.alice)
      .submitAction(signers.bob.address, 1, encryptedAlliance.handles[0], encryptedAlliance.inputProof);

    expect(await contract.isAllied(signers.alice.address, signers.bob.address)).to.equal(true);

    const storedAllianceHandle = await contract.getEncryptedAction(signers.alice.address, signers.bob.address);
    const allianceValue = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      storedAllianceHandle,
      contractAddress,
      signers.alice,
    );
    expect(allianceValue).to.equal(1n);

    const encryptedCancel = await encryptAction(signers.alice, 3);
    await contract
      .connect(signers.alice)
      .submitAction(signers.bob.address, 3, encryptedCancel.handles[0], encryptedCancel.inputProof);

    expect(await contract.isAllied(signers.alice.address, signers.bob.address)).to.equal(false);
  });

  it("prevents allied players from attacking each other", async function () {
    await contract.connect(signers.alice).register("Alice");
    await contract.connect(signers.bob).register("Bob");

    const encryptedAlliance = await encryptAction(signers.alice, 1);
    await contract
      .connect(signers.alice)
      .submitAction(signers.bob.address, 1, encryptedAlliance.handles[0], encryptedAlliance.inputProof);

    const encryptedAttack = await encryptAction(signers.alice, 2);
    await expect(
      contract
        .connect(signers.alice)
        .submitAction(signers.bob.address, 2, encryptedAttack.handles[0], encryptedAttack.inputProof),
    ).to.be.revertedWithCustomError(contract, "AlliedPlayersCannotAttack");

    const encryptedCancel = await encryptAction(signers.alice, 3);
    await contract
      .connect(signers.alice)
      .submitAction(signers.bob.address, 3, encryptedCancel.handles[0], encryptedCancel.inputProof);

    const encryptedAttackAfterCancel = await encryptAction(signers.alice, 2);
    await expect(
      contract
        .connect(signers.alice)
        .submitAction(
          signers.bob.address,
          2,
          encryptedAttackAfterCancel.handles[0],
          encryptedAttackAfterCancel.inputProof,
        ),
    ).to.emit(contract, "AttackRecorded");
  });
});
