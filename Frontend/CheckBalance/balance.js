const attendeeAddressInput = document.getElementById("attendeeAddress");
const doormanAddressInput = document.getElementById("doormanAddress");

const checkAttendeeBtn = document.getElementById("checkAttendeeBtn");
const verifyDoormanBtn = document.getElementById("verifyDoormanBtn");
const loadVenueBtn = document.getElementById("loadVenueBtn");

const contractAddressBanner = document.getElementById("contractAddressBanner");
const STATUS = AppUtils.STATUS_TYPES;

function setContractBanner() {
  contractAddressBanner.textContent = window.APP_CONFIG?.CONTRACT_ADDRESS || "-";
}

function validateAddressInput(address, statusElementId) {
  AppUtils.clearStatus(statusElementId);

  if (!AppUtils.isNonEmptyString(address)) {
    AppUtils.setStatus(statusElementId, "Please enter a wallet address.", STATUS.ERROR);
    return false;
  }

  if (!AppUtils.validateEthereumAddress(address.trim())) {
    AppUtils.setStatus(statusElementId, "The entered value is not a valid Ethereum address.", STATUS.ERROR);
    return false;
  }

  return true;
}

async function checkAttendeeBalances() {
  if (checkAttendeeBtn.disabled) return;

  const address = attendeeAddressInput.value.trim();

  if (!validateAddressInput(address, "attendeeStatus")) {
    return;
  }

  checkAttendeeBtn.disabled = true;
  AppUtils.setStatus("attendeeStatus", "Reading attendee balances from Sepolia...", STATUS.INFO);

  try {
    const [ethBalance, tokenBalance, hasTicket, tokenSymbol, decimals] = await Promise.all([
      ContractService.getEthBalance(address),
      ContractService.getTokenBalance(address),
      ContractService.hasTicket(address),
      ContractService.getTokenSymbol(),
      ContractService.getTokenDecimals()
    ]);

    AppUtils.setText("attendeeEthBalance", AppUtils.formatEth(ethBalance));
    AppUtils.setText("attendeeTokenBalance", AppUtils.formatToken(tokenBalance, decimals, tokenSymbol));
    AppUtils.setText("attendeeTicketStatus", hasTicket ? "Valid ticket owned" : "No ticket owned");

    AppUtils.setStatus("attendeeStatus", "Attendee balances loaded successfully.", STATUS.SUCCESS);
  } catch (error) {
    console.error(error);
    AppUtils.setStatus(
      "attendeeStatus",
      `Failed to load attendee balances: ${error.message || "Unknown error."}`,
      STATUS.ERROR
    );
  } finally {
    checkAttendeeBtn.disabled = false;
  }
}

async function verifyDoormanView() {
  if (verifyDoormanBtn.disabled) return;

  const address = doormanAddressInput.value.trim();

  if (!validateAddressInput(address, "doormanStatus")) {
    return;
  }

  verifyDoormanBtn.disabled = true;
  AppUtils.setStatus("doormanStatus", "Verifying ticket holder status...", STATUS.INFO);

  try {
    const [tokenBalance, hasTicket, tokenSymbol, decimals] = await Promise.all([
      ContractService.getTokenBalance(address),
      ContractService.hasTicket(address),
      ContractService.getTokenSymbol(),
      ContractService.getTokenDecimals()
    ]);

    AppUtils.setText(
      "doormanVerificationResult",
      hasTicket ? "Valid ticket holder" : "No valid ticket found"
    );
    AppUtils.setText("doormanTokenBalance", AppUtils.formatToken(tokenBalance, decimals, tokenSymbol));

    AppUtils.setStatus("doormanStatus", "Verification completed successfully.", STATUS.SUCCESS);
  } catch (error) {
    console.error(error);
    AppUtils.setStatus(
      "doormanStatus",
      `Verification failed: ${error.message || "Unknown error."}`,
      STATUS.ERROR
    );
  } finally {
    verifyDoormanBtn.disabled = false;
  }
}

async function loadVenueOverview() {
  if (loadVenueBtn.disabled) return;

  loadVenueBtn.disabled = true;
  AppUtils.setStatus("venueStatus", "Loading venue overview from Sepolia...", STATUS.INFO);

  try {
    const venue = await ContractService.getVenueOverview();

    AppUtils.setText("venueOwner", venue.owner);
    AppUtils.setText("venueVendor", venue.vendor);
    AppUtils.setText("venueVendorEthBalance", AppUtils.formatEth(venue.vendorEthBalance));
    AppUtils.setText("venueTicketPrice", AppUtils.formatEth(venue.ticketPriceWei));
    AppUtils.setText("venueTokenSymbol", venue.tokenSymbol);
    AppUtils.setText("venueTotalSupply", AppUtils.formatToken(venue.totalSupply, venue.decimals, venue.tokenSymbol));
    AppUtils.setText("venueRemainingInventory", AppUtils.formatToken(venue.remainingInventory, venue.decimals, venue.tokenSymbol));
    AppUtils.setText("venueTicketsSold", String(venue.ticketsSold));
    AppUtils.setText("venueTicketsReturned", String(venue.ticketsReturned));
    AppUtils.setText("venueTicketsOutstanding", String(venue.ticketsOutstanding));
    AppUtils.setText("venueRefundLiability", AppUtils.formatEth(venue.refundLiability));
    AppUtils.setText("venueTotalRevenueHeld", AppUtils.formatEth(venue.totalRevenueHeld));

    AppUtils.setStatus("venueStatus", "Venue overview loaded successfully.", STATUS.SUCCESS);
  } catch (error) {
    console.error(error);
    AppUtils.setStatus(
      "venueStatus",
      `Failed to load venue overview: ${error.message || "Unknown error."}`,
      STATUS.ERROR
    );
  } finally {
    loadVenueBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setContractBanner();

  checkAttendeeBtn.addEventListener("click", checkAttendeeBalances);
  verifyDoormanBtn.addEventListener("click", verifyDoormanView);
  loadVenueBtn.addEventListener("click", loadVenueOverview);
});
