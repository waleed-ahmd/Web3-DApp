
const CONTRACTS = {
  sepolia: {
    eventTicketToken: "0x6327F2211AcEE5f77B5E6Fde511F6750B45bE7BF"
  }
};

const ACTIVE_NETWORK = "sepolia";
const ACTIVE_CONTRACT = "eventTicketToken";

window.APP_CONFIG = {
  NETWORK: {
    name: ACTIVE_NETWORK,
    chainId: 11155111
  },

  ACTIVE_CONTRACT,
  CONTRACTS,
  CONTRACT_ADDRESS: CONTRACTS[ACTIVE_NETWORK][ACTIVE_CONTRACT],
  RPC_URL: "https://eth-sepolia.g.alchemy.com/v2/ZCOv9sJwXMo4FXMUVPvgK",
  RPC_TIMEOUT_MS: 10000,
  EXPLORER_BASE_URL: "https://sepolia.etherscan.io",

  CONTRACT_ABI: [
    "function owner() view returns (address)",
    "function vendor() view returns (address)",
    "function ticketPriceWei() view returns (uint256)",
    "function remainingInventory() view returns (uint256)",
    "function ticketsSold() view returns (uint256)",
    "function ticketsReturned() view returns (uint256)",
    "function refundLiability() view returns (uint256)",
    "function ticketsOutstanding() view returns (uint256)",
    "function totalRevenueHeld() view returns (uint256)",
    "function hasTicket(address account) view returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function previewCost(uint256 quantity) view returns (uint256)",
    "function buyTicket() payable",
    "function buyTickets(uint256 quantity) payable",
    "function returnTicket()",
    "function returnTickets(uint256 quantity)",
    "error ZeroAddressNotAllowed()",
    "error InvalidTicketPrice()",
    "error InvalidInitialSupply()",
    "error InvalidQuantity()",
    "error IncorrectEtherSent(uint256 expected, uint256 received)",
    "error NotEnoughVendorInventory(uint256 requested, uint256 available)",
    "error NoTicketToReturn(address account, uint256 requested, uint256 balance)",
    "error RefundReserveInsufficient(uint256 required, uint256 available)",
    "error InvalidWithdrawalAmount()",
    "error WithdrawalExceedsAvailable(uint256 requested, uint256 available)",
    "error EtherTransferFailed()",
    "error EtherRefundFailed()",
    "error DirectEtherNotAllowed()",
    "error VendorTransfersOnlyThroughPurchase()",
    "error ReturnsToVendorMustUseRefundFunction()",
    "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
    "error ERC20InvalidSender(address sender)",
    "error ERC20InvalidReceiver(address receiver)",
    "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
    "error ERC20InvalidApprover(address approver)",
    "error ERC20InvalidSpender(address spender)",
    "error OwnableUnauthorizedAccount(address account)",
    "error OwnableInvalidOwner(address owner)",
    "error ReentrancyGuardReentrantCall()"
  ]
};
