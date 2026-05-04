const form = document.getElementById("walletForm");
const walletRole = document.getElementById("walletRole");
const walletLabel = document.getElementById("walletLabel");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const acknowledgeRisk = document.getElementById("acknowledgeRisk");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const formStatus = document.getElementById("formStatus");
const progressWrap = document.getElementById("progressWrap");
const encryptProgress = document.getElementById("encryptProgress");
const progressText = document.getElementById("progressText");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

const outputPlaceholder = document.getElementById("outputPlaceholder");
const walletOutput = document.getElementById("walletOutput");
const outRole = document.getElementById("outRole");
const outLabel = document.getElementById("outLabel");
const outAddress = document.getElementById("outAddress");
const outPublicKey = document.getElementById("outPublicKey");
const outCreatedAt = document.getElementById("outCreatedAt");
const outFileName = document.getElementById("outFileName");
const outJsonPreview = document.getElementById("outJsonPreview");
const outPrivateKey = document.getElementById("outPrivateKey");
const outMnemonic = document.getElementById("outMnemonic");
const downloadBtn = document.getElementById("downloadBtn");
const copyAddressBtn = document.getElementById("copyAddressBtn");
const toggleSensitiveBtn = document.getElementById("toggleSensitiveBtn");

const loadWalletForm = document.getElementById("loadWalletForm");
const keystoreFile = document.getElementById("keystoreFile");
const loadPassword = document.getElementById("loadPassword");
const loadWalletBtn = document.getElementById("loadWalletBtn");
const resetLoadBtn = document.getElementById("resetLoadBtn");
const loadStatus = document.getElementById("loadStatus");
const loadProgressWrap = document.getElementById("loadProgressWrap");
const loadProgressBar = document.getElementById("loadProgressBar");
const loadProgressText = document.getElementById("loadProgressText");

const loadedOutputPlaceholder = document.getElementById("loadedOutputPlaceholder");
const loadedWalletOutput = document.getElementById("loadedWalletOutput");
const loadedAddress = document.getElementById("loadedAddress");
const loadedPublicKey = document.getElementById("loadedPublicKey");
const loadedFileName = document.getElementById("loadedFileName");
const loadedMnemonic = document.getElementById("loadedMnemonic");
const loadedPrivateKey = document.getElementById("loadedPrivateKey");
const toggleLoadedSensitiveBtn = document.getElementById("toggleLoadedSensitiveBtn");
const copyLoadedAddressBtn = document.getElementById("copyLoadedAddressBtn");

let latestEncryptedJson = "";
let latestFileName = "";
let latestWallet = null;
let latestLoadedWallet = null;
let sensitiveVisible = false;
let loadedSensitiveVisible = false;
let keystoreDownloaded = false;

const createErrorIds = [
  "walletRoleError",
  "walletLabelError",
  "passwordError",
  "confirmPasswordError",
  "acknowledgeRiskError"
];

const loadErrorIds = [
  "keystoreFileError",
  "loadPasswordError"
];

function setStatus(element, message, type = "info") {
  element.textContent = message;
  element.className = "status " + type;
  element.style.display = "block";
}

function clearStatus(element) {
  element.textContent = "";
  element.style.display = "none";
  element.className = "status";
}

function setFieldError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.style.display = message ? "block" : "none";

  const field = document.querySelector(`[aria-describedby~="${id}"]`);
  if (field) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

function clearErrors(ids) {
  ids.forEach((id) => setFieldError(id, ""));
}

function focusFirstInvalidField(root = document) {
  const firstInvalid = root.querySelector('[aria-invalid="true"]');
  if (firstInvalid) {
    firstInvalid.focus();
  }
}

function focusStatus(element) {
  element.focus({ preventScroll: false });
}

function hasEthersLoaded() {
  return Boolean(window.ethers);
}

function showEthersLoadError() {
  const message = "ethers.js failed to load. Check your internet connection or local library import.";
  setStatus(formStatus, message, "error");
  setStatus(loadStatus, message, "error");
  generateBtn.disabled = true;
  loadWalletBtn.disabled = true;
  focusStatus(formStatus);
}

function sanitizeFilePart(value) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 30) || "wallet"
  );
}

