# Generative AI Use And Review Trace

## 1. Statement On Use Of Generative AI

I used generative AI as a development assistant for planning, code review, debugging, and documentation support. The two AI sources used for this project were:

- ChatGPT: used for architecture discussion, smart contract design reasoning, frontend workflow planning, testing guidance, and advice on how to structure this AI log.
- Codex in VS Code: used for in-IDE file-level assistance, implementation refinement, error handling fixes, JavaScript checks, and documentation updates.

I did not treat AI output as automatically correct. Each suggestion was reviewed against the project requirements, tested manually where possible, and either accepted, modified, or rejected. Final responsibility for the submitted code, testing, and evidence remains mine.

## 2. AI Source Register

The interaction tables below summarize the prompts and AI responses so the log remains readable. The full ChatGPT prompt/response history can be checked through the shared conversation link below, and the detailed Codex prompts/responses are evidenced through the referenced VS Code Codex thread screenshots.

| Source | Tool | How It Was Captured | Notes |
| --- | --- | --- | --- |
| S1 | ChatGPT | Shared conversation link: `https://chatgpt.com/share/6a072088-af44-83eb-ae21-ce2db5fafbb3` | Used as the source record for architecture, implementation guidance, testing advice, and AI log structure. Do not submit the full chat if it contains secrets. |
| S2 | Codex in VS Code | Reopened Codex thread plus local Git diff/history | Used as evidence for file-level implementation and debugging. Includes current thread and older Codex threads from May 4 and May 7 covering RPC decision, merge conflict resolution, Copilot PR review handling, rubric readiness review, npm serving, README updates, and site-wide UI consistency. |
| S3 | Git history | `git log --oneline` and file diffs | Used to connect AI-assisted decisions to actual project changes. |
| S4 | Manual/browser testing | Screenshots, console checks, Sepolia links, and `npm run check:js` | Used to verify whether AI suggestions worked in the real DApp. |

## 3. Rubric-Mapped Prompt Checklist

This section lists the main prompts I gave to AI tools, grouped against the managerial AI criteria. These are summarized prompts; the full ChatGPT prompt/response history is available through the shared link in the source register, and Codex prompt evidence is covered by the referenced VS Code thread records.

| Rubric Area | Prompt I Gave | Tool | Evidence / Result |
| --- | --- | --- | --- |
| AI review traceability | Asked Codex to review the whole project against the module rubric and identify remaining submission risks. | Codex | Contract bug found, docs improved, PR links and resolution commits recorded. |
| AI-assisted PR review | Asked Codex to review the buy/return PR feedback and decide which Copilot suggestions should actually be applied. | Codex | CSS duplication removed, JSON validation added, progress reset improved, unnecessary abstraction rejected. |
| Conflict resolution traceability | Asked Codex to resolve the `buy.js` merge conflict while keeping the newer validation and purchase flow. | Codex | Conflict resolved and checked with `node --check`. |
| Documentation standards | Asked Codex to update the README after adding npm run commands and local server support. | Codex | README now documents `npm install`, `npm start`, `npm run dev`, `npm run check:js`, and Live Server. |
| Wallet creation oversight | Asked whether the wallet page should be split into `wallet.html`, `wallet.css`, and `wallet.js`, and how wallet creation/download/display should work. | ChatGPT | Wallet page separated into HTML/CSS/JS with encrypted keystore download and hidden sensitive fields. |
| Wallet security validation | Asked for wallet load handling using encrypted JSON files and passwords. | ChatGPT / Codex | Load existing wallet flow added; wrong-password errors translated into user-friendly messages. |
| Balance check logic | Asked why the doorman check did not show valid tickets when using the owner address. | ChatGPT | Clarified that doorman verification checks ticket-token ownership, not owner role. |
| Buy ticket flow | Asked for frontend flows for buying tickets using encrypted wallet JSON files, quantity input, preview, and transaction submission. | ChatGPT / Codex | Buy page validates file/password/quantity, previews cost and gas, and submits Sepolia transaction. |
| Return ticket flow | Asked for transfer/return logic back to the vendor and how to preview refund details. | ChatGPT / Codex | Return page checks ticket balance, refund reserve, gas, and submits return transaction. |
| Smart contract architecture | Asked for an ERC-20 ticket contract extended to allow Sepolia ETH ticket purchase and refund returns. | ChatGPT | `EventTicketToken.sol` implements ERC-20, whole-number tickets, buy, return, refund, and vendor inventory. |
| Smart contract security | Asked Codex to deeply inspect the contract against the rubric. | Codex | Found and fixed nested `nonReentrant` single-ticket return bug. |
| Gas efficiency | Asked for efficient contract and transaction-flow choices. | ChatGPT / Codex | Custom Solidity errors, `decimals() = 0`, gas preview, gas-estimation fallback, and shared service logic used. |
| Project structure | Asked Codex whether the project could run with npm commands as well as Live Server. | Codex | Static server added in `scripts/serve-frontend.js`; npm scripts added. |
| Managerial communication | Asked Codex and ChatGPT how to structure evidence, transaction links, and AI-log traceability for the report. | ChatGPT / Codex | Deployment, buy, return, top-up, PR, and commit evidence recorded. |
| Error handling | Reported raw wallet-load and return-preview errors. | Codex | Friendly wallet password error and deeper contract revert decoding added. |
| Testing specification | Asked what C1-C4 tests meant for `remainingInventory`, `ticketsSold`, `ticketsReturned`, and `refundLiability`. | ChatGPT | Test expectations translated into report-ready contract-state evidence. |

