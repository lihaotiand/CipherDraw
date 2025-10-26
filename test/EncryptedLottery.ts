import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { EncryptedLottery, EncryptedLottery__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("EncryptedLottery", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let lottery: EncryptedLottery;
  let lotteryAddress: string;

  before(async () => {
    const signers = await ethers.getSigners();
    [deployer, alice] = signers;
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("EncryptedLottery tests require the mock FHEVM environment");
      this.skip();
    }

    const factory = (await ethers.getContractFactory("EncryptedLottery")) as EncryptedLottery__factory;
    lottery = (await factory.connect(deployer).deploy()) as EncryptedLottery;
    lotteryAddress = await lottery.getAddress();
  });

  async function encryptTicket(player: HardhatEthersSigner, values: [number, number]) {
    const input = fhevm.createEncryptedInput(lotteryAddress, player.address);
    input.add8(values[0]);
    input.add8(values[1]);
    return input.encrypt();
  }

  it("requires exact ticket price", async () => {
    const encrypted = await encryptTicket(alice, [1, 2]);

    await expect(
      lottery
        .connect(alice)
        .buyTicket(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof, { value: ethers.parseEther("0.001") }),
    ).to.be.revertedWithCustomError(lottery, "InvalidPayment");
  });

  it("prevents duplicate ticket purchases", async () => {
    const encryptedTicket = await encryptTicket(alice, [2, 5]);

    await lottery
      .connect(alice)
      .buyTicket(encryptedTicket.handles[0], encryptedTicket.handles[1], encryptedTicket.inputProof, {
        value: ethers.parseEther("0.0001"),
      });

    await expect(
      lottery
        .connect(alice)
        .buyTicket(encryptedTicket.handles[0], encryptedTicket.handles[1], encryptedTicket.inputProof, {
          value: ethers.parseEther("0.0001"),
        }),
    ).to.be.revertedWithCustomError(lottery, "TicketAlreadyPurchased");
  });

  it("awards points to winning tickets", async () => {
    const winningNumbers: [number, number] = [3, 7];

    const encryptedWinningTicket = await encryptTicket(alice, winningNumbers);
    await lottery
      .connect(alice)
      .buyTicket(encryptedWinningTicket.handles[0], encryptedWinningTicket.handles[1], encryptedWinningTicket.inputProof, {
        value: ethers.parseEther("0.0001"),
      });

    await expect(lottery.connect(deployer).setMockWinningNumbers(winningNumbers[0], winningNumbers[1])).to.emit(
      lottery,
      "RoundDrawn",
    );

    await expect(lottery.connect(alice).claimReward(0)).to.emit(lottery, "RewardClaimed");

    const encryptedScore = await lottery.getScore(alice.address);
    const clearScore = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedScore, lotteryAddress, alice);
    const rewardPoints = await lottery.REWARD_POINTS();
    expect(clearScore).to.equal(BigInt(rewardPoints));

    await expect(lottery.connect(alice).claimReward(0)).to.be.revertedWithCustomError(lottery, "RewardAlreadyClaimed");

    const roundInfo = await lottery.getRoundInfo(0);
    await lottery.connect(alice).requestWinningNumberAccess(0);

    const winningFirst = await fhevm.userDecryptEuint(FhevmType.euint8, roundInfo[0], lotteryAddress, alice);
    const winningSecond = await fhevm.userDecryptEuint(FhevmType.euint8, roundInfo[1], lotteryAddress, alice);
    expect(Number(winningFirst)).to.equal(winningNumbers[0]);
    expect(Number(winningSecond)).to.equal(winningNumbers[1]);
  });
});
