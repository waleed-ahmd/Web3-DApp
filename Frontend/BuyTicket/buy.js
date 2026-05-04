const buyerKeystoreFile = document.getElementById("buyerKeystoreFile");
const buyerWalletPassword = document.getElementById("buyerWalletPassword");
const ticketQuantity = document.getElementById("ticketQuantity");

const previewCostBtn = document.getElementById("previewCostBtn");
const buyTicketsBtn = document.getElementById("buyTicketsBtn");

const buyProgressWrap = document.getElementById("buyProgressWrap");
const buyProgressBar = document.getElementById("buyProgressBar");
const buyProgressText = document.getElementById("buyProgressText");
const contractAddressBanner = document.getElementById("contractAddressBanner");
const STATUS = AppUtils.STATUS_TYPES;

const errorIds = [
  "buyerKeystoreFileError",
  "buyerWalletPasswordError",
  "ticketQuantityError"
];

function setContractBanner() {
  contractAddressBanner.textContent = window.APP_CONFIG?.CONTRACT_ADDRESS || "-";
}

function clearErrors() {
  errorIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "";
      el.style.display = "none";
    }
  });
}

function setFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.style.display = message ? "block" : "none";
  }
}

function validateBuyForm() {
  clearErrors();
  AppUtils.clearStatus("buyStatus");

  let valid = true;
  const file = buyerKeystoreFile.files[0];
  const password = buyerWalletPassword.value;
  const quantity = Number(ticketQuantity.value);

  if (!file) {
    setFieldError("buyerKeystoreFileError", "Please upload a buyer wallet keystore JSON file.");
    valid = false;
  } else {
    const maxSizeBytes = 1024 * 1024;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setFieldError("buyerKeystoreFileError", "The selected file must be a .json keystore file.");
      valid = false;
    } else if (file.size === 0) {
      setFieldError("buyerKeystoreFileError", "The selected keystore file is empty.");
      valid = false;
    } else if (file.size > maxSizeBytes) {
      setFieldError("buyerKeystoreFileError", "The selected keystore file is too large. Use a file under 1 MB.");
      valid = false;
    }
  }

  if (!password) {
    setFieldError("buyerWalletPasswordError", "Please enter the wallet password.");
    valid = false;
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    setFieldError("ticketQuantityError", "Ticket quantity must be a whole number greater than zero.");
    valid = false;
  }

  return valid;
}

async function readFileAsText(file) {
  return await file.text();
}

async function readKeystoreFileOrShowError() {
  const fileText = await readFileAsText(buyerKeystoreFile.files[0]);

  try {
    JSON.parse(fileText);
  } catch {
    setFieldError("buyerKeystoreFileError", "The selected keystore file is not valid JSON.");
    AppUtils.setStatus("buyStatus", "Please choose a valid encrypted JSON keystore file.", STATUS.ERROR);
    return null;
  }

  return fileText;
}

function resetBuyProgress() {
  buyProgressWrap.style.display = "none";
  buyProgressBar.value = 0;
  buyProgressText.textContent = "Decrypting wallet...";
}

async function refreshBuyerSnapshot(address) {
  const [ethBalance, tokenBalance, tokenSymbol, decimals, venue] = await Promise.all([
    ContractService.getEthBalance(address),
    ContractService.getTokenBalance(address),
    ContractService.getTokenSymbol(),
    ContractService.getTokenDecimals(),
    ContractService.getVenueOverview()
  ]);

  AppUtils.setText("buyerAddress", address);
  AppUtils.setText("buyerEthBalance", AppUtils.formatEth(ethBalance));
  AppUtils.setText("buyerTokenBalance", AppUtils.formatToken(tokenBalance, decimals, tokenSymbol));
  AppUtils.setText("ticketUnitPrice", AppUtils.formatEth(venue.ticketPriceWei));
}