## 4. AI Interaction Log

| ID | Stage | Tool | My Prompt / Request | AI Output Summary | My Evaluation | Action Taken | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Contract design | ChatGPT | Asked for a Solidity ERC-20 ticketing contract with ticket purchase and return/refund logic. | Suggested an ERC-20 based ticket contract with owner/vendor roles and ETH purchase flow. | Useful starting point, but the first design needed stronger refund accounting and protection around returns. | Modified the approach and implemented `EventTicketToken` with OpenZeppelin ERC-20, `Ownable`, `ReentrancyGuard`, whole-number tickets, buy, return, and refund logic. | `Smart-Contracts/EventTicketToken.sol`; deployment tx `https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0`. |
| A2 | Contract refinement | ChatGPT | Asked how to make the ticket return flow safer and clearer for a DApp frontend. | Suggested checking ticket balance, refund reserve, and custom revert reasons. | Accepted the core idea because return failures needed to be understandable and safe. | Added return checks, refund reserve logic, custom Solidity errors, and frontend decoding support. | `EventTicketToken.sol`; `Frontend/shared/ticket-contract-service.js`; return test screenshot. |
| A3 | Contract roles | ChatGPT | Asked how to separate owner, vendor, buyer, and doorman responsibilities. | Recommended keeping owner/admin actions separate from vendor ticket inventory and buyer wallet flows. | Modified to match the coursework scope and keep the DApp simple. | Contract uses owner and vendor addresses; frontend supports wallet roles and balance views for attendee, doorman, and venue. | `Frontend/Wallet/wallet.html`; `Frontend/CheckBalance/balance.html`; `Project-Design.md`. |
| A4 | Wallet page | ChatGPT | Asked whether the wallet page should be split into `wallet.html`, `wallet.css`, and `wallet.js`. | Recommended three separate files and explained that HTML should hold structure, CSS styling, and JS validation/wallet logic. | Accepted because this made the project cleaner, easier to debug, and easier to explain in the report. I did not copy the sample blindly; I extended it with the final project's load-wallet workflow and accessibility details. | Built wallet page with encrypted keystore generation, file download, load existing wallet, password validation, and hidden sensitive fields. | `Frontend/Wallet/wallet.html`; `Frontend/Wallet/wallet.js`; `Frontend/Wallet/wallet.css`; screenshot of wallet page. |
| A5 | Balance and doorman checks | ChatGPT | Asked why the doorman query did not show valid tickets when using the owner address. | Explained that the doorman check should query whether the supplied address currently owns ticket tokens, so an owner address only passes if that same owner wallet actually bought/holds tickets. | Accepted because it clarified the difference between owner/admin role and ticket-holder state. | Tested the doorman view with buyer/ticket-holder addresses rather than assuming the owner address should be valid. | `Frontend/CheckBalance/balance.html`; `Frontend/CheckBalance/balance.js`; doorman test screenshot. |
| A6 | Buy and return pages | ChatGPT | Asked for frontend flows for buying tickets and returning tickets using encrypted wallet JSON files. | Suggested upload keystore, enter password, choose quantity, preview cost/refund and gas, then submit transaction. | Accepted and refined after testing because preview steps reduce failed transactions. | Implemented buy and return pages with validation, previews, transaction submission, and Sepolia explorer links. | `Frontend/BuyTicket/buy.html`; `Frontend/ReturnTicket/return.html`; `Frontend/shared/ticket-contract-service.js`; buy/return tx links. |
| A7 | Shared frontend structure | ChatGPT / Codex | Asked how to avoid duplicated frontend contract and formatting code. | Suggested central shared config, utilities, contract service, and shared CSS for ticket pages. | Accepted because it reduced duplication and made contract updates safer. | Added `Frontend/shared/app-config.js`, `app-utils.js`, `ticket-contract-service.js`, and `ticket-page.css`. | `Frontend/shared/`; commits `3c620b1`, `125198b`, `8270fc4` where relevant. |
| A8 | RPC configuration decision | Codex | Asked Codex to remove the local config/RPC-key complexity and keep the hardcoded Sepolia RPC URL because changing it was too complicated for the module scope. | Reverted the local-config approach while keeping other quality improvements such as timeout handling, checksum validation, duplicate-click guards, and gas-estimation fallback. | Modified/accepted. I accepted the simpler RPC setup because the project is a static frontend assignment and adding secret-management architecture would have added unnecessary complexity. | Restored hardcoded RPC URL in `app-config.js` and kept the other safe frontend improvements. | Older Codex thread screenshot; `Frontend/shared/app-config.js`; `Frontend/shared/ticket-contract-service.js`; May 4 Codex notes. |
| A9 | Merge conflict resolution | Codex | Asked Codex to resolve conflicts in `Frontend/BuyTicket/buy.js`. | Resolved conflict markers, kept the newer version with `AppUtils.STATUS_TYPES`, duplicate-click guards, and the existing buy validation/purchase flow. | Accepted after verification because it preserved the intended buy-page behavior while resolving the Git conflict cleanly. | Marked `buy.js` resolved and verified it with JavaScript syntax checks. | Older Codex thread screenshot; `Frontend/BuyTicket/buy.js`; `node --check Frontend/BuyTicket/buy.js`. |
| A10 | Copilot PR review response | Codex | Asked Codex to review Copilot comments on PR `Ticket-4-Return-&-Buy-page` and apply necessary changes. | Confirmed `STATUS_TYPES` was safe, consolidated duplicate buy/return CSS, added JSON parse validation before decrypting keystores, and reset progress UI on failed/invalid reads. | Accepted because these changes directly addressed real review feedback and improved maintainability and UX. Rejected the larger `FormHandler` abstraction because it was unnecessary for two pages. | Replaced duplicated CSS with shared `ticket-page.css`, updated buy/return HTML, improved invalid JSON handling, and kept duplicate-click guards. | Commits `8270fc4`, `125198b`, PR #4 `f524edc`; `Frontend/shared/ticket-page.css`; `Frontend/BuyTicket/buy.js`; `Frontend/ReturnTicket/return.js`. |
| A11 | Rubric readiness review | Codex | Asked Codex to deeply review the project against the module requirements and grading rubric. | Found a real smart contract bug: `returnTicket()` and `returnTickets()` both used `nonReentrant`, causing the single-ticket return path to revert. Also recommended README, project design, AI log, landing page, dependency, and submission-evidence improvements. | Accepted because this was a high-impact correctness and rubric-readiness review. Required redeployment after the contract fix was noted as a remaining task. | Fixed the return-ticket internal logic, added/updated documentation, added npm/OpenZeppelin dependency, added landing page, and verified JS/Solidity checks. | Older Codex thread record; `Smart-Contracts/EventTicketToken.sol`; `README.md`; `Project-Design.md`; `AI-Log.md`; `package.json`; deployment tx recorded in this file. |
| A12 | Run instructions and npm server | Codex | Asked how to run the project and whether it could be run with npm instead of only VS Code Live Server. | Explained Live Server usage first, then added `npm start`/`npm run dev` scripts and a small static server that serves the `Frontend` folder at `http://127.0.0.1:3000`. | Accepted because npm commands made the project easier for markers to run consistently while keeping the frontend static. | Added `scripts/serve-frontend.js`, updated `package.json`, checked JavaScript, and confirmed the server responded locally. | May 7 Codex thread screenshot; `package.json`; `scripts/serve-frontend.js`; `README.md`. |
| A13 | README run documentation | Codex | Asked Codex to update the README to reflect the new npm workflow. | Added `npm install`, `npm start`, `npm run dev`, `npm run check:js`, the local URL, and kept Live Server as an alternative. | Accepted because the submission requirements ask for clear instructions to run the project. | Updated `README.md` with npm and Live Server instructions. | May 7 Codex thread screenshot; `README.md`; local server screenshot if available. |
| A14 | Landing page design | Codex | Asked for a nicer top-level page with header and footer like a normal website. | Added a sticky header, brand navigation, hero section, workflow cards, overview panel, footer, and improved shared styling. | Accepted because it improved first impression and made the DApp workflows easier to navigate. | Updated landing page and shared styling while verifying JavaScript and local server response. | May 7 Codex thread screenshot; `Frontend/index.html`; `Frontend/shared/ticket-page.css`. |
| A15 | Site-wide visual consistency | Codex | Asked Codex to match the wallet, balance, buy, and return pages to the new landing-page theme. | Added consistent sticky headers, active nav states, matching footer, unified background/buttons/cards, and style updates across pages. | Accepted because a consistent UI helps the project look like one coherent DApp rather than separate disconnected pages. | Updated wallet, balance, buy, and return pages plus shared CSS; verified JS and local page responses. | May 7 Codex thread screenshot; `Frontend/Wallet/wallet.html`; `Frontend/CheckBalance/balance.html`; `Frontend/BuyTicket/buy.html`; `Frontend/ReturnTicket/return.html`; CSS files. |
| A16 | Wallet load error | Codex | Reported that the wallet page showed a raw ethers error for an incorrect password. | Identified the catch block in `wallet.js` and suggested mapping library errors to friendly user messages. | Accepted because the raw `INVALID_ARGUMENT` message was not user-friendly. | Added `getWalletLoadErrorMessage()` and changed the load-wallet failure message to plain language. | `Frontend/Wallet/wallet.js`; commit `5c5a519`; screenshot before/after. |
| A17 | Return preview error | Codex | Reported `Failed to preview return: execution reverted (unknown custom error)`. | Found that revert data decoding was too shallow and the ABI missed OpenZeppelin ERC-20 custom errors. | Accepted and verified with JavaScript syntax checks. | Added deeper revert-data extraction, friendlier decoded messages, and ERC-20/custom error ABI entries. | `Frontend/shared/ticket-contract-service.js`; `Frontend/shared/app-config.js`; `npm run check:js`; screenshot before/after. |
| A18 | Testing and QA | ChatGPT / Codex | Asked what contract tests C1-C4 meant: `remainingInventory`, `ticketsSold`, `ticketsReturned`, and `refundLiability`. | Explained that these tests prove smart contract state changes after deployment, purchase, and return, and gave example actual-result wording. | Accepted because it helped translate contract behavior into clear test evidence for the report. | Used the guidance to plan Remix/Sepolia evidence for initial inventory, sold count, returned count, and refund liability calculations. | `Smart-Contracts/EventTicketToken.sol`; `README.md`; `Project-Design.md`; Remix and app screenshots included in project report appendix. |
| A19 | AI log quality | ChatGPT / Codex | Asked how to create the best AI log from ChatGPT and Codex history only. | Recommended 8-12 curated entries, accepted/modified/rejected examples, evidence, and validation/reflection sections. | Accepted and applied directly to this file. | Rewrote `AI-Log.md` into a structured log with source register, interaction table, oversight examples, validation, and evidence checklist. | `AI-Log.md`; Codex thread screenshots; shared ChatGPT link. |
| A20 | Gas efficiency and optimization | ChatGPT / Codex | Asked for the contract and frontend flows to be efficient enough for Sepolia use and clear enough to debug. | Recommended Solidity custom errors instead of long revert strings, whole-number ERC-20 ticket quantities, shared frontend services, transaction preview steps, gas estimates, and gas-estimation fallback handling. | Accepted with review. Custom errors and shared service logic were useful because they reduced contract bytecode/revert cost and avoided duplicated frontend RPC logic. I kept the implementation simple rather than adding larger abstractions that did not improve this small DApp. | Used custom Solidity errors, kept `decimals()` at `0`, centralized contract calls in `ticket-contract-service.js`, added buy/return gas previews, and kept fallback gas estimates for RPC estimation failures. | `Smart-Contracts/EventTicketToken.sol`; `Frontend/shared/ticket-contract-service.js`; `Project-Design.md`; buy/return preview screenshots. |

