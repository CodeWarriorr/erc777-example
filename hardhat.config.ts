import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.16',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    bob: {
      default: 1,
    },
    alice: {
      default: 2,
    },
    mat: {
      default: 3,
    },
  },
  mocha: {
    timeout: 0,
  },
};

export default config;
