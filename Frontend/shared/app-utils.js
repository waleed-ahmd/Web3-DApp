window.AppUtils = (() => {
  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function validateEthereumAddress(address) {
    if (!window.ethers) return false;
    return ethers.isAddress(address);
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

  function setStatus(elementId, message, type = "info") {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `status ${type}`;
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