async function previewCost() {
  if (previewCostBtn.disabled) return;
  previewCostBtn.disabled = true;

  if (!validateBuyForm()) {
    AppUtils.setStatus("buyStatus", "Please fix the validation errors before previewing the cost.", STATUS.ERROR);
    previewCostBtn.disabled = false;
    return;
  }

  AppUtils.setStatus("buyStatus", "Loading ticket price and wallet summary...", STATUS.INFO);

  try {
    const fileText = await readKeystoreFileOrShowError();
    if (!fileText) {
      resetBuyProgress();
      return;
    }

    const password = buyerWalletPassword.value;
    const quantity = Number(ticketQuantity.value);

    buyProgressWrap.style.display = "block";
    buyProgressBar.value = 0;
    buyProgressText.textContent = "Decrypting wallet...";

    const preview = await ContractService.previewBuyWithEncryptedJson(fileText, password, quantity, (progress) => {
      const percent = Math.round(progress * 100);
      buyProgressBar.value = percent;
      buyProgressText.textContent = "Decrypting wallet... " + percent + "%";
    });

    await refreshBuyerSnapshot(preview.signerAddress);
    AppUtils.setText("ticketTotalCost", AppUtils.formatEth(preview.totalCost));
    AppUtils.setText("buyTxLink", "-");

    AppUtils.setStatus(
      "buyStatus",
      `Preview loaded. Estimated gas is about ${AppUtils.formatEth(preview.estimatedGasCost)}.`,
      STATUS.SUCCESS
    );
  } catch (error) {
    console.error(error);
    resetBuyProgress();
    AppUtils.setStatus("buyStatus", `Failed to preview cost: ${error.message || "Unknown error."}`, STATUS.ERROR);
  } finally {
    previewCostBtn.disabled = false;
    buyProgressText.textContent = "Done";
  }
}

async function handleBuySubmit(event) {
  event.preventDefault();
  if (buyTicketsBtn.disabled) return;
  buyTicketsBtn.disabled = true;
  previewCostBtn.disabled = true;

  if (!validateBuyForm()) {
    AppUtils.setStatus("buyStatus", "Please fix the validation errors before buying tickets.", STATUS.ERROR);
    buyTicketsBtn.disabled = false;
    previewCostBtn.disabled = false;
    return;
  }

  buyProgressWrap.style.display = "block";
  buyProgressBar.value = 0;
  buyProgressText.textContent = "Preparing transaction...";
  AppUtils.setStatus("buyStatus", "Decrypting wallet and sending buy transaction...", STATUS.INFO);

  try {
    const fileText = await readKeystoreFileOrShowError();
    if (!fileText) {
      resetBuyProgress();
      return;
    }

    const password = buyerWalletPassword.value;
    const quantity = Number(ticketQuantity.value);

    const result = await ContractService.buyTicketsWithEncryptedJson(
      fileText,
      password,
      quantity,
      (progress) => {
        const percent = Math.round(progress * 100);
        buyProgressBar.value = percent;
        buyProgressText.textContent = "Decrypting wallet... " + percent + "%";
      }
    );

    await refreshBuyerSnapshot(result.signerAddress);
    AppUtils.setText("ticketTotalCost", AppUtils.formatEth(result.totalCost));

    const txUrl = AppUtils.txOrAddressLink(window.APP_CONFIG.EXPLORER_BASE_URL, "tx", result.txHash);
    AppUtils.setHtml(
      "buyTxLink",
      `<a href="${txUrl}" target="_blank" rel="noopener noreferrer">${result.txHash}</a>`
    );

    AppUtils.setStatus("buyStatus", "Ticket purchase confirmed successfully on Sepolia.", STATUS.SUCCESS);
    buyerWalletPassword.value = "";
  } catch (error) {
    console.error(error);
    resetBuyProgress();
    AppUtils.setStatus("buyStatus", `Ticket purchase failed: ${error.message || "Unknown error."}`, STATUS.ERROR);
  } finally {
    buyTicketsBtn.disabled = false;
    previewCostBtn.disabled = false;
    buyProgressText.textContent = "Done";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setContractBanner();
  previewCostBtn.addEventListener("click", previewCost);
  document.getElementById("buyForm").addEventListener("submit", handleBuySubmit);
});
