import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { deployments, ethers } from 'hardhat';
import {
  CharityOperator,
  CharityPool,
  CharityToken,
  Vault,
} from '../typechain-types';
import { getSigners } from '../utils/signers';

describe('CharityPool', () => {
  let MainVault: Vault;
  let FundationVault: Vault;
  let CharityPool: CharityPool;
  let CharityOperator: CharityOperator;
  let CharityToken: CharityToken;

  let deployer: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture(['all']);

    MainVault = await ethers.getContract('MainVault');
    FundationVault = await ethers.getContract('FundationVault');
    CharityPool = await ethers.getContract('CharityPool');
    CharityOperator = await ethers.getContract('CharityOperator');
    CharityToken = await ethers.getContract('CharityToken');

    ({ deployer, bob, alice } = await getSigners());

    await CharityOperator.connect(deployer).addCharityPool(CharityPool.address);

    await CharityToken.mint(bob.address, ethers.utils.parseEther('100'));
    await CharityToken.mint(alice.address, ethers.utils.parseEther('100'));
  });

  const amount = ethers.utils.parseEther('83');
  const amount80Percent = ethers.utils.parseEther('66.4');
  const amount20Percent = ethers.utils.parseEther('16.6');

  [
    {
      caseName: 'by user',
      before: async () =>
        CharityToken.connect(bob).send(CharityPool.address, amount, '0x00'),
    },
    {
      caseName: 'by application',
      before: async () =>
        CharityPool.connect(deployer).fund(bob.address, amount),
    },
  ].forEach(({ caseName, before }) => {
    it(`can send to charity pool ${caseName}`, async () => {
      await expect(before())
        .to.emit(CharityPool, 'Funded')
        .withArgs(bob.address, amount);
    });

    describe(`send to charity pool ${caseName}`, () => {
      beforeEach(async () => {
        await before();
      });

      it('sends correct amount to main vault', async () => {
        expect(await CharityToken.balanceOf(MainVault.address)).to.eq(
          amount80Percent
        );
      });

      it('sends correct amount to fundation vault', async () => {
        expect(await CharityToken.balanceOf(FundationVault.address)).to.eq(
          amount20Percent
        );
      });

      it('pool has no balance', async () => {
        expect(await CharityToken.balanceOf(CharityPool.address)).to.eq(0);
      });
    });
  });

  it('reverts direct call to tokensReceived', async () => {
    await expect(
      CharityPool.tokensReceived(
        bob.address,
        bob.address,
        CharityPool.address,
        amount,
        '0x',
        '0x'
      )
    ).to.be.rejectedWith('Invalid token');
  });

  it('reverts when charity collection has ended ');
});
