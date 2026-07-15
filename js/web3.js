// js/web3.js
import { ethers } from 'https://esm.sh/ethers@6';

const CONTRACT_ADDRESS = '0x...'; // fill in after deploying via Remix
const ABI = [
  'function mint(bytes32 dataHash, string itemName, uint256 returnByTimestamp) returns (uint256)',
  'function verify(uint256 tokenId, bytes32 dataHash) view returns (bool)',
];

export async function connectWallet() {
  if (!window.ethereum) throw new Error('Install MetaMask to mint a Memento');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

export async function mintMemento(itemName, returnByDate) {
  const signer = await connectWallet();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(`${itemName}-${returnByDate}-${Date.now()}`));
  const returnByUnix = Math.floor(new Date(returnByDate).getTime() / 1000);
  const tx = await contract.mint(dataHash, itemName, returnByUnix);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, dataHash };
}