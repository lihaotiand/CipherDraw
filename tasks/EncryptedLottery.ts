import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

const TICKET_PRICE = "0.0001";

function validateTicketNumber(label: string, value: number) {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
  if (value < 1 || value > 10) {
    throw new Error(`${label} must be between 1 and 10`);
  }
}

task("task:address", "Prints the EncryptedLottery address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;
  const deploymentInfo = await deployments.get("EncryptedLottery");
  console.log(`EncryptedLottery address is ${deploymentInfo.address}`);
});

task("task:buy", "Buys a lottery ticket")
  .addParam("first", "First number between 1 and 10")
  .addParam("second", "Second number between 1 and 10")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const first = parseInt(taskArguments.first);
    const second = parseInt(taskArguments.second);

    validateTicketNumber("first", first);
    validateTicketNumber("second", second);

    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deploymentInfo.address, signer.address)
      .add8(first)
      .add8(second)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .buyTicket(encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.inputProof, {
        value: ethers.parseEther(TICKET_PRICE),
      });

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);
  });

task("task:draw", "Draws winning numbers")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    const tx = await contract.connect(signer).drawWinningNumbers();
    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);
  });

task("task:mock-draw", "Sets mock winning numbers (Hardhat network only)")
  .addParam("first", "First number between 1 and 10")
  .addParam("second", "Second number between 1 and 10")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const first = parseInt(taskArguments.first);
    const second = parseInt(taskArguments.second);
    validateTicketNumber("first", first);
    validateTicketNumber("second", second);

    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    const tx = await contract.connect(signer).setMockWinningNumbers(first, second);
    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);
  });

task("task:claim", "Claims rewards for a round")
  .addParam("round", "Round identifier")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const roundId = parseInt(taskArguments.round);
    if (!Number.isInteger(roundId) || roundId < 0) {
      throw new Error("round must be a non-negative integer");
    }

    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    const tx = await contract.connect(signer).claimReward(roundId);
    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);
  });

task("task:score", "Decrypts the caller score")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    const encryptedScore = await contract.getScore(signer.address);
    if (encryptedScore === ethers.ZeroHash) {
      console.log("Encrypted score: 0x00");
      console.log("Clear score    : 0");
      return;
    }

    const clearScore = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedScore, deploymentInfo.address, signer);
    console.log(`Encrypted score: ${encryptedScore}`);
    console.log(`Clear score    : ${clearScore}`);
  });

task("task:winnings", "Requests access and decrypts winning numbers")
  .addParam("round", "Round identifier")
  .addOptionalParam("address", "Optionally specify the EncryptedLottery contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const roundId = parseInt(taskArguments.round);
    if (!Number.isInteger(roundId) || roundId < 0) {
      throw new Error("round must be a non-negative integer");
    }

    const deploymentInfo = taskArguments.address ? { address: taskArguments.address } : await deployments.get("EncryptedLottery");
    console.log(`EncryptedLottery: ${deploymentInfo.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("EncryptedLottery", deploymentInfo.address);

    await contract.connect(signer).requestWinningNumberAccess(roundId);

    const roundInfo = await contract.getRoundInfo(roundId);
    const winningFirst = await fhevm.userDecryptEuint(FhevmType.euint8, roundInfo.winningFirstNumber, deploymentInfo.address, signer);
    const winningSecond = await fhevm.userDecryptEuint(FhevmType.euint8, roundInfo.winningSecondNumber, deploymentInfo.address, signer);

    console.log(`Winning numbers for round ${roundId}: ${winningFirst.toString()} and ${winningSecond.toString()}`);
  });
