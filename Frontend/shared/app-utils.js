window.AppUtils = (() => {
  const STATUS_TYPES = {
    ERROR: "error",
    SUCCESS: "success",
    INFO: "info"
  };

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function validateEthereumAddress(address) {
    if (!window.ethers) return false;
    const trimmed = address.trim();

    if (!ethers.isAddress(trimmed)) return false;

    const isMixedCase = trimmed !== trimmed.toLowerCase() && trimmed !== trimmed.toUpperCase();
    if (!isMixedCase) return true;

    try {
      return ethers.getAddress(trimmed) === trimmed;
    } catch {
      return false;
    }
  }

  function formatEth(valueWei) {
    try {
      return `${ethers.formatEther(valueWei)} ETH`;
    } catch {
      return "-";
    }
  }

  function formatToken(value, decimals = 0, symbol = "") {
    try {
      const formatted = ethers.formatUnits(value, decimals);
      return symbol ? `${formatted} ${symbol}` : formatted;
    } catch {
      return "-";
    }
  }

  function txOrAddressLink(baseUrl, type, value) {
    if (!baseUrl || !value) return "#";
    if (type === "address") return `${baseUrl}/address/${value}`;
    if (type === "tx") return `${baseUrl}/tx/${value}`;
    return "#";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function setStatus(elementId, message, type = STATUS_TYPES.INFO) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const validType = Object.values(STATUS_TYPES).includes(type) ? type : STATUS_TYPES.INFO;
    el.textContent = message;
    el.className = `status ${validType}`;
    el.style.display = "block";
  }

  function clearStatus(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = "";
    el.className = "status";
    el.style.display = "none";
  }

  return {
    STATUS_TYPES,
    isNonEmptyString,
    validateEthereumAddress,
    formatEth,
    formatToken,
    txOrAddressLink,
    setText,
    setHtml,
    setStatus,
    clearStatus
  };
})();
