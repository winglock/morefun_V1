import { ethers } from "ethers";

export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  getAdminAddress(): string {
    return this.signer.address;
  }

  async signMessage(message: string): Promise<string> {
    return await this.signer.signMessage(message);
  }

  async signData(data: any): Promise<string> {
    const messageHash = ethers.id(JSON.stringify(data));
    return await this.signer.signMessage(ethers.getBytes(messageHash));
  }
}
