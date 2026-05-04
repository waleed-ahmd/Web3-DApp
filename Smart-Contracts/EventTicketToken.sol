// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EventTicketToken is ERC20, Ownable, ReentrancyGuard {
    // ---------------------------
    // Custom errors
    // ---------------------------
    error ZeroAddressNotAllowed();
    error InvalidTicketPrice();
    error InvalidInitialSupply();
    error InvalidQuantity();
    error IncorrectEtherSent(uint256 expected, uint256 received);
    error NotEnoughVendorInventory(uint256 requested, uint256 available);
    error NoTicketToReturn(address account, uint256 requested, uint256 balance);
    error RefundReserveInsufficient(uint256 required, uint256 available);
    error InvalidWithdrawalAmount();
    error WithdrawalExceedsAvailable(uint256 requested, uint256 available);
    error EtherTransferFailed();
    error EtherRefundFailed();
    error DirectEtherNotAllowed();
    error VendorTransfersOnlyThroughPurchase();
    error ReturnsToVendorMustUseRefundFunction();

    // ---------------------------
    // Immutable configuration
    // ---------------------------
    address public immutable vendor;
    uint256 public immutable ticketPriceWei;

    // ---------------------------
    // Tracking state
    // ---------------------------
    uint256 public ticketsSold;
    uint256 public ticketsReturned;

    // Internal flags used to allow only approved vendor transfers
    bool private _purchaseTransferActive;
    bool private _refundTransferActive;

    // ---------------------------
    // Events
    // ---------------------------
    event TicketPurchased(
        address indexed buyer,
        uint256 quantity,
        uint256 totalPaid
    );

    event TicketReturned(
        address indexed holder,
        uint256 quantity,
        uint256 refundPaid
    );

    event EtherWithdrawn(
        address indexed to,
        uint256 amount
    );

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        address vendor_,
        uint256 ticketPriceWei_,
        uint256 initialSupply_
    )
        ERC20(name_, symbol_)
        Ownable(initialOwner_)
    {
        if (initialOwner_ == address(0) || vendor_ == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        if (ticketPriceWei_ == 0) {
            revert InvalidTicketPrice();
        }
        if (initialSupply_ == 0) {
            revert InvalidInitialSupply();
        }

        vendor = vendor_;
        ticketPriceWei = ticketPriceWei_;

        // Mint all tickets to the vendor inventory.
        _mint(vendor_, initialSupply_);
    }

    // Whole-number tickets only
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // ---------------------------
    // Purchase logic
    // ---------------------------

    function buyTicket() external payable {
        _buyTickets(1);
    }

    function buyTickets(uint256 quantity) external payable {
        _buyTickets(quantity);
    }

    function _buyTickets(uint256 quantity) internal {
        if (quantity == 0) {
            revert InvalidQuantity();
        }

        uint256 totalCost = ticketPriceWei * quantity;

        if (msg.value != totalCost) {
            revert IncorrectEtherSent(totalCost, msg.value);
        }

        uint256 available = balanceOf(vendor);
        if (available < quantity) {
            revert NotEnoughVendorInventory(quantity, available);
        }

        _purchaseTransferActive = true;
        _transfer(vendor, msg.sender, quantity);
        _purchaseTransferActive = false;

        ticketsSold += quantity;

        emit TicketPurchased(msg.sender, quantity, msg.value);
    }

    // ---------------------------
    // Return + refund logic
    // ---------------------------

    function returnTicket() external nonReentrant {
        _returnTickets(1);
    }

    function returnTickets(uint256 quantity) external nonReentrant {
        _returnTickets(quantity);
    }

    function _returnTickets(uint256 quantity) internal {
        if (quantity == 0) {
            revert InvalidQuantity();
        }

        uint256 holderBalance = balanceOf(msg.sender);
        if (holderBalance < quantity) {
            revert NoTicketToReturn(msg.sender, quantity, holderBalance);
        }

        uint256 refundAmount = ticketPriceWei * quantity;
        uint256 currentBalance = address(this).balance;

        if (currentBalance < refundAmount) {
            revert RefundReserveInsufficient(refundAmount, currentBalance);
        }

        // Effects before interaction
        _refundTransferActive = true;
        _transfer(msg.sender, vendor, quantity);
        _refundTransferActive = false;

        ticketsReturned += quantity;

        emit TicketReturned(msg.sender, quantity, refundAmount);

        // Interaction last
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) {
            revert EtherRefundFailed();
        }
    }

    // ---------------------------
    // Read helpers for frontend
    // ---------------------------

    function previewCost(uint256 quantity) external view returns (uint256) {
        if (quantity == 0) {
            revert InvalidQuantity();
        }
        return ticketPriceWei * quantity;
    }

    function remainingInventory() external view returns (uint256) {
        return balanceOf(vendor);
    }

    function hasTicket(address account) external view returns (bool) {
        if (account == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        return balanceOf(account) > 0;
    }

    function ticketsOutstanding() public view returns (uint256) {
        return totalSupply() - balanceOf(vendor);
    }

    function refundLiability() public view returns (uint256) {
        return ticketsOutstanding() * ticketPriceWei;
    }

    function withdrawableExcess() public view returns (uint256) {
        uint256 liability = refundLiability();
        uint256 currentBalance = address(this).balance;

        if (currentBalance <= liability) {
            return 0;
        }

        return currentBalance - liability;
    }

    function totalRevenueHeld() external view returns (uint256) {
        return address(this).balance;
    }

    // ---------------------------
    // Owner withdrawal logic
    // Only excess above refund reserve may be withdrawn
    // ---------------------------

    function withdrawEther(address payable to, uint256 amount)
        external
        onlyOwner
        nonReentrant
    {
        if (to == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        if (amount == 0) {
            revert InvalidWithdrawalAmount();
        }

        uint256 available = withdrawableExcess();
        if (amount > available) {
            revert WithdrawalExceedsAvailable(amount, available);
        }

        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert EtherTransferFailed();
        }

        emit EtherWithdrawn(to, amount);
    }

    function withdrawAllExcessEther(address payable to)
        external
        onlyOwner
        nonReentrant
    {
        if (to == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        uint256 amount = withdrawableExcess();
        if (amount == 0) {
            revert InvalidWithdrawalAmount();
        }

        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert EtherTransferFailed();
        }

        emit EtherWithdrawn(to, amount);
    }

    // ---------------------------
    // Transfer restrictions around vendor
    // ---------------------------
    // Rationale:
    // - vendor -> user transfers must happen through buyTickets()
    // - user -> vendor transfers must happen through returnTickets()
    // This protects the refund accounting model.

    function _update(address from, address to, uint256 value) internal override {
        // Allow minting and burning as normal
        if (from != address(0) && to != address(0)) {
            if (from == vendor && !_purchaseTransferActive) {
                revert VendorTransfersOnlyThroughPurchase();
            }

            if (to == vendor && !_refundTransferActive) {
                revert ReturnsToVendorMustUseRefundFunction();
            }
        }

        super._update(from, to, value);
    }

    // ---------------------------
    // Reject accidental plain ETH transfers
    // ---------------------------

    receive() external payable {
        revert DirectEtherNotAllowed();
    }

    fallback() external payable {
        revert DirectEtherNotAllowed();
    }
}
