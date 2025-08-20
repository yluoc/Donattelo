# Donattelo NextJS - Scaffold-ETH 2 Project

A well-organized dApp built on Scaffold-ETH 2 with NextJS, RainbowKit, Wagmi, and TypeScript.

## Project Structure

```
donattelo-nextjs/
├── packages/                    # Monorepo packages
│   ├── foundry/                # Smart contract development
│   │   ├── contracts/          # Solidity contracts
│   │   ├── script/             # Deployment scripts
│   │   ├── test/               # Contract tests
│   │   └── scripts-js/         # JavaScript utilities
│   │
│   └── nextjs/                 # Frontend application
│       ├── app/                # Next.js App Router
│       │   ├── (features)/     # Feature-based routes
│       │   ├── api/            # API routes
│       │   └── globals/        # Global layouts & pages
│       │
│       ├── components/         # React components
│       │   ├── ui/             # Reusable UI components
│       │   ├── features/       # Feature-specific components
│       │   └── scaffold-eth/   # SE-2 specific components
│       │
│       ├── hooks/              # Custom React hooks
│       │   ├── features/       # Feature-specific hooks
│       │   └── scaffold-eth/   # SE-2 specific hooks
│       │
│       ├── lib/                # Core libraries & utilities
│       │   ├── api/            # API clients & services
│       │   ├── blockchain/     # Blockchain utilities
│       │   ├── config/         # Configuration
│       │   └── utils/          # General utilities
│       │
│       ├── services/           # Business logic services
│       │   ├── blockchain/     # Blockchain services
│       │   ├── chat/           # Chat functionality
│       │   └── store/          # State management
│       │
│       ├── types/              # TypeScript type definitions
│       │   ├── api/            # API types
│       │   ├── blockchain/     # Blockchain types
│       │   └── common/         # Common types
│       │
│       └── contracts/          # Contract ABIs & addresses
```

## Quick Start

### Prerequisites
- Node.js >= 20.18.3
- Yarn 3.2.3+
- Foundry (for smart contract development)
- Python 3.8+ (for Walrus integration)
- Python dependencies (see `packages/nextjs/python-backend-requirements.txt`)

### Development Setup

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Install Python dependencies:**
   ```bash
   cd packages/nextjs
   pip install -r python-backend-requirements.txt
   cd ../..
   ```

3. **Start local blockchain:**
   ```bash
   yarn chain
   ```

4. **Deploy contracts:**
   ```bash
   yarn deploy
   ```

5. **Start frontend:**
   ```bash
   yarn start
   ```

6. **Open in browser:**
   - Frontend: http://localhost:3000
   - Debug: http://localhost:3000/debug

## Testing

```bash
# Test smart contracts
yarn test

# Test frontend
yarn next:test
```

## Development Guidelines

### Smart Contract Development
- Write contracts in `packages/foundry/contracts/`
- Test contracts in `packages/foundry/test/`
- Deploy using scripts in `packages/foundry/script/`

### Frontend Development
- Use feature-based organization in `packages/nextjs/app/(features)/`
- Create reusable UI components in `packages/nextjs/components/ui/`
- Implement business logic in `packages/nextjs/services/`
- Use custom hooks in `packages/nextjs/hooks/features/`

### Code Organization Principles
1. **Feature-based**: Group related functionality together
2. **Separation of concerns**: Keep UI, business logic, and data separate
3. **Reusability**: Create generic components and utilities
4. **Type safety**: Use TypeScript for all new code
5. **Consistent naming**: Follow established naming conventions

## Key Features

- **NFT Minting**: Create and manage NFTs
- **Chat Integration**: AI-powered chat functionality
- **Blockchain Explorer**: View transactions and addresses
- **Contract Debugging**: Interactive contract testing interface
- **Multi-chain Support**: Deploy to various Ethereum networks
- **Walrus Integration**: Decentralized storage using Python local SDK
- **Python Backend**: Local Flask server for AI and storage services

## Configuration

- **Frontend**: `packages/nextjs/scaffold.config.ts`
- **Smart Contracts**: `packages/foundry/foundry.toml`
- **Environment**: Copy `.env.example` to `.env`
- **Python Backend**: Configure in `packages/nextjs/python-backend-requirements.txt`

## Deployment

```bash
# Deploy to Vercel
yarn vercel

# Deploy to IPFS
yarn ipfs
```

## Contributing

1. Follow the established code organization
2. Use feature-based development approach
3. Maintain type safety with TypeScript
4. Write tests for new functionality
5. Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENCE](LICENCE) file for details.