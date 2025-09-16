import pkg from 'hardhat';

const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying with account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  const FileStorage = await ethers.getContractFactory('FileIntegrity');
  const fileStorage = await FileStorage.deploy();

  await fileStorage.waitForDeployment();
  console.log('FileStorage deployed to:', await fileStorage.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