## 5. Captured ChatGPT Conversation Evidence

The ChatGPT shared conversation was summarized into project-relevant entries rather than pasted as a raw transcript. The most important captured prompt/response pairs were:

| Prompt Theme | My Request | ChatGPT Response Summary | How It Was Used |
| --- | --- | --- | --- |
| Wallet file structure | Asked whether the wallet page should use separate `wallet.html`, `wallet.css`, and `wallet.js` files. | Recommended the three-file structure and described each file's responsibility. | Used as evidence for separating structure, styling, and wallet-generation logic. |
| Wallet load workflow | Asked about creating or loading encrypted wallet JSON files. | Recommended adding a load-wallet flow to upload the encrypted JSON, enter the password, decrypt the wallet, and use it later for Sepolia transactions. | Implemented load existing wallet in the final wallet page rather than creating only a generator. |
| Doorman validation | Asked why querying with the owner address did not prove a valid ticket. | Explained that the doorman check should verify ticket ownership, not project role; the owner only passes if that address holds a ticket token. | Helped interpret balance/doorman tests correctly and avoid misleading evidence. |
| Contract test cases C1-C4 | Asked what the tests for `remainingInventory`, `ticketsSold`, `ticketsReturned`, and `refundLiability` wanted. | Explained each test, expected values, and how to write actual results using Remix/Sepolia evidence. | Used to plan contract-state evidence for the testing table. |
| Gas efficiency | Asked for efficient contract and transaction-flow choices. | Recommended custom Solidity errors, simple whole-number ticket logic, and gas preview/fallback handling. | Used to support the rubric's code-efficiency criterion without over-engineering the DApp. |
| AI log process | Asked how to create an A-grade AI log using only this ChatGPT chat and Codex VS Code threads. | Recommended a curated AI log with prompts, AI suggestions, evaluation, action taken, evidence, validation, and reflection. | Used directly to structure this `AI-Log.md`. |