function passwordScore(value) {
  let score = 0;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (value.length >= 16) score++;
  return score;
}

function updatePasswordStrength() {
  const value = password.value;
  const score = passwordScore(value);

  let width = 0;
  let text = "Weak";
  let color = "#ef4444";

  if (score <= 2) {
    width = 25;
    text = "Weak";
    color = "#ef4444";
  } else if (score <= 4) {
    width = 60;
    text = "Medium";
    color = "#f59e0b";
  } else {
    width = 100;
    text = "Strong";
    color = "#22c55e";
  }

  strengthFill.style.width = width + "%";
  strengthFill.style.background = color;
  strengthText.textContent = text;
  strengthText.style.color = color;
}

function validateCreateForm() {
  clearErrors(createErrorIds);
  clearStatus(formStatus);

  let valid = true;
  const labelValue = walletLabel.value.trim();
  const passwordValue = password.value;
  const confirmValue = confirmPassword.value;

  if (!walletRole.value) {
    setFieldError("walletRoleError", "Please select a wallet role.");
    valid = false;
  }

  if (!labelValue) {
    setFieldError("walletLabelError", "Please enter a wallet label.");
    valid = false;
  } else if (!/^[A-Za-z0-9 _-]{2,30}$/.test(labelValue)) {
    setFieldError(
      "walletLabelError",
      "Label must be 2–30 characters and use only letters, numbers, spaces, dash, or underscore."
    );
    valid = false;
  }

  const passwordChecks = [
    passwordValue.length >= 12,
    /[A-Z]/.test(passwordValue),
    /[a-z]/.test(passwordValue),
    /[0-9]/.test(passwordValue),
    /[^A-Za-z0-9]/.test(passwordValue)
  ];

  if (!passwordChecks.every(Boolean)) {
    setFieldError(
      "passwordError",
      "Password must be at least 12 characters and include uppercase, lowercase, number, and special character."
    );
    valid = false;
  }

  if (passwordValue !== confirmValue) {
    setFieldError("confirmPasswordError", "Passwords do not match.");
    valid = false;
  }

  if (!acknowledgeRisk.checked) {
    setFieldError(
      "acknowledgeRiskError",
      "Please confirm that you understand the wallet security warning."
    );
    valid = false;
  }

  return valid;
}

function validateLoadForm() {
  clearErrors(loadErrorIds);
  clearStatus(loadStatus);

  let valid = true;
  const file = keystoreFile.files[0];
  const passwordValue = loadPassword.value;

  if (!file) {
    setFieldError("keystoreFileError", "Please choose a JSON keystore file.");
    valid = false;
  } else {
    const isJsonName = file.name.toLowerCase().endsWith(".json");
    const maxSizeBytes = 1024 * 1024; // 1 MB

    if (!isJsonName) {
      setFieldError("keystoreFileError", "The selected file must be a .json keystore file.");
      valid = false;
    } else if (file.size === 0) {
      setFieldError("keystoreFileError", "The selected file is empty.");
      valid = false;
    } else if (file.size > maxSizeBytes) {
      setFieldError("keystoreFileError", "The selected file is too large. Please use a file under 1 MB.");
      valid = false;
    }
  }

  if (!passwordValue) {
    setFieldError("loadPasswordError", "Please enter the wallet password.");
    valid = false;
  }

  return valid;
}

function resetSensitiveView() {
  sensitiveVisible = false;
  toggleSensitiveBtn.textContent = "Reveal Sensitive Details";
  toggleSensitiveBtn.setAttribute("aria-expanded", "false");
  outPrivateKey.classList.remove("revealed");
  outMnemonic.classList.remove("revealed");
}

function resetLoadedSensitiveView() {
  loadedSensitiveVisible = false;
  toggleLoadedSensitiveBtn.textContent = "Reveal Loaded Sensitive Details";
  toggleLoadedSensitiveBtn.setAttribute("aria-expanded", "false");
  loadedPrivateKey.classList.remove("revealed");
  loadedMnemonic.classList.remove("revealed");
}

