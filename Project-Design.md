# Project Design Report

## Overview

This project is a Web3 ticketing DApp for the Ethereum Sepolia testnet. The backend is a Solidity smart contract that extends the ERC-20 token standard so that each ticket is represented by a whole-number token. The frontend is a static HTML, CSS, and JavaScript application that uses `ethers.js` to create wallets, read contract state, and submit ticket purchase and return transactions.

The project is split into four user-facing workflows:

- Wallet management
- Balance and ticket verification
- Ticket purchase
- Ticket return/refund

## Smart Contract Design

The contract is `EventTicketToken` in `Smart-Contracts/EventTicketToken.sol`. It inherits from OpenZeppelin `ERC20`, `Ownable`, and `ReentrancyGuard`.

Important design choices:

- `decimals()` returns `0`, because ticket quantities must be whole numbers.
- The initial supply is minted to the vendor address, so the vendor starts with all available ticket inventory.
- `buyTickets()` requires the exact Sepolia ETH value for the requested quantity and transfers tokens from the vendor to the buyer.
- `returnTickets()` transfers tokens back to the vendor and refunds the buyer using Sepolia ETH held by the contract.
- Custom Solidity errors are used instead of long revert strings to improve gas efficiency and make frontend error decoding clearer.
- `nonReentrant` protects refund and withdrawal flows that send ETH.
- Direct ETH transfers are rejected by `receive()` and `fallback()` to avoid accidental contract funding outside the ticket purchase flow.
- Transfers involving the vendor are restricted so users cannot bypass the purchase/refund functions and break refund accounting.

## Frontend Design

The frontend is intentionally simple so it can run through VS Code Live Server without a build step.

### Wallet Page

`Frontend/Wallet/wallet.html` allows a user to:

- choose a wallet role
- enter a label
- create a random Ethereum wallet
- encrypt the wallet as a JSON keystore
- download the encrypted JSON file
- load an existing encrypted JSON file
- reveal sensitive values only when explicitly requested

Security and validation details:

- password strength is displayed before wallet generation
- wallet passwords are cleared after generation/load
- generated keystores trigger a browser navigation warning until downloaded
- invalid JSON and invalid Ethereum keystores are rejected
- sensitive values are hidden by default

### Balance Page

`Frontend/CheckBalance/balance.html` supports the three required actor views:

- Attendee: checks ETH balance, ticket token balance, and whether a ticket is owned.
- Doorman: verifies whether a wallet currently holds a valid ticket.
- Venue: checks owner/vendor details, vendor ETH balance, ticket price, inventory, sold/returned counts, outstanding tickets, refund liability, and ETH held by the contract.

Address validation uses `ethers.isAddress()` plus checksum validation for mixed-case addresses.

### Buy Ticket Page

`Frontend/BuyTicket/buy.html` allows a buyer to upload an encrypted wallet keystore, enter the password, choose a ticket quantity, preview total ticket cost and gas, and submit a purchase transaction.

The buy flow checks:

- file presence, extension, size, and JSON validity
- wallet password presence
- whole-number positive ticket quantity
- remaining contract inventory
- buyer ETH balance against ticket cost plus estimated gas
- decoded contract revert reasons where possible

### Return Ticket Page

`Frontend/ReturnTicket/return.html` allows a ticket holder to upload the keystore, enter the password, choose a return quantity, preview refund details, and submit the return transaction.

The return flow checks:

- file presence, extension, size, and JSON validity
- wallet password presence
- whole-number positive return quantity
- wallet ticket balance
- contract ETH refund reserve
- user ETH balance for gas

## Shared Frontend Architecture

Shared browser code lives in `Frontend/shared`:

- `app-config.js` stores Sepolia network, contract address, RPC URL, explorer URL, and ABI.
- `app-utils.js` centralizes formatting, status types, address validation, and DOM helper functions.
- `ticket-contract-service.js` centralizes provider creation, signer loading, contract reads/writes, revert decoding, timeout handling, gas preview, buy, and return calls.
- `ticket-page.css` is shared by the buy, return, and landing pages.

This structure avoids each page needing its own contract ABI or provider logic.

## Testing And QA Checklist

Manual testing should be completed before final submission:

- Generate wallets for owner, vendor, buyer, doorman, and custom roles.
- Download each encrypted JSON file.
- Load each encrypted JSON file with the correct password.
- Confirm a wrong password fails with a clear error.
- Confirm an invalid JSON file fails with a clear error.
- Confirm a valid JSON file that is not a keystore fails with a clear error.
- Check attendee balances before and after buying a ticket.
- Confirm doorman view changes from no ticket to valid ticket holder after purchase.
- Load venue overview and confirm inventory decreases after purchase.
- Buy one ticket and capture the Sepolia transaction hash.
- Return one ticket and confirm token balance, venue inventory, and refund values update.
- Capture Sepolia explorer links for deployment, purchase, return, and wallet top-ups.

## Rubric Mapping

- Wallet creation: implemented through wallet generation, encrypted JSON download, wallet display, load flow, hidden sensitive fields, and password validation.
- Balance check: implemented with distinct attendee, doorman, and venue views.
- Ticket purchase: implemented with preview, validation, gas estimate, transaction submission, and explorer link output.
- Ticket return: implemented with preview, validation, refund estimate, transaction submission, and explorer link output.
- Smart contract: implements ERC-20 with Sepolia ETH purchase/refund extension, custom errors, and reentrancy protection.
- Project structure: frontend pages are separated by workflow and shared code is centralized.
- AI management and QA: see `AI-Log.md`.

## Evidence To Add Before Submission

Add exact Sepolia links here before zipping the project:

- Deployment transaction: `TODO`
- Contract address: `0x6327F2211AcEE5f77B5E6Fde511F6750B45bE7BF` (`TODO: update if redeployed after the final contract fixes`)
- Buy ticket transaction: `TODO`
- Return ticket transaction: `TODO`
- Owner top-up transaction: `TODO`
- Buyer top-up transaction: `TODO`
- Vendor / doorman top-up transaction: `TODO`