## 6. Captured Codex Conversation Evidence

The Codex evidence comes from this current VS Code thread and an older May 4 Codex thread. The older thread covered several important review and implementation tasks:

| Prompt Theme | My Request | Codex Response Summary | How It Was Used |
| --- | --- | --- | --- |
| RPC scope decision | Asked to remove the more complicated local RPC configuration and keep the hardcoded RPC URL. | Restored the hardcoded Sepolia RPC URL while keeping timeout handling, checksum validation, duplicate-click guards, and gas-estimation fallback. | Demonstrated human scope control: I rejected an over-complicated architecture for a static frontend assignment. |
| Merge conflict | Asked Codex to resolve a conflict in `buy.js`. | Resolved the conflict, preserved the newer validation/purchase flow, and checked for remaining conflict markers. | Used to document PR-resolution trace and file-level review evidence. |
| Copilot PR review | Asked Codex to assess Copilot's review suggestions for the buy/return PR. | Applied necessary changes: shared CSS, JSON validation, progress reset, and verification checks; did not add an unnecessary `FormHandler` abstraction. | Shows AI-enhanced code review with accepted and rejected suggestions. |
| Rubric readiness | Asked Codex to inspect the whole project against the module specs and rubric. | Found a single-ticket return bug caused by nested `nonReentrant` usage and recommended documentation/evidence improvements. | Shows proactive QA and contract correctness review before final submission. |
| npm run workflow | Asked Codex whether the project could be run with npm commands. | Added `npm start`/`npm run dev`, a static Node server, and README instructions. | Helps meet the submission requirement for clear run instructions. |
| Site-wide theme | Asked Codex to make the landing page look more professional and then match all other pages to that theme. | Added consistent header, navigation, footer, cards, buttons, and shared styles across the DApp. | Improves frontend architecture, usability, and visual consistency. |
| User-facing errors | Reported raw wallet and return-page errors. | Added friendlier wallet-load errors and deeper contract revert decoding. | Shows iterative UX/error-handling improvement after testing. |
| Efficiency review | Asked Codex to keep useful improvements while avoiding unnecessary complexity. | Kept gas-estimation fallback and shared service logic, but rejected larger abstractions such as a generic `FormHandler`. | Shows optimization balanced against project scope. |