function showCreatedWalletOutput(data) {
  outputPlaceholder.classList.add("hidden");
  walletOutput.classList.remove("hidden");

  outRole.textContent = data.role;
  outLabel.textContent = data.label;
  outAddress.textContent = data.address;
  outPublicKey.textContent = data.publicKey;
  outCreatedAt.textContent = data.createdAt;
  outFileName.textContent = data.fileName;
  outJsonPreview.value = data.jsonPreview;
  outPrivateKey.textContent = "Private Key: " + data.privateKey;
  outMnemonic.textContent = "Mnemonic: " + data.mnemonic;

  resetSensitiveView();
  downloadBtn.disabled = false;
}

function showLoadedWalletOutput(data) {
  loadedOutputPlaceholder.classList.add("hidden");
  loadedWalletOutput.classList.remove("hidden");

  loadedAddress.textContent = data.address;
  loadedPublicKey.textContent = data.publicKey;
  loadedFileName.textContent = data.fileName;
  loadedMnemonic.textContent = "Mnemonic: " + data.mnemonic;
  loadedPrivateKey.textContent = "Private Key: " + data.privateKey;

  resetLoadedSensitiveView();
}

async function downloadEncryptedJson() {
  if (!latestEncryptedJson || !latestFileName) return;

  const blob = new Blob([latestEncryptedJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = latestFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  keystoreDownloaded = true;

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function readFileAsText(file) {
  return await file.text();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateCreateForm()) {
    setStatus(formStatus, "Please fix the validation errors before generating the wallet.", "error");
    focusFirstInvalidField(form);
    return;
  }

  if (!hasEthersLoaded()) {
    showEthersLoadError();
    return;
  }

  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  progressWrap.style.display = "block";
  encryptProgress.value = 0;
  progressText.textContent = "Generating wallet...";
  setStatus(formStatus, "Creating wallet and encrypted keystore. Please wait...", "info");

  try {
    const roleValue = walletRole.value;
    const labelValue = walletLabel.value.trim();
    const passwordValue = password.value;

    const wallet = ethers.Wallet.createRandom();
    latestWallet = wallet;

    progressText.textContent = "Encrypting keystore JSON...";

    const encryptedJson = await wallet.encrypt(passwordValue, (progress) => {
      const percent = Math.round(progress * 100);
      encryptProgress.value = percent;
      progressText.textContent = "Encrypting keystore JSON... " + percent + "%";
    });

    const timestamp = new Date();
    const addressShort = wallet.address.slice(2, 10).toLowerCase();
    const fileName = [
      sanitizeFilePart(roleValue),
      sanitizeFilePart(labelValue),
      addressShort,
      "keystore.json"
    ].join("_");

    latestEncryptedJson = encryptedJson;
    latestFileName = fileName;
    keystoreDownloaded = false;

    showCreatedWalletOutput({
      role: roleValue,
      label: labelValue,
      address: wallet.address,
      publicKey: wallet.publicKey,
      createdAt: timestamp.toLocaleString(),
      fileName,
      jsonPreview: encryptedJson,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || "Not available"
    });

    password.value = "";
    confirmPassword.value = "";
    updatePasswordStrength();

    setStatus(
      formStatus,
      "Wallet created successfully. Download the encrypted JSON file now and store the password safely.",
      "success"
    );
  } catch (error) {
    console.error(error);
    setStatus(
      formStatus,
      "Wallet generation failed: " + (error?.message || "Unknown error."),
      "error"
    );
  } finally {
    generateBtn.disabled = false;
    progressText.textContent = "Done";
  }
});

loadWalletForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateLoadForm()) {
    setStatus(loadStatus, "Please fix the validation errors before loading the wallet.", "error");
    focusFirstInvalidField(loadWalletForm);
    return;
  }

  if (!hasEthersLoaded()) {
    showEthersLoadError();
    return;
  }

  const file = keystoreFile.files[0];
  const passwordValue = loadPassword.value;

  loadWalletBtn.disabled = true;
  loadProgressWrap.style.display = "block";
  loadProgressBar.value = 0;
  loadProgressText.textContent = "Reading keystore file...";
  setStatus(loadStatus, "Loading and decrypting wallet. Please wait...", "info");

  try {
    const fileText = await readFileAsText(file);

    try {
      JSON.parse(fileText);
    } catch {
      throw new Error("The selected file is not valid JSON.");
    }

    if (!ethers.isKeystoreJson(fileText)) {
      throw new Error("The selected JSON file is not a valid Ethereum keystore file.");
    }

    loadProgressText.textContent = "Decrypting keystore JSON...";

    const wallet = await ethers.Wallet.fromEncryptedJson(fileText, passwordValue, (progress) => {
      const percent = Math.round(progress * 100);
      loadProgressBar.value = percent;
      loadProgressText.textContent = "Decrypting keystore JSON... " + percent + "%";
    });

    latestLoadedWallet = wallet;

    showLoadedWalletOutput({
      address: wallet.address,
      publicKey: wallet.publicKey,
      fileName: file.name,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || "Not available"
    });

    loadPassword.value = "";

    setStatus(loadStatus, "Wallet loaded successfully from encrypted JSON.", "success");
  } catch (error) {
    console.error(error);
    setStatus(
      loadStatus,
      "Wallet load failed: " + (error?.message || "Unknown error."),
      "error"
    );
  } finally {
    loadWalletBtn.disabled = false;
    loadProgressText.textContent = "Done";
  }
});

