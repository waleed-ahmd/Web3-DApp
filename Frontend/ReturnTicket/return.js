const returnKeystoreFile = document.getElementById("returnKeystoreFile");
const returnWalletPassword = document.getElementById("returnWalletPassword");
const returnQuantity = document.getElementById("returnQuantity");

const previewReturnBtn = document.getElementById("previewReturnBtn");
const returnTicketsBtn = document.getElementById("returnTicketsBtn");

const returnProgressWrap = document.getElementById("returnProgressWrap");
const returnProgressBar = document.getElementById("returnProgressBar");
const returnProgressText = document.getElementById("returnProgressText");
const contractAddressBanner = document.getElementById("contractAddressBanner");
const STATUS = AppUtils.STATUS_TYPES;

const returnErrorIds = [
  "returnKeystoreFileError",
  "returnWalletPasswordError",
  "returnQuantityError"
];

function setContractBanner() {
  contractAddressBanner.textContent = window.APP_CONFIG?.CONTRACT_ADDRESS || "-";
}

function clearErrors() {
  returnErrorIds.forEach((id) => {
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

function validateReturnForm() {
  clearErrors();
  AppUtils.clearStatus("returnStatus");

  let valid = true;
  const file = returnKeystoreFile.files[0];
  const password = returnWalletPassword.value;
  const quantity = Number(returnQuantity.value);

  if (!file) {
    setFieldError("returnKeystoreFileError", "Please upload a wallet keystore JSON file.");
    valid = false;
  } else {
    const maxSizeBytes = 1024 * 1024;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setFieldError("returnKeystoreFileError", "The selected file must be a .json keystore file.");
      valid = false;
    } else if (file.size === 0) {
      setFieldError("returnKeystoreFileError", "The selected keystore file is empty.");
      valid = false;
    } else if (file.size > maxSizeBytes) {
      setFieldError("returnKeystoreFileError", "The selected keystore file is too large. Use a file under 1 MB.");
      valid = false;
    }
  }

  if (!password) {
    setFieldError("returnWalletPasswordError", "Please enter the wallet password.");
    valid = false;
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    setFieldError("returnQuantityError", "Return quantity must be a whole number greater than zero.");
    valid = false;
  }

  return valid;
}

async function readFileAsText(file) {
  return await file.text();
}

async function refreshReturnSnapshot(address) {
  const [ethBalance, tokenBalance, tokenSymbol, decimals, venue] = await Promise.all([
    ContractService.getEthBalance(address),
    ContractService.getTokenBalance(address),
    ContractService.getTokenSymbol(),
    ContractService.getTokenDecimals(),
    ContractService.getVenueOverview()
  ]);

  AppUtils.setText("returnWalletAddress", address);
  AppUtils.setText("returnWalletEthBalance", AppUtils.formatEth(ethBalance));
  AppUtils.setText("returnWalletTokenBalance", AppUtils.formatToken(tokenBalance, decimals, tokenSymbol));
  AppUtils.setText("returnUnitRefund", AppUtils.formatEth(venue.ticketPriceWei));
}

async function previewReturn() {
  if (previewReturnBtn.disabled) return;

  if (!validateReturnForm()) {
    AppUtils.setStatus("returnStatus", "Please fix the validation errors before previewing the return.", STATUS.ERROR);
    return;
  }

  previewReturnBtn.disabled = true;
  AppUtils.setStatus("returnStatus", "Loading wallet state and refund preview...", STATUS.INFO);

  try {
    const fileText = await readFileAsText(returnKeystoreFile.files[0]);
    const password = returnWalletPassword.value;
    const quantity = Number(returnQuantity.value);

    returnProgressWrap.style.display = "block";
    returnProgressBar.value = 0;
    returnProgressText.textContent = "Decrypting wallet...";

    const preview = await ContractService.previewReturnWithEncryptedJson(fileText, password, quantity, (progress) => {
      const percent = Math.round(progress * 100);
      returnProgressBar.value = percent;
      returnProgressText.textContent = "Decrypting wallet... " + percent + "%";
    });

    await refreshReturnSnapshot(preview.signerAddress);
    AppUtils.setText("returnTotalRefund", AppUtils.formatEth(preview.totalRefund));
    AppUtils.setText("returnTxLink", "-");

    AppUtils.setStatus(
      "returnStatus",
      `Return preview loaded. Estimated gas is about ${AppUtils.formatEth(preview.estimatedGasCost)}.`,
      STATUS.SUCCESS
    );
  } catch (error) {
    console.error(error);
    AppUtils.setStatus("returnStatus", `Failed to preview return: ${error.message || "Unknown error."}`, STATUS.ERROR);
  } finally {
    previewReturnBtn.disabled = false;
    returnProgressText.textContent = "Done";
  }
}

async function handleReturnSubmit(event) {
  event.preventDefault();
  if (returnTicketsBtn.disabled) return;

  if (!validateReturnForm()) {
    AppUtils.setStatus("returnStatus", "Please fix the validation errors before returning tickets.", STATUS.ERROR);
    return;
  }

  returnTicketsBtn.disabled = true;
  previewReturnBtn.disabled = true;
  returnProgressWrap.style.display = "block";
  returnProgressBar.value = 0;
  returnProgressText.textContent = "Preparing return transaction...";
  AppUtils.setStatus("returnStatus", "Decrypting wallet and sending return transaction...", STATUS.INFO);

  try {
    const fileText = await readFileAsText(returnKeystoreFile.files[0]);
    const password = returnWalletPassword.value;
    const quantity = Number(returnQuantity.value);

    const result = await ContractService.returnTicketsWithEncryptedJson(
      fileText,
      password,
      quantity,
      (progress) => {
        const percent = Math.round(progress * 100);
        returnProgressBar.value = percent;
        returnProgressText.textContent = "Decrypting wallet... " + percent + "%";
      }
    );

    await refreshReturnSnapshot(result.signerAddress);
    AppUtils.setText("returnTotalRefund", AppUtils.formatEth(result.totalRefund));

    const txUrl = AppUtils.txOrAddressLink(window.APP_CONFIG.EXPLORER_BASE_URL, "tx", result.txHash);
    AppUtils.setHtml(
      "returnTxLink",
      `<a href="${txUrl}" target="_blank" rel="noopener noreferrer">${result.txHash}</a>`
    );

    AppUtils.setStatus("returnStatus", "Ticket return confirmed successfully on Sepolia.", STATUS.SUCCESS);
    returnWalletPassword.value = "";
  } catch (error) {
    console.error(error);
    AppUtils.setStatus("returnStatus", `Ticket return failed: ${error.message || "Unknown error."}`, STATUS.ERROR);
  } finally {
    returnTicketsBtn.disabled = false;
    previewReturnBtn.disabled = false;
    returnProgressText.textContent = "Done";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setContractBanner();
  previewReturnBtn.addEventListener("click", previewReturn);
  document.getElementById("returnForm").addEventListener("submit", handleReturnSubmit);
});