## 7. Accepted, Modified, And Rejected AI Examples

### Accepted Example

Codex identified a smart contract bug where `returnTicket()` and `returnTickets()` were both protected by `nonReentrant`, causing a single-ticket return path to revert when one function called the other. I accepted the fix because it directly affected the required ticket return functionality.

Evidence: `Smart-Contracts/EventTicketToken.sol`, older Codex thread record, and deployment transaction recorded in this file.

### Modified Example

ChatGPT suggested a wallet page flow for creating and loading encrypted JSON keystores. I kept the workflow but modified the implementation into separate `wallet.html`, `wallet.css`, and `wallet.js` files so it matched my project structure and was easier to maintain.

Evidence: `Frontend/Wallet/` files and wallet page screenshot.

### Rejected Example

Some AI/review suggestions would have made the project more complex than necessary, such as moving the RPC connection into a local config system or creating a larger reusable `FormHandler` abstraction. I rejected these because the assignment is a static HTML, CSS, and JavaScript DApp intended to run through Live Server or a simple local static server.

Evidence: `README.md` running instructions and the static frontend structure in `Frontend/`.

## 8. Validation And Quality Assurance

I used the following checks to review AI-assisted output:

- Solidity review: checked that `EventTicketToken.sol` uses OpenZeppelin ERC-20, whole-number tickets, custom errors, return/refund logic, and reentrancy protection.
- Efficiency review: checked that the contract uses custom errors rather than long revert strings, keeps ticket quantities whole-number with `decimals() = 0`, and avoids unnecessary contract/front-end abstractions.
- Frontend syntax check: ran `npm run check:js` after JavaScript changes.
- Conflict checks: confirmed no conflict markers remained after `buy.js` conflict resolution.
- Browser testing: opened wallet, balance, buy, and return pages through the local frontend server or Live Server.
- Wallet testing: generated encrypted JSON keystores, downloaded them, loaded them with the correct password, and checked wrong-password handling.
- File validation testing: checked missing file, non-JSON file, empty file, invalid JSON, and non-keystore JSON cases.
- Contract read testing: checked attendee balance, doorman ticket verification, and venue overview values.
- Doorman role testing: confirmed that the doorman view checks token ownership for the address being queried, not whether the address is labelled as owner/vendor/buyer.
- Transaction testing: previewed and submitted buy/return transactions on Sepolia, then checked token balances and refund values.
- Contract state testing: planned Remix/Sepolia checks for C1-C4: `remainingInventory()` equals initial supply, `ticketsSold()` increases after purchase, `ticketsReturned()` increases after return, and `refundLiability()` equals `ticketsOutstanding() * ticketPriceWei()`.
- Error testing: checked that common failures show readable messages, including incorrect password, insufficient tickets, insufficient ETH, invalid JSON, and contract reverts.
- Readiness review: used Codex to compare the project against the module rubric, then manually reviewed the remaining non-code risks such as redeployment, transaction links, PR traceability, and final commit evidence.

