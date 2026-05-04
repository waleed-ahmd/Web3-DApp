# Generative AI Use And Review Trace

## Statement On Use Of Generative AI

Generative AI was used as a development assistant to review code, suggest improvements, and help implement selected changes. Human oversight was applied by checking each suggestion against the module requirements and accepting only changes that fit the project scope.

The final project decisions were kept intentionally simple: static frontend pages, a single Solidity contract, shared JavaScript services, and manual Sepolia testing through Live Server and Etherscan.

## AI-Assisted Review Summary

Key review areas covered:

- project folder structure and shared frontend configuration
- wallet creation and encrypted keystore handling
- buy ticket and return ticket transaction flows
- smart contract gas efficiency and error handling
- duplicate frontend CSS
- input validation and failed JSON handling
- duplicate-click/race-condition guards
- RPC timeout handling
- project documentation and rubric readiness

## Human Decisions Made

- Kept the project as a static frontend because the module expects HTML, CSS, JavaScript, and Live Server usage.
- Kept the RPC URL in `app-config.js` because moving it to a backend proxy would add architecture outside the current module scope.
- Consolidated duplicate buy/return styling into `Frontend/shared/ticket-page.css`.
- Kept `STATUS_TYPES` constants because they reduce typo risk and are already exported by `AppUtils`.
- Avoided creating a large reusable form abstraction because the buy and return pages are understandable as separate workflow files.
- Kept wallet private keys and mnemonic phrases hidden by default in the UI.

## Peer Review Reflection Draft

Replace this draft with the final 200-word peer review reflection after the peer review session.

During the peer review process, my colleague reviewed the wallet, balance, buy, return, and smart contract flows. The most useful findings were around user-facing validation and project structure. In particular, the review highlighted the need to centralise shared contract configuration, avoid duplicated CSS, handle malformed JSON keystore files before decryption, and make transaction errors clearer for the user. These comments helped me improve the frontend architecture and made the buy/return workflows easier to maintain.

I also reviewed my colleague's project and focused on whether their DApp met the required blockchain and frontend workflows. This helped me compare different design choices, especially around how wallet state, contract reads, and transaction feedback are handled. Seeing another implementation made it easier to identify areas where my own project needed stronger documentation and clearer testing evidence.

Overall, the peer review process was useful because it forced me to explain the project from a marker's point of view rather than only from a developer's point of view. It showed that working code is not enough; the project also needs traceability, clear instructions, transaction evidence, and a report that justifies the design decisions.

## Final Transaction Evidence Checklist

Add the final Sepolia links below before submission:

- Contract deployment transaction: `TODO`
- Buy ticket transaction: `TODO`
- Return ticket transaction: `TODO`
- Owner wallet top-up: `TODO`
- Buyer wallet top-up: `TODO`
- Vendor / doorman wallet top-up: `TODO`

## Commit / PR Trace Checklist

Add links or hashes before final submission:

- Pull request link: `TODO`
- AI review comments / summary link: `TODO`
- Resolution commit hash: `TODO`
- Final resubmission commit hash: `TODO`
