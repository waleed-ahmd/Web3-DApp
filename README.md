# Web3 Ticketing DApp

This project implements a simple blockchain ticketing system for the Ethereum Sepolia testnet. It includes a Solidity ERC-20 ticket contract and a browser-based frontend written with HTML, CSS, and JavaScript.

## Project Structure

- `Smart-Contracts/EventTicketToken.sol` - ERC-20 ticket contract with Sepolia ETH purchase and refund logic.
- `Frontend/index.html` - landing page linking to each DApp workflow.
- `Frontend/Wallet/wallet.html` - create, encrypt, download, and load wallets.
- `Frontend/CheckBalance/balance.html` - attendee, doorman, and venue balance views.
- `Frontend/BuyTicket/buy.html` - buy ticket tokens using an encrypted keystore wallet.
- `Frontend/ReturnTicket/return.html` - return ticket tokens to the vendor for a refund.
- `Frontend/shared/` - shared contract config, formatting helpers, contract service, and ticket-page styling.
- `Project-Design.md` - report-style project overview and rubric mapping.
- `AI-Log.md` - statement on use of generative AI and review trace.

## Running The Frontend With npm

The project frontend is a static HTML, CSS, and JavaScript app. It does not need a
build step, but it can be served locally with npm.

1. Open a terminal in the project root.
2. Install dependencies if needed:

   ```bash
   npm install
   ```

3. Start the local frontend server:

   ```bash
   npm start
   ```

   You can also use:

   ```bash
   npm run dev
   ```

4. Open the app in your browser:

   ```text
   http://127.0.0.1:3000
   ```

5. Navigate to the wallet, balance, buy, and return pages from the landing page.

The npm server serves the `Frontend` folder directly, so `Frontend/index.html`
is the homepage.

## Running The Frontend With VS Code Live Server

The project can also run with the VS Code Live Server extension.

1. Open this folder in Visual Studio Code.
2. Install the Live Server extension if it is not already installed.
3. Right-click `Frontend/index.html`.
4. Choose `Open with Live Server`.
5. Navigate to the wallet, balance, buy, and return pages from the landing page.

The frontend loads `ethers.js` from a CDN and connects to Sepolia using the RPC URL configured in `Frontend/shared/app-config.js`.

## Useful npm Commands

```bash
npm start
```

Serves the frontend locally at `http://127.0.0.1:3000`.

```bash
npm run dev
```

Runs the same local frontend server as `npm start`.

```bash
npm run check:js
```

Checks all frontend JavaScript files for syntax errors.

## Smart Contract

- Contract: `EventTicketToken`
- Network: Sepolia
- Configured address: `0x6327F2211AcEE5f77B5E6Fde511F6750B45bE7BF`
- Explorer link: `https://sepolia.etherscan.io/address/0x6327F2211AcEE5f77B5E6Fde511F6750B45bE7BF`

If you redeploy the contract after code changes, update `Frontend/shared/app-config.js` with the new Sepolia contract address before testing and submission.

The contract extends OpenZeppelin ERC-20, sets `decimals()` to `0` so tickets are whole-number tokens, and supports:

- buying tickets with Sepolia ETH
- returning tickets for a refund
- checking remaining inventory
- checking refund liability
- restricting direct vendor transfers so purchases and returns go through the intended flows

## Deployment And Transaction Evidence

Before final submission, add the exact Sepolia explorer links below:

- Successful contract deployment: `https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0`
- Successful ticket purchase transaction: `https://sepolia.etherscan.io/tx/0xa25baf62ffb985a8e53a61b7422d8dc03c6ce36e0884588bed3e31b5c1cfeb3c`
- Successful ticket return transaction: `https://sepolia.etherscan.io/tx/0x838c2f3f5bb6ec91184c7f36e8fdbfed6847f4e11b5547a497d40df5859d52c6`
- Contract creator wallet top-up: `https://sepolia.etherscan.io/tx/0x8541607d70b5fd384a61d2830a2cbfa915d051e4f4b952617b72ec7e061e9894`
- Ticket purchaser wallet top-up: `https://sepolia.etherscan.io/tx/0x71d00e95092a337adaa7908e920b2da2837e70aa790ece3d5db4b7b8b6da0765`
- Vendor / doorman wallet top-up: vendor ticket inventory was minted during deployment (`https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0`); doorman verification is read-only and does not require Sepolia ETH or gas.

## Basic Verification Checklist

- Create wallets for owner, vendor, buyer, and doorman/custom roles.
- Download the encrypted JSON keystore after wallet creation.
- Load a downloaded keystore with the correct password.
- Confirm wrong passwords and malformed JSON fail gracefully.
- Check attendee ETH and ticket balances.
- Use doorman view to verify a valid ticket holder.
- Load venue overview and confirm inventory, sold, returned, outstanding, and refund fields.
- Preview and buy a ticket with a funded buyer wallet.
- Return a ticket and verify the refund and token balance update.

## Notes

Do not submit private keys, wallet passwords, or mnemonic phrases in the report. Encrypted keystore files are safer than raw private keys, but they should still be treated as sensitive testing artefacts.
