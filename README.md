# CipherDraw - Privacy-Preserving Decentralized Lottery

<div align="center">

**A fully on-chain lottery system powered by Fully Homomorphic Encryption (FHE)**

Built with [Zama's FHEVM](https://www.zama.ai/fhevm) • [Live Demo](#) • [Documentation](#documentation)

[![License](https://img.shields.io/badge/License-BSD_3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-green.svg)](https://soliditylang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why CipherDraw?](#why-cipherdraw)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Frontend Application](#frontend-application)
- [Testing](#testing)
- [Use Cases](#use-cases)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support & Community](#support--community)

---

## Overview

**CipherDraw** is a revolutionary decentralized lottery platform that leverages Fully Homomorphic Encryption (FHE) to ensure complete privacy for participants while maintaining the transparency and verifiability benefits of blockchain technology. Unlike traditional lotteries or existing on-chain implementations, CipherDraw allows players to choose their numbers privately without revealing them to anyone—not even the contract owner or other participants.

The platform combines the best of both worlds:
- **Privacy**: Your lottery numbers remain encrypted end-to-end using FHE
- **Transparency**: All lottery operations are verifiable on-chain
- **Fairness**: Provably fair random number generation
- **Decentralization**: No trusted third parties required

### What Makes CipherDraw Unique?

Traditional lotteries suffer from opacity and require trust in centralized operators. Existing blockchain lotteries expose participant choices, creating privacy concerns and potential manipulation vectors. CipherDraw solves these problems by performing computations directly on encrypted data, ensuring that:

1. **Your numbers stay secret** - Encrypted from submission to verification
2. **Winning is verifiable** - You can prove you won without revealing your numbers
3. **No front-running** - Others cannot see your picks to influence their choices
4. **Tamper-proof** - Fully auditable smart contract logic on-chain

---

## Key Features

### 🔐 Privacy-First Design
- **Fully Encrypted Tickets**: Player numbers are encrypted using FHE before submission and remain encrypted throughout the entire lottery lifecycle
- **Private Score Tracking**: Accumulated winnings and scores are stored as encrypted values, visible only to the account owner
- **Selective Decryption**: Only ticket owners can decrypt their own numbers and winning status

### 🎲 Provably Fair
- **On-Chain Randomness**: Winning numbers generated using cryptographically secure on-chain randomness
- **Transparent Logic**: All lottery mechanics implemented in auditable Solidity smart contracts
- **Immutable Rounds**: Once drawn, lottery rounds cannot be modified or tampered with

### 💎 User Experience
- **Modern Web3 Interface**: React-based frontend with RainbowKit wallet integration
- **Multi-Round Support**: Participate in unlimited lottery rounds with persistent score tracking
- **Instant Verification**: Check results immediately after the draw
- **Low Entry Cost**: Minimal ticket price (0.0001 ETH) for accessibility

### ⚡ Technical Excellence
- **Gas Optimized**: Efficient FHE operations minimize transaction costs
- **Multi-Network Support**: Deployable on local networks, Sepolia testnet, and Ethereum mainnet
- **Comprehensive Testing**: Full test coverage with both unit and integration tests
- **TypeScript Support**: End-to-end type safety from contracts to frontend

---

## Why CipherDraw?

### Problems We Solve

#### 1. **Lack of Privacy in Traditional On-Chain Lotteries**
**Problem**: Standard blockchain lotteries expose all participant choices publicly, creating privacy concerns and enabling strategic manipulation.

**Solution**: CipherDraw uses FHE to keep numbers encrypted while still allowing on-chain verification. You can participate without revealing your strategy.

#### 2. **Trust Requirements in Centralized Lotteries**
**Problem**: Traditional lotteries require blind trust in operators for fair draws, proper payouts, and honest record-keeping.

**Solution**: Smart contract logic is transparent and immutable. Randomness is cryptographically verifiable. No operator can manipulate results.

#### 3. **Front-Running and MEV Exploitation**
**Problem**: Visible transactions in blockchain lotteries enable front-running attacks where malicious actors can see and react to your choices.

**Solution**: Encrypted submissions prevent anyone from extracting actionable information from pending transactions.

#### 4. **Lack of Transparency in Prize Distribution**
**Problem**: Centralized lotteries often lack transparent accounting for ticket sales and prize pools.

**Solution**: All funds, ticket purchases, and prize distributions are publicly auditable on the blockchain.

#### 5. **Complex Verification Processes**
**Problem**: Verifying lottery fairness typically requires extensive auditing or trust in third-party validators.

**Solution**: Anyone can verify the lottery's fairness by examining the smart contract code and on-chain transaction history.

---

## Technology Stack

### Smart Contracts
- **Solidity ^0.8.24** - Smart contract programming language
- **FHEVM (@fhevm/solidity ^0.8.0)** - Fully Homomorphic Encryption Virtual Machine by Zama
- **Hardhat ^2.26.0** - Ethereum development environment
- **TypeChain ^8.3.2** - TypeScript bindings for smart contracts
- **Hardhat Deploy ^0.11.45** - Deployment management

### Frontend
- **React 19.1.1** - Modern UI framework
- **TypeScript ~5.8.3** - Type-safe JavaScript
- **Vite ^7.1.6** - Fast build tool and dev server
- **Wagmi ^2.17.0** - React Hooks for Ethereum
- **RainbowKit ^2.2.8** - Beautiful wallet connection UX
- **TanStack Query ^5.89.0** - Powerful data synchronization
- **Viem ^2.37.6** - Type-safe Ethereum library

### Development Tools
- **@fhevm/hardhat-plugin** - FHE testing and development utilities
- **Mocha & Chai** - Testing framework and assertion library
- **ESLint & Prettier** - Code quality and formatting
- **Solhint** - Solidity linter
- **Hardhat Gas Reporter** - Gas usage analysis

### Infrastructure
- **Zama FHEVM Network** - FHE-enabled blockchain
- **Infura** - Ethereum node provider
- **Etherscan** - Contract verification

---

## How It Works

### For Players

1. **Connect Wallet**
   - Use RainbowKit to connect your Web3 wallet (MetaMask, WalletConnect, etc.)

2. **Purchase Ticket**
   - Choose two numbers (1-10) for your lottery ticket
   - Numbers are encrypted locally in your browser using FHE
   - Submit encrypted ticket with 0.0001 ETH payment
   - Encrypted numbers are stored on-chain, invisible to everyone including the contract owner

3. **Wait for Draw**
   - The lottery owner initiates the draw when the round closes
   - Winning numbers are generated using cryptographically secure randomness
   - Winning numbers are also stored encrypted on-chain

4. **Claim Rewards**
   - After the draw, call `claimReward()` to check if you won
   - The smart contract compares your encrypted numbers with encrypted winning numbers using FHE operations
   - If both numbers match, you receive 10 reward points added to your encrypted score
   - Your score remains encrypted but you can decrypt it to view your total

5. **View Results** (Optional)
   - Request access to winning numbers for any round you participated in
   - Decrypt the numbers locally to verify your results
   - Your ticket numbers remain private unless you choose to share them

### For Contract Owners

1. **Deploy Contract**
   - Deploy the EncryptedLottery contract to your target network

2. **Monitor Participation**
   - Watch for ticket purchases via the frontend or blockchain explorer

3. **Draw Winning Numbers**
   - Call `drawWinningNumbers()` when ready to close a round
   - Random numbers are generated and encrypted automatically
   - Round closes and a new round begins immediately

4. **Manage Funds**
   - Withdraw collected ticket fees using the `withdraw()` function

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Version 7.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **MetaMask or compatible Web3 wallet**: For interacting with the dApp

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/CipherDraw.git
   cd CipherDraw
   ```

2. **Install smart contract dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Configuration

1. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   # Required for deployment to test/mainnet
   PRIVATE_KEY=your_wallet_private_key_here

   # Required for Sepolia deployment
   INFURA_API_KEY=your_infura_api_key_here

   # Optional: for contract verification
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

   **Security Note**: Never commit your `.env` file or share your private keys!

2. **Configure frontend contract address**

   After deployment, update the contract address in `frontend/src/config/contracts.ts`:

   ```typescript
   export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
   ```

### Deployment

#### Local Development Network

1. **Start a local FHEVM node**

   ```bash
   npx hardhat node
   ```

   Keep this terminal running.

2. **Deploy contracts** (in a new terminal)

   ```bash
   npm run deploy:localhost
   ```

3. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application**

   Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Sepolia Testnet

1. **Get Sepolia ETH**
   - Visit a [Sepolia faucet](https://sepoliafaucet.com/) to get test ETH

2. **Compile contracts**

   ```bash
   npm run compile
   ```

3. **Deploy to Sepolia**

   ```bash
   npm run deploy:sepolia
   ```

4. **Verify contract** (optional but recommended)

   ```bash
   npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
   ```

5. **Update frontend configuration**
   - Copy the deployed contract address
   - Update `frontend/src/config/contracts.ts`
   - Configure network in `frontend/src/config/wagmi.ts` if needed

6. **Build and deploy frontend**

   ```bash
   cd frontend
   npm run build
   ```

   Deploy the `frontend/dist` folder to your hosting service (Netlify, Vercel, etc.)

---

## Project Structure

```
CipherDraw/
├── contracts/                    # Smart contracts
│   └── EncryptedLottery.sol     # Main lottery contract with FHE
│
├── deploy/                       # Deployment scripts
│   └── deploy.ts                # Hardhat deploy configuration
│
├── tasks/                        # Custom Hardhat tasks
│   ├── accounts.ts              # Account management tasks
│   └── EncryptedLottery.ts      # Lottery-specific tasks
│
├── test/                         # Smart contract tests
│   └── EncryptedLottery.ts      # Comprehensive test suite
│
├── frontend/                     # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── LotteryApp.tsx  # Main application component
│   │   │   ├── Header.tsx      # Header with wallet connection
│   │   │   ├── TicketPurchase.tsx  # Ticket buying interface
│   │   │   ├── PlayerPanel.tsx  # Player stats and score
│   │   │   └── RoundsSection.tsx   # Historical rounds view
│   │   ├── config/              # Configuration files
│   │   │   ├── contracts.ts     # Contract ABI and address
│   │   │   └── wagmi.ts        # Web3 provider configuration
│   │   ├── styles/              # CSS styling
│   │   └── main.tsx            # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── hardhat.config.ts             # Hardhat configuration
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

---

## Smart Contract Architecture

### EncryptedLottery.sol

The core smart contract implements a privacy-preserving lottery system using FHEVM's encrypted data types.

#### Key Data Structures

```solidity
struct Ticket {
    euint8 firstNumber;      // Encrypted first number
    euint8 secondNumber;     // Encrypted second number
    bool exists;             // Ticket existence flag
    bool claimed;            // Reward claim status
}

struct RoundInfo {
    euint8 winningFirstNumber;   // Encrypted winning first number
    euint8 winningSecondNumber;  // Encrypted winning second number
    bool isDrawn;                // Draw completion flag
    uint256 drawBlock;           // Block number of draw
    uint256 drawTimestamp;       // Timestamp of draw
}
```

#### Core Functions

**For Players:**
- `buyTicket(externalEuint8 encryptedFirst, externalEuint8 encryptedSecond, bytes calldata inputProof)` - Purchase a ticket with encrypted numbers
- `claimReward(uint256 roundId)` - Claim rewards for a specific round
- `requestWinningNumberAccess(uint256 roundId)` - Get permission to decrypt winning numbers
- `refreshTicketAccess(uint256 roundId)` - Refresh decryption permissions for your ticket
- `getScore(address player)` - Get encrypted score for a player
- `getTicket(uint256 roundId, address player)` - Get ticket information for a round

**For Owner:**
- `drawWinningNumbers()` - Generate and set winning numbers for current round
- `setMockWinningNumbers(uint8 firstPlain, uint8 secondPlain)` - Set test winning numbers (local testing only)
- `withdraw(address payable recipient)` - Withdraw accumulated ticket fees

**View Functions:**
- `currentRoundId()` - Get current round number
- `getRoundInfo(uint256 roundId)` - Get information about a specific round
- `owner()` - Get contract owner address

#### Security Features

1. **Access Control**: Owner-only functions for drawing numbers and withdrawing funds
2. **Reentrancy Protection**: Proper state updates before external calls
3. **Input Validation**: Checks for valid payments, round states, and ticket existence
4. **Permission Management**: FHE permission system ensures only authorized addresses can decrypt data

#### FHE Operations

The contract uses several FHE operations:
- `FHE.asEuint8()` - Convert plaintext to encrypted uint8
- `FHE.fromExternal()` - Import encrypted data from user
- `FHE.eq()` - Encrypted equality comparison
- `FHE.and()` - Encrypted boolean AND
- `FHE.select()` - Encrypted conditional selection
- `FHE.add()` - Encrypted addition
- `FHE.allow()` / `FHE.allowThis()` - Permission management for decryption

---

## Frontend Application

### Architecture

The frontend is built with React 19 and follows modern Web3 best practices:

- **Component-Based**: Modular, reusable components
- **Type-Safe**: Full TypeScript coverage
- **Reactive**: Real-time updates using TanStack Query
- **Web3 Native**: Wagmi hooks for blockchain interactions
- **User-Friendly**: RainbowKit for seamless wallet connections

### Key Components

#### LotteryApp.tsx
The main application component that orchestrates:
- Round information loading
- Ticket status tracking
- Encrypted score management
- Owner permissions

#### TicketPurchase.tsx
Handles ticket purchasing flow:
- Number selection interface (1-10 for each number)
- Local encryption of chosen numbers
- Transaction submission with encrypted proof
- Purchase confirmation

#### PlayerPanel.tsx
Displays player information:
- Encrypted score display
- Score decryption functionality
- Player statistics

#### RoundsSection.tsx
Shows historical and current rounds:
- Round listing with draw status
- Ticket information per round
- Claim rewards interface
- Winning number reveal (for participants)

### Web3 Integration

The app uses Wagmi and Viem for type-safe Ethereum interactions:

```typescript
// Example: Reading encrypted score
const { data: scoreHandle } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'getScore',
  args: [userAddress],
});

// Decrypt locally using FHE SDK
const decryptedScore = await fhevm.decrypt(scoreHandle);
```

---

## Testing

### Running Tests

#### Unit Tests (Local)

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/EncryptedLottery.ts

# Run with gas reporting
REPORT_GAS=true npm run test
```

#### Integration Tests (Sepolia)

```bash
# Test on Sepolia testnet
npm run test:sepolia
```

### Test Coverage

The test suite covers:

✅ **Ticket Purchasing**
- Correct payment validation
- Duplicate ticket prevention
- Encrypted number storage
- Event emission

✅ **Drawing Mechanism**
- Random number generation
- Owner-only access
- Round state transitions
- Encrypted winning number storage

✅ **Reward Claims**
- Encrypted number comparison
- Score updates
- Double-claim prevention
- Permission management

✅ **Access Control**
- Owner functions restricted
- Player-specific data access
- Winning number reveal permissions

### Example Test

```typescript
it("awards points to winning tickets", async () => {
  const winningNumbers: [number, number] = [3, 7];

  // Purchase ticket with winning numbers
  const encryptedTicket = await encryptTicket(alice, winningNumbers);
  await lottery.connect(alice).buyTicket(
    encryptedTicket.handles[0],
    encryptedTicket.handles[1],
    encryptedTicket.inputProof,
    { value: ethers.parseEther("0.0001") }
  );

  // Owner draws winning numbers
  await lottery.connect(owner).setMockWinningNumbers(
    winningNumbers[0],
    winningNumbers[1]
  );

  // Alice claims reward
  await lottery.connect(alice).claimReward(0);

  // Verify score increased
  const encryptedScore = await lottery.getScore(alice.address);
  const clearScore = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    encryptedScore,
    lotteryAddress,
    alice
  );
  expect(clearScore).to.equal(10n); // REWARD_POINTS
});
```

---

## Use Cases

### 1. Privacy-Preserving Raffles
Organizations can run transparent raffles where participants maintain privacy in their entries while still ensuring fairness.

### 2. Gamified Loyalty Programs
Businesses can implement encrypted point-based reward systems where user balances remain private but verifiable.

### 3. Fair Distribution Mechanisms
DAOs and projects can use CipherDraw for fair, verifiable distribution of tokens or NFTs while maintaining participant privacy.

### 4. Educational Tool
Demonstrates practical implementation of FHE in smart contracts, serving as a learning resource for blockchain developers.

### 5. Research Platform
Provides a foundation for researchers exploring privacy-preserving computation in decentralized systems.

---

## Roadmap

### ✅ Phase 1: Core Implementation (Complete)
- [x] Basic lottery smart contract with FHE
- [x] Ticket purchasing and verification
- [x] Encrypted score tracking
- [x] Frontend with RainbowKit integration
- [x] Comprehensive testing suite
- [x] Sepolia deployment

### 🚧 Phase 2: Enhanced Features (In Progress)
- [ ] Multi-number ticket options (3, 4, 5 numbers)
- [ ] Configurable reward tiers (match 1, match 2, match all)
- [ ] Dynamic ticket pricing based on round
- [ ] Jackpot accumulation system
- [ ] Automated round scheduling

### 📋 Phase 3: Advanced Functionality (Planned)
- [ ] NFT ticket system with transferable encrypted tickets
- [ ] Multiple lottery pools with different parameters
- [ ] Referral and bonus systems with encrypted attribution
- [ ] DAO governance for parameter updates
- [ ] Oracle integration for external randomness sources
- [ ] Layer 2 deployment for lower fees

### 🔮 Phase 4: Ecosystem Growth (Future)
- [ ] Mobile app (React Native)
- [ ] Multi-chain deployment (Polygon, Arbitrum, etc.)
- [ ] Syndicate functionality (group ticket purchases)
- [ ] Subscription-based recurring entries
- [ ] Integration with other DeFi protocols
- [ ] Advanced analytics dashboard
- [ ] White-label solution for other projects

### 🔬 Research & Innovation
- [ ] Zero-knowledge proof integration for additional privacy
- [ ] Verifiable Delay Functions (VDF) for randomness
- [ ] Cross-chain lottery participation
- [ ] Privacy-preserving identity verification
- [ ] Machine learning for fraud detection

---

## Contributing

We welcome contributions from the community! CipherDraw is an open-source project and we encourage developers, designers, and blockchain enthusiasts to get involved.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any changed functionality
- Ensure all tests pass before submitting PR
- Use clear, descriptive commit messages

### Areas for Contribution

- **Smart Contract Security**: Audit and improve contract security
- **Gas Optimization**: Reduce transaction costs
- **Frontend UX**: Enhance user interface and experience
- **Documentation**: Improve guides and API documentation
- **Testing**: Expand test coverage
- **Localization**: Translate interface to other languages

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub with:
- Clear description of the problem/suggestion
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable
- Your environment details (browser, wallet, network)

---

## Security Considerations

### Smart Contract Security
- Contract audited by community (formal audit pending)
- Immutable after deployment - verify before using
- Test on Sepolia before mainnet deployment
- Owner has limited privileges (draw numbers, withdraw fees)

### Privacy Guarantees
- Ticket numbers remain encrypted on-chain
- Only ticket owner can decrypt their numbers
- Winning numbers encrypted until participant requests access
- Scores are encrypted per player

### Best Practices
- Never share your private keys
- Verify contract address before interacting
- Start with small amounts on testnet
- Review transaction details before confirming
- Keep your wallet software updated

### Known Limitations
- FHE operations are computationally intensive
- Decryption requires user's private key
- Access permissions expire and may need refreshing
- Network congestion can delay transactions

---

## Documentation

### Official Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm) - Learn about Fully Homomorphic Encryption
- [Zama Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup) - Development setup
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test) - Writing tests for FHE contracts

### Additional Learning
- [Solidity Documentation](https://docs.soliditylang.org/) - Smart contract language
- [Hardhat Documentation](https://hardhat.org/getting-started/) - Development environment
- [React Documentation](https://react.dev/) - Frontend framework
- [Wagmi Documentation](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit Documentation](https://www.rainbowkit.com/) - Wallet connection UI

---

## License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.

### What This Means
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No patent grant
- ⚠️ Limited liability and warranty

---

## Support & Community

### Get Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/CipherDraw/issues)
- **Discussions**: [Join community discussions](https://github.com/yourusername/CipherDraw/discussions)

### Connect with Zama
- **Website**: [zama.ai](https://www.zama.ai/)
- **Documentation**: [docs.zama.ai](https://docs.zama.ai/)
- **Discord**: [Join Zama Community](https://discord.gg/zama)
- **Twitter**: [@zama_fhe](https://twitter.com/zama_fhe)

### Stay Updated
- ⭐ Star this repository to show support
- 👀 Watch for updates and new releases
- 🍴 Fork to experiment with your own modifications

---

## Acknowledgments

- **Zama** - For creating FHEVM and enabling privacy-preserving smart contracts
- **Hardhat Team** - For the excellent development environment
- **Rainbow Team** - For beautiful wallet connection UX
- **Wagmi Team** - For type-safe Ethereum interactions
- **OpenZeppelin** - For smart contract security standards and best practices

---

## FAQ

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE allows computation on encrypted data without decrypting it first. This means the smart contract can compare your encrypted lottery numbers with encrypted winning numbers without ever revealing them.

**Q: How much does it cost to play?**
A: Currently 0.0001 ETH per ticket, plus gas fees for the transaction.

**Q: Can the contract owner see my numbers?**
A: No! Your numbers are encrypted before leaving your browser and remain encrypted on-chain. Even the owner cannot decrypt them.

**Q: How are winning numbers generated?**
A: Using cryptographically secure randomness derived from block data (blockhash, timestamp, round ID). This is verifiable on-chain.

**Q: What happens if I win?**
A: Call the `claimReward()` function after the draw. If your encrypted numbers match the encrypted winning numbers, you'll receive reward points added to your encrypted score.

**Q: Can I play on mainnet?**
A: The contract is currently deployed on Sepolia testnet. Mainnet deployment is planned after security audits are complete.

**Q: Is my data really private?**
A: Yes! All sensitive data (ticket numbers, scores) uses FHE. The blockchain only stores encrypted ciphertexts. Only you can decrypt your data using your wallet's private key.

**Q: What are the odds of winning?**
A: Currently 1/100 (choosing 2 numbers from 1-10). Future versions will offer different formats with varying odds.

---

<div align="center">

**Built with ❤️ using Zama FHEVM**

[⬆ Back to Top](#cipherdraw---privacy-preserving-decentralized-lottery)

</div>