downloadBtn.addEventListener("click", downloadEncryptedJson);

copyAddressBtn.addEventListener("click", async () => {
  if (!latestWallet?.address) return;

  try {
    await navigator.clipboard.writeText(latestWallet.address);
    setStatus(formStatus, "Created wallet address copied to clipboard.", "success");
  } catch {
    setStatus(formStatus, "Could not copy the created wallet address automatically.", "error");
  }
});

copyLoadedAddressBtn.addEventListener("click", async () => {
  if (!latestLoadedWallet?.address) return;

  try {
    await navigator.clipboard.writeText(latestLoadedWallet.address);
    setStatus(loadStatus, "Loaded wallet address copied to clipboard.", "success");
  } catch {
    setStatus(loadStatus, "Could not copy the loaded wallet address automatically.", "error");
  }
});

toggleSensitiveBtn.addEventListener("click", () => {
  sensitiveVisible = !sensitiveVisible;
  outPrivateKey.classList.toggle("revealed", sensitiveVisible);
  outMnemonic.classList.toggle("revealed", sensitiveVisible);
  toggleSensitiveBtn.textContent = sensitiveVisible
    ? "Hide Sensitive Details"
    : "Reveal Sensitive Details";
  toggleSensitiveBtn.setAttribute("aria-expanded", sensitiveVisible ? "true" : "false");
});

toggleLoadedSensitiveBtn.addEventListener("click", () => {
  loadedSensitiveVisible = !loadedSensitiveVisible;
  loadedPrivateKey.classList.toggle("revealed", loadedSensitiveVisible);
  loadedMnemonic.classList.toggle("revealed", loadedSensitiveVisible);
  toggleLoadedSensitiveBtn.textContent = loadedSensitiveVisible
    ? "Hide Loaded Sensitive Details"
    : "Reveal Loaded Sensitive Details";
  toggleLoadedSensitiveBtn.setAttribute("aria-expanded", loadedSensitiveVisible ? "true" : "false");
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearErrors(createErrorIds);
  clearStatus(formStatus);
  progressWrap.style.display = "none";
  encryptProgress.value = 0;
  latestEncryptedJson = "";
  latestFileName = "";
  latestWallet = null;
  keystoreDownloaded = false;
  downloadBtn.disabled = true;
  outputPlaceholder.classList.remove("hidden");
  walletOutput.classList.add("hidden");
  updatePasswordStrength();
});

resetLoadBtn.addEventListener("click", () => {
  loadWalletForm.reset();
  clearErrors(loadErrorIds);
  clearStatus(loadStatus);
  loadProgressWrap.style.display = "none";
  loadProgressBar.value = 0;
  latestLoadedWallet = null;
  loadedOutputPlaceholder.classList.remove("hidden");
  loadedWalletOutput.classList.add("hidden");
});

password.addEventListener("input", updatePasswordStrength);
updatePasswordStrength();

window.addEventListener("beforeunload", (event) => {
  if (!latestEncryptedJson || keystoreDownloaded) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

if (!hasEthersLoaded()) {
  showEthersLoadError();
}