## 9. Evidence Register

Evidence is either recorded directly below, linked in the source register, or included in the project report appendix.

| Evidence Item | Status | Reference |
| --- | --- | --- |
| ChatGPT shared link | Added | `https://chatgpt.com/share/6a072088-af44-83eb-ae21-ce2db5fafbb3` |
| ChatGPT prompt/response detail | Added | Full detail available through the shared ChatGPT link above. |
| Older May 4 Codex thread | Covered | Referenced in Codex source record; covers RPC decision, `buy.js` conflict resolution, Copilot review handling, and rubric readiness review. |
| May 7 Codex run/UI thread | Covered | Referenced in Codex source record; covers npm server setup, README update, landing page redesign, and site-wide theme consistency. |
| Codex wallet error fix thread | Covered | Summarized in A16 with changed file and commit evidence. |
| Codex return error fix thread | Covered | Summarized in A17 with changed files and syntax-check evidence. |
| Contract deployment transaction | Done | `https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0` |
| Buy ticket transaction | Done | `https://sepolia.etherscan.io/tx/0xa25baf62ffb985a8e53a61b7422d8dc03c6ce36e0884588bed3e31b5c1cfeb3c` |
| Return ticket transaction | Done | `https://sepolia.etherscan.io/tx/0x838c2f3f5bb6ec91184c7f36e8fdbfed6847f4e11b5547a497d40df5859d52c6` |
| Browser screenshot of wallet generation/load | Covered | Included in project report appendix. |
| Browser screenshot of attendee/doorman/venue balance checks | Covered | Included in project report appendix. |
| Browser screenshot of successful buy and return pages | Covered | Included in project report appendix. |
| Remix screenshot for C1 initial inventory | Covered | Included in project report appendix. |
| Remix screenshot for C2 tickets sold | Covered | Included in project report appendix. |
| Remix screenshot for C3 tickets returned | Covered | Included in project report appendix. |
| Remix screenshot for C4 refund liability | Covered | Included in project report appendix. |
| JavaScript syntax check | Done | `npm run check:js` passed after Codex changes. |
| Git evidence | Added | PR #2 resolution `2a368faa85e8592a86e884d3774911c209327f75`; PR #3 resolution `9efff28eb86dfe05a3a0da675d4dcbbe4670155f`; PR #4 resolution `125198b4bbbb39a2916c238f36547f257343c5c4`; other relevant commits include `8270fc4`, `5c5a519`, `a8b5e33`, `a6f5332`, and `3c620b1`. |

