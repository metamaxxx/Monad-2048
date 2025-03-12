import { HardhatRuntimeEnvironment } from 'hardhat/types';
import '@nomicfoundation/hardhat-ethers';
import { ethers } from 'hardhat';

async function main() {
  try {
    console.log("Начинаем деплой контракта Game2048...");

    const [deployer] = await ethers.getSigners();
    console.log("Деплой с адреса:", deployer.address);

    const Game2048Factory = await ethers.getContractFactory("Game2048");
    console.log("Разворачиваем контракт...");
    
    const game = await Game2048Factory.deploy();
    await game.waitForDeployment();

    const address = await game.getAddress();
    console.log("Контракт Game2048 развернут по адресу:", address);
  } catch (error) {
    console.error("Ошибка при деплое:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 