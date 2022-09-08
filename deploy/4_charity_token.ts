import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const CharityOperator = await get('CharityOperator');

  await deploy('CharityToken', {
    from: deployer,
    contract: 'CharityToken',
    log: true,
    args: ['CharityToken', 'ChT', [CharityOperator.address]],
    skipIfAlreadyDeployed: false,
  });
};

export default func;
func.tags = ['all', 'CT'];
func.dependencies = ['REG', 'MV', 'FV', 'CO'];
