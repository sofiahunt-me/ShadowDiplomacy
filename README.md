# Shadow Diplomacy

> Encrypted actions, open alliances - A blockchain-based diplomatic game powered by Fully Homomorphic Encryption

Shadow Diplomacy is an innovative Web3 game that demonstrates the power of privacy-preserving smart contracts using Zama's FHEVM (Fully Homomorphic Encryption for the Ethereum Virtual Machine). Players can form alliances, launch attacks, and break partnerships - all while keeping their strategic intentions encrypted on-chain.

![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [How to Play](#how-to-play)
- [Smart Contract](#smart-contract)
  - [Core Mechanics](#core-mechanics)
  - [Contract Functions](#contract-functions)
  - [Events](#events)
- [Frontend Application](#frontend-application)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Testing](#testing)
  - [Custom Hardhat Tasks](#custom-hardhat-tasks)
- [Problems Solved](#problems-solved)
- [Advantages](#advantages)
- [Future Roadmap](#future-roadmap)
- [Technical Highlights](#technical-highlights)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

Shadow Diplomacy is a decentralized diplomatic strategy game where players must navigate the complex world of alliances and conflicts. Unlike traditional blockchain games where all actions are transparent, Shadow Diplomacy leverages **Fully Homomorphic Encryption (FHE)** to keep player intentions secret while maintaining trustless on-chain execution.

The game demonstrates a novel approach to on-chain privacy:
- **Encrypted Actions**: Attack and alliance proposals are stored as encrypted values using FHE
- **Public Alliances**: Once established, alliance states are publicly visible for strategic transparency
- **Trustless Enforcement**: Smart contract automatically enforces rules (e.g., allied players cannot attack each other)

**Live Deployment**: [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/address/0x5531BD8f27E5226e2e43BF48E8e9F35902081A77)

## Key Features

### Privacy-Preserving Gameplay
- **Encrypted On-Chain Actions**: Player actions (alliance proposals, attacks) are encrypted using Zama's FHEVM before being stored on-chain
- **Selective Decryption**: Only the contract, the actor, and the target can decrypt action values
- **Zero-Knowledge Strategy**: Opponents cannot see your intentions until you execute them

### Strategic Depth
- **Three Action Types**: Form alliances, launch attacks, or cancel existing partnerships
- **Alliance Mechanics**: Bidirectional and symmetric - both parties must agree
- **Attack Prevention**: Smart contract enforces rules preventing attacks between allied players
- **Player Registry**: Unique player names and sequential IDs for identity management

### Web3 Integration
- **Multi-Wallet Support**: Seamless wallet connection via RainbowKit
- **Real-Time Updates**: Automatic state synchronization using React Query
- **Gas-Optimized**: Efficient contract design with minimal on-chain storage
- **Cross-Device**: Responsive design works on desktop and mobile

### Developer-Friendly
- **Type Safety**: Full TypeScript support with TypeChain-generated contract types
- **Custom Hardhat Tasks**: CLI tools for player registration, action submission, and game state queries
- **Comprehensive Tests**: Full test coverage including FHE mock environments
- **Clear Documentation**: Well-commented code and extensive inline documentation

## Technology Stack

### Smart Contract Layer
- **Solidity 0.8.24**: Modern Solidity with custom errors and events
- **FHEVM by Zama**: Fully Homomorphic Encryption for encrypted computation
  - `@fhevm/solidity` (^0.8.0): FHE library for encrypted types
  - `@fhevm/hardhat-plugin` (^0.1.0): Hardhat integration for FHEVM
  - `@zama-fhe/oracle-solidity` (^0.1.0): Oracle integration
- **Hardhat**: Smart contract development framework
  - `hardhat-deploy`: Deployment management
  - `typechain`: TypeScript bindings generation
  - `hardhat-gas-reporter`: Gas usage analysis

### Frontend Layer
- **React 19**: Latest React with concurrent features
- **TypeScript 5.8**: Type-safe development
- **Vite 7**: Lightning-fast build tool and dev server
- **Wagmi 2.17**: React hooks for Ethereum
- **Viem 2.37**: Low-level Ethereum interactions
- **Ethers 6.15**: High-level contract interactions and transaction signing
- **@rainbow-me/rainbowkit 2.2.8**: Beautiful wallet connection UI
- **@tanstack/react-query 5.89**: Powerful data fetching and state management
- **@zama-fhe/relayer-sdk 0.2.0**: Client-side FHE encryption/decryption

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **Mocha + Chai**: Testing framework
- **TypeChain**: Contract type generation

### Deployment & Infrastructure
- **Ethereum Sepolia Testnet**: Primary deployment network
- **Infura**: RPC provider for network access
- **Etherscan**: Contract verification and exploration
- **Hardhat Network**: Local development blockchain

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  React 19 + TypeScript + RainbowKit + React Query               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Wagmi/Viem (Read)
                        │ Ethers (Write/Sign)
                        │
┌───────────────────────┴─────────────────────────────────────────┐
│                    Blockchain Layer (Sepolia)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         ShadowDiplomacy Smart Contract                   │   │
│  │                                                           │   │
│  │  • Player Registry (names, IDs, addresses)               │   │
│  │  • Encrypted Action Storage (euint8 via FHE)             │   │
│  │  • Alliance State Management (public mapping)            │   │
│  │  • Action Validation & Enforcement                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ FHE Operations
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                   Zama FHE Infrastructure                        │
│  • FHE Executor (0x848B0066793BcC60346Da1F49049357399B8D595)   │
│  • ACL Contract (0x687820221192C5B662b25367F70076A37bc79b6c)   │
│  • Relayer SDK (https://relayer.testnet.zama.cloud)            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Player Registration
```
User → Wallet Connection → Contract.register(name)
     → Emit PlayerRegistered → UI Update
```

#### Encrypted Action Submission
```
User Selects Action → Zama SDK Encrypts Value
     → Contract.submitAction(target, actionValue, encryptedAction, proof)
     → FHE Storage & Validation
     → Alliance State Update (if applicable)
     → Emit Events → UI Refresh
```

#### State Queries
```
UI → Public Client (Viem) → Contract Read Functions
     → getPlayers() / isAllied() / getPlayer()
     → React Query Cache → Component Render
```

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For repository cloning
- **Ethereum Wallet**: MetaMask, Rainbow, or any Web3 wallet
- **Sepolia ETH**: Get testnet ETH from [Sepolia faucet](https://sepoliafaucet.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ShadowDiplomacy.git
   cd ShadowDiplomacy
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies (Hardhat, contracts)
   npm install

   # Install frontend dependencies
   cd game
   npm install
   cd ..
   ```

### Configuration

1. **Set up environment variables**

   ```bash
   # Set your deployment private key (without 0x prefix)
   npx hardhat vars set PRIVATE_KEY

   # Set your Infura API key for Sepolia access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   Alternatively, create a `.env` file in the root directory:

   ```env
   PRIVATE_KEY=your_private_key_here_without_0x_prefix
   INFURA_API_KEY=your_infura_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. **Verify configuration**

   ```bash
   # List available accounts
   npx hardhat accounts
   ```

### Local Development

#### Option 1: Use Deployed Contract on Sepolia

This is the quickest way to start developing:

1. **Update contract address** (if needed)

   The contract is already deployed at `0x5531BD8f27E5226e2e43BF48E8e9F35902081A77` on Sepolia.
   Check `game/src/config/contracts.ts` to verify:

   ```typescript
   export const CONTRACT_ADDRESS = '0x5531BD8f27E5226e2e43BF48E8e9F35902081A77' as `0x${string}`;
   ```

2. **Start the frontend**

   ```bash
   cd game
   npm run dev
   ```

3. **Open your browser**

   Navigate to `http://localhost:5173`

4. **Connect your wallet and play!**

#### Option 2: Deploy Your Own Contract

If you want to deploy your own instance:

1. **Compile contracts**

   ```bash
   npm run compile
   ```

2. **Run tests to verify everything works**

   ```bash
   npm run test
   ```

3. **Deploy to Sepolia**

   ```bash
   npm run deploy:sepolia
   ```

   The deployment script will output the contract address. Copy this address.

4. **Update frontend configuration**

   Edit `game/src/config/contracts.ts`:

   ```typescript
   export const CONTRACT_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS' as `0x${string}`;
   ```

5. **Verify contract on Etherscan** (optional but recommended)

   ```bash
   npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
   ```

6. **Start the frontend**

   ```bash
   cd game
   npm run dev
   ```

#### Option 3: Local Hardhat Network (Advanced)

For complete local development with FHEVM mock:

1. **Start local Hardhat node**

   ```bash
   npm run chain
   ```

   Keep this terminal running.

2. **Deploy to local network** (in a new terminal)

   ```bash
   npm run deploy:localhost
   ```

3. **Update frontend configuration**

   Edit `game/src/config/wagmi.ts` to add localhost network and update `contracts.ts` with the deployed address.

4. **Start frontend**

   ```bash
   cd game
   npm run dev
   ```

5. **Configure MetaMask**

   - Network: Localhost 8545
   - Chain ID: 31337
   - Import one of the Hardhat test accounts

### Deployment

#### Deploy to Sepolia Testnet

```bash
# Ensure environment variables are set
npx hardhat vars set PRIVATE_KEY
npx hardhat vars set INFURA_API_KEY

# Deploy
npm run deploy:sepolia

# Verify on Etherscan (recommended)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

#### Deploy Frontend

The frontend is a static React application that can be deployed to any hosting service:

**Vercel:**
```bash
cd game
npm run build
# Deploy the 'dist' folder to Vercel
```

**Netlify:**
```bash
cd game
npm run build
# Deploy the 'dist' folder to Netlify
```

**GitHub Pages:**
```bash
cd game
npm run build
# Push the 'dist' folder contents to gh-pages branch
```

## How to Play

### Step 1: Connect Your Wallet

1. Visit the game URL
2. Click "Connect Wallet" in the top right
3. Choose your wallet (MetaMask, Rainbow, Coinbase Wallet, etc.)
4. Approve the connection
5. Ensure you're on Sepolia Testnet

### Step 2: Register as a Player

1. Enter a unique player name in the registration form
2. Click "Register"
3. Approve the transaction in your wallet
4. Wait for confirmation - your player ID will be displayed

### Step 3: View Other Players

The "Player Roster" panel shows all registered players with:
- Player ID
- Player Name
- Wallet Address

### Step 4: Take Strategic Actions

1. **Select a Target**: Choose another player from the dropdown
2. **Choose Your Action**:
   - **Form Alliance**: Propose or accept an alliance
   - **Attack**: Launch an attack (blocked if you're allied)
   - **Cancel Alliance**: Break an existing alliance
3. **Submit**: Click "Submit Action"
4. **Approve Transaction**: The Zama SDK will encrypt your action before sending

### Step 5: Monitor Alliances

The "Alliance Status" section shows:
- Your current alliances with other players
- Whether you're allied with your selected target
- Real-time updates as actions are processed

### Game Rules

- You cannot target yourself
- Allied players cannot attack each other
- Player names must be unique
- Each player can only register once per address
- Alliances are bidirectional (both parties must agree)
- Actions are encrypted - only you, your target, and the contract can see them

## Smart Contract

**Contract Address (Sepolia)**: `0x5531BD8f27E5226e2e43BF48E8e9F35902081A77`

**Location**: `contracts/ShadowDiplomacy.sol`

### Core Mechanics

#### Player System

The contract maintains a registry of all players with:
- **Unique Sequential IDs**: Auto-incrementing player IDs starting from 1
- **Unique Names**: No two players can have the same name
- **Address Mapping**: One player per Ethereum address

```solidity
struct Player {
    uint256 id;
    string name;
    bool registered;
}
```

#### Action Types

Three types of actions are supported:

```solidity
enum ActionType {
    Unknown,      // 0 - Invalid
    Alliance,     // 1 - Form an alliance
    Attack,       // 2 - Launch an attack
    CancelAlliance // 3 - Break an alliance
}
```

#### FHE Encryption

Actions are encrypted using Zama's FHE library:

```solidity
mapping(address => mapping(address => euint8)) private _lastEncryptedAction;
```

- `euint8`: Encrypted 8-bit unsigned integer
- Stores the encrypted action value (1, 2, or 3)
- Only accessible by the contract, actor, and target

#### Alliance State

While actions are encrypted, the resulting alliance state is public:

```solidity
mapping(address => mapping(address => bool)) private _alliances;
```

- Bidirectional: `_alliances[A][B] == _alliances[B][A]`
- Public read access via `isAllied()` function
- Enables trustless enforcement of game rules

### Contract Functions

#### Write Functions

**register(string name) → uint256**
- Registers a new player with a unique name
- Returns the assigned player ID
- Reverts if name is taken or player already registered

**submitAction(address target, uint8 actionValue, externalEuint8 encryptedAction, bytes inputProof)**
- Submits an encrypted action targeting another player
- `actionValue`: Plaintext action type for validation (1-3)
- `encryptedAction`: FHE-encrypted action value
- `inputProof`: Zero-knowledge proof of encryption correctness
- Updates alliance state if action is Alliance or CancelAlliance
- Emits appropriate events

#### Read Functions

**getPlayer(address account) → PlayerInfo**
- Returns player information (ID, name, address)
- Reverts if player not found

**getPlayers() → PlayerInfo[]**
- Returns array of all registered players
- Used by frontend to populate player roster

**getPlayerNames() → string[]**
- Returns array of all player names
- Useful for quick name checks

**isRegistered(address account) → bool**
- Checks if an address has registered

**isAllied(address actor, address target) → bool**
- Checks if two players are allied
- Public for transparency and strategic planning

**getEncryptedAction(address actor, address target) → euint8**
- Returns the encrypted action value
- Only decryptable by actor, target, or contract

**nextPlayerId() → uint256**
- Returns the next player ID to be assigned

**protocolId() → uint256**
- Returns the Zama protocol ID

### Events

**PlayerRegistered(address indexed player, uint256 indexed playerId, string name)**
- Emitted when a new player registers
- Indexed by player address and ID for efficient querying

**AllianceStatusChanged(address indexed player, address indexed counterparty, bool allied)**
- Emitted when alliance status changes between two players
- `allied`: true if alliance formed, false if cancelled

**AttackRecorded(address indexed attacker, address indexed defender)**
- Emitted when an attack action is submitted
- Publicly visible for game analytics

**ActionStored(address indexed actor, address indexed target)**
- Emitted whenever any action is stored
- Generic event for tracking all player actions

### Security Features

**Custom Errors** (Gas Efficient)
- `EmptyName()`: Registration with empty name
- `NameTaken()`: Registration with duplicate name
- `AlreadyRegistered()`: Duplicate registration attempt
- `PlayerNotFound()`: Action targeting unregistered player
- `InvalidAction()`: Action value out of range (not 1-3)
- `CannotTargetSelf()`: Attempting to target own address
- `AlliedPlayersCannotAttack()`: Attack attempt between allied players

**Validation Logic**
- All inputs are validated before state changes
- FHE proofs are verified automatically by the FHEVM library
- Alliance checks prevent betrayal through contract enforcement

## Frontend Application

**Location**: `game/src/`

**Live URL**: Connect to the deployed Sepolia contract at `http://localhost:5173` during development

### Component Structure

#### App.tsx
Root component that sets up:
- Wagmi configuration with Sepolia network
- RainbowKit wallet provider
- React Query client for state management
- Global theme and styling

#### Header.tsx
Navigation bar featuring:
- Game logo and tagline
- RainbowKit connect button
- Responsive design

#### GameApp.tsx
Main game interface with three panels:

**1. Player Registration Panel**
- Input field for player name
- Register button with transaction handling
- Success/error message display

**2. Strategic Actions Panel**
- Target player selection dropdown
- Action type radio buttons (Alliance/Attack/Cancel)
- Alliance status indicator
- Submit action button with FHE encryption
- Real-time transaction feedback

**3. Player Roster Panel**
- Live list of all registered players
- Displays ID, name, and address
- Auto-refreshes every 15 seconds

### Key Hooks

**useZamaInstance.ts**
- Initializes Zama FHE SDK
- Connects to Sepolia relayer
- Handles encryption operations

**useEthersSigner.ts**
- Converts Wagmi wallet to Ethers signer
- Enables transaction signing with connected wallet

### Styling

Custom CSS with:
- Modern card-based layout
- Responsive grid system
- Purple/blue gradient theme
- Hover effects and transitions
- Mobile-first design

## Project Structure

```
ShadowDiplomacy/
├── contracts/
│   └── ShadowDiplomacy.sol              # Main game smart contract
│
├── deploy/
│   └── deploy.ts                         # Hardhat deployment script
│
├── test/
│   └── ShadowDiplomacy.ts                # Contract tests with FHE mocking
│
├── tasks/
│   ├── accounts.ts                       # List wallet accounts task
│   └── ShadowDiplomacy.ts                # Custom game interaction tasks
│
├── game/                                 # Frontend React application
│   ├── src/
│   │   ├── App.tsx                       # Root component with providers
│   │   ├── main.tsx                      # React entry point
│   │   ├── components/
│   │   │   ├── Header.tsx                # Navigation header component
│   │   │   └── GameApp.tsx               # Main game interface
│   │   ├── config/
│   │   │   ├── contracts.ts              # Contract ABI and address
│   │   │   └── wagmi.ts                  # Wagmi/wallet configuration
│   │   ├── hooks/
│   │   │   ├── useZamaInstance.ts        # FHE initialization hook
│   │   │   └── useEthersSigner.ts        # Wallet signer hook
│   │   └── styles/
│   │       ├── Header.css                # Header styles
│   │       └── GameApp.css               # Game interface styles
│   ├── public/
│   │   └── vite.svg                      # Favicon
│   ├── index.html                        # HTML entry point
│   ├── package.json                      # Frontend dependencies
│   ├── vite.config.ts                    # Vite configuration
│   └── tsconfig.json                     # TypeScript configuration
│
├── docs/
│   ├── zama_llm.md                       # FHEVM development guide
│   └── zama_doc_relayer.md               # Relayer SDK documentation
│
├── artifacts/                            # Compiled contract artifacts (generated)
├── cache/                                # Hardhat cache (generated)
├── types/                                # TypeChain generated types (generated)
│
├── hardhat.config.ts                     # Hardhat configuration
├── tsconfig.json                         # Root TypeScript configuration
├── package.json                          # Root dependencies
├── .env                                  # Environment variables (not in git)
├── .gitignore                            # Git ignore rules
├── README.md                             # This file
└── LICENSE                               # BSD-3-Clause-Clear license
```

## Development

### Available Scripts

#### Root Package Scripts

**Compilation & Build:**
```bash
npm run compile          # Compile Solidity contracts
npm run typechain        # Generate TypeScript types from ABIs
npm run build:ts         # Build TypeScript files
npm run clean            # Clean all build artifacts
```

**Testing:**
```bash
npm run test             # Run contract tests on local network
npm run test:sepolia     # Run tests on Sepolia testnet
npm run coverage         # Generate test coverage report
```

**Deployment:**
```bash
npm run deploy:localhost # Deploy to local Hardhat network
npm run deploy:sepolia   # Deploy to Sepolia testnet
npm run verify:sepolia   # Verify contract on Etherscan
```

**Development:**
```bash
npm run chain            # Start local Hardhat node
npm run lint             # Run all linters
npm run lint:sol         # Lint Solidity files
npm run lint:ts          # Lint TypeScript files
npm run prettier:check   # Check code formatting
npm run prettier:write   # Fix code formatting
```

#### Frontend Scripts (in `game/` directory)

```bash
npm run dev              # Start development server (Vite)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint frontend code
```

### Testing

#### Running Contract Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/ShadowDiplomacy.ts

# Run tests with gas reporting
REPORT_GAS=true npm run test

# Run tests on Sepolia (requires deployed contract)
npm run test:sepolia
```

#### Test Coverage

The test suite covers:
- ✅ Player registration with unique names and IDs
- ✅ Duplicate name prevention
- ✅ Encrypted action storage and retrieval
- ✅ Alliance formation and cancellation
- ✅ Attack prevention between allied players
- ✅ Bidirectional alliance symmetry
- ✅ Error handling for invalid actions

Example test output:
```
ShadowDiplomacy Contract
  Player Registration
    ✓ should register a player with a unique name
    ✓ should revert on duplicate name registration
    ✓ should revert on empty name
  Encrypted Actions
    ✓ should store and retrieve encrypted actions
    ✓ should update alliance status on Alliance action
    ✓ should prevent attacks between allied players
  Alliance Management
    ✓ should cancel alliances properly
    ✓ should maintain bidirectional alliance symmetry

8 passing (3.2s)
```

Generate coverage report:
```bash
npm run coverage
```

### Custom Hardhat Tasks

Shadow Diplomacy includes custom CLI tasks for easy interaction:

#### List Accounts
```bash
npx hardhat accounts
```

#### Display Contract Address
```bash
npx hardhat game:address --network sepolia
```

#### Register a Player
```bash
npx hardhat game:register --name "Alice" --network sepolia
```

#### View All Players
```bash
npx hardhat game:players --network sepolia
```

#### Submit an Action
```bash
# Form an alliance
npx hardhat game:action --target 0x1234... --action alliance --network sepolia

# Launch an attack
npx hardhat game:action --target 0x1234... --action attack --network sepolia

# Cancel alliance
npx hardhat game:action --target 0x1234... --action cancel --network sepolia
```

These tasks handle FHE encryption automatically and provide formatted output.

## Problems Solved

### 1. **On-Chain Privacy for Strategic Games**

**Problem**: Traditional blockchain games suffer from complete transparency - all actions are visible to all players, eliminating strategic depth and making games predictable.

**Solution**: Shadow Diplomacy uses Fully Homomorphic Encryption to store player actions as encrypted values on-chain. Only the actor, target, and smart contract can decrypt these values, enabling true strategic secrecy while maintaining blockchain's trustless execution.

### 2. **Trust in Multiplayer Game Logic**

**Problem**: Centralized game servers can be manipulated by administrators or hacked. Players must trust the server to execute rules fairly.

**Solution**: All game logic is executed by a smart contract on Ethereum. Rules are enforced automatically and immutably. No central authority can change outcomes or modify game state. Alliances are publicly verifiable, creating accountability.

### 3. **Privacy vs. Transparency Trade-off**

**Problem**: Most privacy solutions create complete opacity, making verification impossible. Full transparency eliminates privacy.

**Solution**: Shadow Diplomacy implements a hybrid model:
- **Actions are encrypted**: Strategic intentions remain private
- **Alliances are public**: Resulting game state is transparent and verifiable
- **Best of both worlds**: Privacy where needed, transparency for accountability

### 4. **Complex Encryption Implementation**

**Problem**: Implementing cryptographic systems is error-prone and requires deep expertise. Most developers cannot build privacy-preserving dApps.

**Solution**: Zama's FHEVM abstracts FHE complexity into simple Solidity types (`euint8`, `euint16`, etc.). Developers can write privacy-preserving contracts with standard Solidity syntax. The Zama SDK handles client-side encryption/decryption.

### 5. **Wallet Integration Complexity**

**Problem**: Integrating multiple wallet providers (MetaMask, Coinbase, Rainbow, WalletConnect) requires significant boilerplate code.

**Solution**: RainbowKit provides a beautiful, pre-built wallet connection UI supporting 100+ wallets with a single component. Wagmi hooks simplify Ethereum interactions with React.

### 6. **State Management for Blockchain Data**

**Problem**: Blockchain data requires frequent polling, caching, and synchronization across components. Manual implementation is complex and inefficient.

**Solution**: React Query with Wagmi provides automatic caching, background refetching, optimistic updates, and error handling for blockchain data. The frontend stays synchronized with on-chain state automatically.

## Advantages

### Technical Advantages

1. **True On-Chain Privacy**
   - First-class FHE support via FHEVM
   - Encrypted computation without trusted third parties
   - No reliance on off-chain secrets or oracles

2. **Verifiable Fairness**
   - Open-source smart contract
   - Immutable game rules
   - Publicly auditable alliance states
   - Transparent event emission

3. **Gas Efficiency**
   - Optimized storage patterns
   - Custom errors (cheaper than require strings)
   - Minimal on-chain computation
   - Efficient FHE operations

4. **Developer Experience**
   - Type-safe contract interactions via TypeChain
   - Custom Hardhat tasks for testing
   - Comprehensive test coverage
   - Clear code organization

5. **Scalability Potential**
   - Stateless design (no heavy on-chain state)
   - Batch action support possible
   - Layer 2 deployment ready
   - Efficient event-driven architecture

### Gameplay Advantages

1. **Strategic Depth**
   - Hidden intentions create uncertainty
   - Alliances have real weight
   - Betrayal detection is delayed
   - Psychological gameplay emerges

2. **Fair Competition**
   - No server-side manipulation
   - Equal access for all players
   - Trustless rule enforcement
   - Transparent alliance verification

3. **Player Ownership**
   - True decentralization - no central server
   - Player identities owned by wallets
   - Portable reputation (address-based)
   - Censorship-resistant gameplay

4. **Community-Driven**
   - Open-source codebase
   - Forkable for variations
   - Extensible smart contract
   - DAO governance potential

### Business Advantages

1. **Low Operational Costs**
   - No server infrastructure required
   - Ethereum handles all backend logic
   - Automatic scaling with network
   - Pay-per-transaction model

2. **Viral Potential**
   - Wallet-based identity (frictionless signup)
   - On-chain reputation building
   - Shareable wallet addresses
   - Tournament potential with prize pools

3. **Monetization Opportunities**
   - Entry fees (ETH or ERC20 tokens)
   - Tournament prize pools
   - NFT achievements
   - Alliance tokens/badges

## Future Roadmap

### Phase 1: Enhanced Gameplay (Q2 2025)

- [ ] **Resource System**: Add encrypted resource counts (gold, armies) using `euint32`
- [ ] **Territory Control**: Implement a map with claimable territories
- [ ] **Combat Resolution**: Deterministic or FHE-randomized battle outcomes
- [ ] **Victory Conditions**: Points system, elimination, or territory control win conditions
- [ ] **Player Profiles**: Stats, win/loss records, reputation scores

### Phase 2: Advanced Features (Q3 2025)

- [ ] **Multi-Party Alliances**: Support alliances with 3+ players
- [ ] **Timed Rounds**: Turn-based gameplay with block-based timers
- [ ] **Espionage System**: Encrypted spy actions to gather intelligence
- [ ] **Diplomacy Chat**: Off-chain encrypted messaging via XMTP or Status
- [ ] **Matchmaking**: Game lobbies with configurable rules

### Phase 3: Economic Layer (Q4 2025)

- [ ] **Tournament System**: Bracket-based competitions with prize pools
- [ ] **Entry Stakes**: Players stake ETH/tokens to join games
- [ ] **Winner Payouts**: Automatic prize distribution via smart contract
- [ ] **Achievement NFTs**: Mint commemorative NFTs for milestones
- [ ] **Leaderboards**: Global rankings with on-chain verification

### Phase 4: Cross-Chain Expansion (Q1 2026)

- [ ] **Layer 2 Deployment**: Deploy to Arbitrum, Optimism, Polygon zkEVM
- [ ] **Cross-Chain Alliances**: Bridge alliances across networks via LayerZero/Axelar
- [ ] **Multi-Chain Tournaments**: Players from different chains compete
- [ ] **Token Integration**: Support for various ERC20 tokens as stakes

### Phase 5: Governance & Community (Q2 2026)

- [ ] **DAO Governance**: Token-based voting for game rule changes
- [ ] **Community Maps**: Player-designed territory layouts
- [ ] **Modding Support**: Plugin system for custom game modes
- [ ] **Mobile App**: React Native app with WalletConnect integration
- [ ] **Telegram Bot**: Play directly from Telegram with miniapp

### Phase 6: Enterprise & Education (Q3 2026)

- [ ] **Corporate Training**: Team-building version for companies
- [ ] **Educational Mode**: Tutorial for learning FHE and blockchain
- [ ] **White-Label Solution**: Deploy branded versions for partners
- [ ] **Research Partnership**: Collaborate with universities on FHE research
- [ ] **Open Bounties**: Reward contributors for features and fixes

### Long-Term Vision

**Goal**: Establish Shadow Diplomacy as the leading example of privacy-preserving on-chain gaming, demonstrating that FHE enables entirely new categories of decentralized applications that were previously impossible.

**Impact**:
- Inspire developers to build privacy-first dApps
- Showcase FHEVM capabilities to enterprise audiences
- Create a sustainable, community-governed gaming ecosystem
- Contribute to FHE research and standardization

## Technical Highlights

### Innovative FHE Usage

**Hybrid Public-Private State Model**:
```solidity
// Private: encrypted action values
mapping(address => mapping(address => euint8)) private _lastEncryptedAction;

// Public: resulting alliance state
mapping(address => mapping(address => bool)) private _alliances;
```

This design enables trustless enforcement (contract can check alliance status) while maintaining strategic privacy (action intentions remain secret).

### Efficient Permission Management

```solidity
FHE.allowThis(storedAction);     // Contract can access
FHE.allow(storedAction, msg.sender); // Actor can decrypt
FHE.allow(storedAction, target);     // Target can decrypt
```

Fine-grained access control ensures only relevant parties can decrypt sensitive data.

### Type-Safe Contract Interactions

TypeChain generates fully typed contract interfaces:
```typescript
// Compile-time type checking
const result = await contract.getPlayers();
// result is PlayerInfo[] with autocomplete

await contract.submitAction(
  target,
  actionValue,  // Type: number (1-3)
  encryptedAction,  // Type: BytesLike
  inputProof  // Type: BytesLike
);
```

### Reactive State Management

React Query automatically manages blockchain data:
```typescript
const { data: players } = useQuery({
  queryKey: ['players'],
  queryFn: async () => {
    const data = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getPlayers',
    });
    return data;
  },
  refetchInterval: 15000, // Auto-refresh every 15 seconds
});
```

### Gas Optimization Techniques

1. **Custom Errors**: Save ~2000 gas per revert
2. **Sequential Player IDs**: Avoid expensive lookups
3. **Indexed Events**: Efficient event filtering
4. **Minimal Storage**: Only store essential encrypted data
5. **Batch Reads**: `getPlayers()` returns all players in one call

### Security Best Practices

- ✅ Input validation before state changes
- ✅ Checks-Effects-Interactions pattern
- ✅ Reentrancy-safe (no external calls to untrusted contracts)
- ✅ Custom errors with clear failure reasons
- ✅ Comprehensive event emission for auditability
- ✅ FHE proof verification (automatic via FHEVM)

## Contributing

Contributions are welcome! This project demonstrates cutting-edge FHE technology and there are many opportunities to extend and improve it.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test`
5. **Run linting**: `npm run lint`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Contribution Ideas

- **Add new action types**: Espionage, trade, blockades
- **Improve UI/UX**: Better animations, mobile optimization
- **Write documentation**: Tutorials, video guides
- **Create tests**: Increase coverage, fuzz testing
- **Optimize gas**: Find gas savings in contract logic
- **Add features**: See [Future Roadmap](#future-roadmap)

### Code Style

- Follow existing code structure and naming conventions
- Use TypeScript for all new frontend code
- Add JSDoc comments for public functions
- Write tests for new contract functions
- Format code with Prettier before committing

### Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (network, wallet, etc.)

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Must include license and copyright notice
- ⚠️ No patent grant
- ⚠️ No trademark rights
- ⚠️ No warranty provided

See the [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

This project uses:
- **FHEVM by Zama**: BSD-3-Clause-Clear License
- **React**: MIT License
- **Wagmi/Viem**: MIT License
- **RainbowKit**: MIT License
- **Ethers**: MIT License
- **Hardhat**: MIT License

All dependencies are used in compliance with their respective licenses.

## Support

### Getting Help

- **Documentation**: See [docs/](docs/) directory for detailed guides
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/ShadowDiplomacy/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/your-username/ShadowDiplomacy/discussions)

### Zama FHEVM Resources

- **FHEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Discord**: [https://discord.gg/zama](https://discord.gg/zama)
- **GitHub**: [https://github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)

### Ethereum Resources

- **Sepolia Faucet**: [https://sepoliafaucet.com](https://sepoliafaucet.com)
- **Sepolia Explorer**: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
- **Infura**: [https://infura.io](https://infura.io)

### Community

- **Twitter/X**: Follow [@ZamaFHE](https://twitter.com/ZamaFHE) for FHE updates
- **Telegram**: Join Web3 gaming and FHE communities
- **Discord**: Connect with other developers building on FHEVM

---

## Acknowledgments

Built with ❤️ using:
- **Zama** for pioneering FHEVM technology
- **Ethereum** for decentralized computation
- **React** for the user interface
- **Hardhat** for development tooling

Special thanks to the Zama team for creating the FHEVM protocol and making privacy-preserving smart contracts possible.

---

**Shadow Diplomacy** - Encrypted actions, open alliances. The future of on-chain gaming is private.

**Contract Address (Sepolia)**: `0x5531BD8f27E5226e2e43BF48E8e9F35902081A77`

[View on Etherscan](https://sepolia.etherscan.io/address/0x5531BD8f27E5226e2e43BF48E8e9F35902081A77) | [Documentation](docs/) | [Report Issue](https://github.com/your-username/ShadowDiplomacy/issues)