## 10. Final Transaction Evidence Checklist

Final Sepolia evidence:

- Contract deployment transaction: `https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0`
- Buy ticket transaction: `https://sepolia.etherscan.io/tx/0xa25baf62ffb985a8e53a61b7422d8dc03c6ce36e0884588bed3e31b5c1cfeb3c`
- Return ticket transaction: `https://sepolia.etherscan.io/tx/0x838c2f3f5bb6ec91184c7f36e8fdbfed6847f4e11b5547a497d40df5859d52c6`
- Owner wallet top-up: `https://sepolia.etherscan.io/tx/0x8541607d70b5fd384a61d2830a2cbfa915d051e4f4b952617b72ec7e061e9894`
- Buyer wallet top-up: `https://sepolia.etherscan.io/tx/0x71d00e95092a337adaa7908e920b2da2837e70aa790ece3d5db4b7b8b6da0765`
- Vendor / doorman wallet top-up: vendor ticket inventory was minted during deployment (`https://sepolia.etherscan.io/tx/0x0f2a0349361cf9d618c982fe89dfa725a6d1a8be0133aba3a0af8d0a6e5a6ba0`); doorman verification is read-only and does not require Sepolia ETH or gas.

## 11. Commit / PR Trace Checklist

Review and commit trace:

- Pull request 1: `https://github.com/waleed-ahmd/Web3-DApp/pull/2`
- Pull request 1 resolution commit: `2a368faa85e8592a86e884d3774911c209327f75`
- Pull request 2: `https://github.com/waleed-ahmd/Web3-DApp/pull/3`
- Pull request 2 resolution commit: `9efff28eb86dfe05a3a0da675d4dcbbe4670155f`
- Pull request 3: `https://github.com/waleed-ahmd/Web3-DApp/pull/4`
- Pull request 3 resolution commit: `125198b4bbbb39a2916c238f36547f257343c5c4`
- AI review comments / summary: included in PR review evidence and Codex/Copilot review summaries above.
- Final submission commit hash: `5c5a519571ca0525e247718ce1a42db31fc458fc`

## 12. Reflection

Generative AI accelerated the project by helping me plan the contract structure, design the frontend workflows, debug user-facing errors, and improve documentation. However, the most important decisions still required human review. I had to decide which suggestions matched the coursework scope, test whether generated code actually worked in the browser, check Sepolia transaction behavior, and make sure errors were understandable for users. The project benefited most when AI output was treated as a draft or review partner rather than as final authority. Git history, browser testing, Sepolia evidence, and manual validation were used to confirm the final implementation.
