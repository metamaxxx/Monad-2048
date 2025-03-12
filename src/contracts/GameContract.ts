import { ethers } from 'ethers';

const MONAD_CHAIN_ID = '0x279f'; // 10143 в hex
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

const GAME_CONTRACT_ABI = [
    "function submitMove(string memory direction) public",
    "function startNewGame() public",
    "function endGame(uint256 score) public",
    "function getHighScore(address player) public view returns (uint256)",
    "event MoveSubmitted(address player, string direction, uint256 score)",
    "event NewGame(address player)",
    "event GameOver(address player, uint256 score)"
];

const GAME_CONTRACT_ADDRESS = "0x7bacc0265cED7EE193F1A6C3862c04c7462e336D";

export class GameContract {
    private provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
    private signer: ethers.Signer | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    }

    async connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== MONAD_CHAIN_ID) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: MONAD_CHAIN_ID }],
                        });
                    } catch (switchError: any) {
                        if (switchError.code === 4902) {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: MONAD_CHAIN_ID,
                                    chainName: 'Monad Testnet',
                                    nativeCurrency: {
                                        name: 'Monad',
                                        symbol: 'tMONAD',
                                        decimals: 18
                                    },
                                    rpcUrls: [MONAD_RPC_URL],
                                    blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
                                }]
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }

                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();
                this.contract = new ethers.Contract(GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, this.signer);

                // Проверяем, что мы действительно подключены к правильной сети
                const network = await this.provider.getNetwork();
                if (network.chainId !== BigInt(10143)) {
                    throw new Error('Wrong network after connection');
                }

                return true;
            } catch (error) {
                console.error('Error connecting wallet:', error);
                return false;
            }
        }
        return false;
    }

    async getWalletAddress(): Promise<string> {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }
        return await this.signer.getAddress();
    }

    async sendMove(moveData: string) {
        if (!this.contract || !this.signer) {
            throw new Error('Contract or wallet not initialized');
        }

        try {
            // Проверяем сеть перед отправкой транзакции
            const network = await this.provider.getNetwork();
            if (network.chainId !== BigInt(10143)) {
                throw new Error('Wrong network');
            }

            const tx = await this.contract.submitMove(moveData);
            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.hash);
            return receipt?.hash || tx.hash;
        } catch (error) {
            console.error('Error sending move:', error);
            throw error;
        }
    }

    async startNewGame() {
        if (!this.contract || !this.signer) {
            throw new Error('Contract or wallet not initialized');
        }

        try {
            // Проверяем сеть перед отправкой транзакции
            const network = await this.provider.getNetwork();
            if (network.chainId !== BigInt(10143)) {
                throw new Error('Wrong network');
            }

            const tx = await this.contract.startNewGame();
            console.log('StartNewGame transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('StartNewGame transaction confirmed:', receipt.hash);
            return receipt?.hash || tx.hash;
        } catch (error) {
            console.error('Error starting new game:', error);
            throw error;
        }
    }

    async endGame(score: number) {
        if (!this.contract || !this.signer) {
            throw new Error('Contract or wallet not initialized');
        }

        try {
            // Проверяем сеть перед отправкой транзакции
            const network = await this.provider.getNetwork();
            if (network.chainId !== BigInt(10143)) {
                throw new Error('Wrong network');
            }

            const tx = await this.contract.endGame(score);
            console.log('EndGame transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('EndGame transaction confirmed:', receipt.hash);
            return receipt?.hash || tx.hash;
        } catch (error) {
            console.error('Error ending game:', error);
            throw error;
        }
    }

    getProvider() {
        return this.provider;
    }

    getContract() {
        return this.contract;
    }
}

// Добавляем определение для window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
} 