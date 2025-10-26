import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedEncryptedLottery = await deploy("EncryptedLottery", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedLottery contract: `, deployedEncryptedLottery.address);
};
export default func;
func.id = "deploy_encryptedLottery";
func.tags = ["EncryptedLottery"];
