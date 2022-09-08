import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const WEEK_IN_SECS = 7 * 24 * 60 * 60;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const MainVault = await get('MainVault');
  const FundationVault = await get('FundationVault');
  const CharityOperator = await get('CharityOperator');
  const CharityToken = await get('CharityToken');

  await deploy('CharityPool', {
    from: deployer,
    contract: 'CharityPool',
    log: true,
    args: [
      CharityOperator.address,
      CharityToken.address,
      [
        {
          vault: MainVault.address,
          description: 'Main Charity Vault',
          percentage: 8_000,
        },
        {
          vault: FundationVault.address,
          description: 'Fundation Vault',
          percentage: 2_000,
        },
      ],
      (Date.now() / 1000 + WEEK_IN_SECS).toFixed(0),
    ],
    skipIfAlreadyDeployed: false,
  });
};

export default func;
func.tags = ['all', 'CP'];
func.dependencies = ['REG', 'MV', 'FV', 'CO', 'CT'];
