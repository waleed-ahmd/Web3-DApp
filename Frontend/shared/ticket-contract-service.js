window.ContractService = (() => {
  const config = window.APP_CONFIG;
  const DEFAULT_BUY_GAS_LIMIT = 120000n;
  const DEFAULT_RETURN_GAS_LIMIT = 120000n;

  function validateQuantity(quantity) {
    const value = Number(quantity);
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error("Quantity must be a whole number greater than zero.");
    }

    return BigInt(value);
  }

  function formatEth(valueWei) {
    return `${ethers.formatEther(valueWei)} ETH`;
  }

  function formatTickets(value) {
    return value.toString();
  }

  function getRevertData(error) {
    return error?.data
      || error?.error?.data
      || error?.info?.error?.data
      || error?.receipt?.revertReason
      || null;
  }

  function getDecodedContractError(error) {
    const revertData = getRevertData(error);
    if (!revertData) return null;

    try {
      return new ethers.Interface(config.CONTRACT_ABI).parseError(revertData);
    } catch {
      return null;
    }
  }

  function getErrorMessage(error) {
    const decodedError = getDecodedContractError(error);

    if (decodedError?.name === "InvalidQuantity") {
      return "Quantity must be a whole number greater than zero.";
    }

    if (decodedError?.name === "IncorrectEtherSent") {
      return "The ETH value sent with the purchase does not match the ticket price.";
    }

    if (decodedError?.name === "NotEnoughVendorInventory") {
      const [requested, available] = decodedError.args;
      return `Only ${formatTickets(available)} ticket(s) remain, but ${formatTickets(requested)} were requested.`;
    }

    if (decodedError?.name === "NoTicketToReturn") {
      const [, requested, balance] = decodedError.args;
      return `This wallet only has ${formatTickets(balance)} ticket(s), but ${formatTickets(requested)} were requested for return.`;
    }

    if (decodedError?.name === "RefundReserveInsufficient") {
      const [required, available] = decodedError.args;
      return `The contract can refund ${formatEth(available)}, but this return needs ${formatEth(required)}.`;
    }

    if (decodedError?.name === "EtherRefundFailed") {
      return "The contract could not send the ETH refund back to this wallet.";
    }

    if (decodedError?.name) {
      return `The contract rejected this transaction: ${decodedError.name}.`;
    }

    const rawMessage = [
      error?.shortMessage,
      error?.reason,
      error?.message,
      error?.info?.error?.message
    ].find(Boolean) || "Unknown blockchain error.";

    if (/incorrect password|invalid password|bad decrypt|wrong password/i.test(rawMessage)) {
      return "The wallet password is incorrect for the selected keystore file.";
    }

    if (/insufficient funds|insufficient balance/i.test(rawMessage)) {
      return "This wallet does not have enough Sepolia ETH to pay for the transaction and gas.";
    }

    if (/user rejected|action rejected/i.test(rawMessage)) {
      return "The transaction was rejected before it was sent.";
    }

    if (/network|could not coalesce|failed to fetch|server response/i.test(rawMessage)) {
      return "Could not reach the Sepolia RPC provider. Check your connection and RPC URL.";
    }

    return rawMessage;
  }

  function normalizeError(error) {
    return new Error(getErrorMessage(error));
  }

  function withTimeout(promise, label = "RPC call") {
    const timeoutMs = Number(config?.RPC_TIMEOUT_MS || 10000);
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
      }, timeoutMs);
    });

    return Promise.race([
      promise,
      timeoutPromise
    ]).finally(() => window.clearTimeout(timeoutId));
  }

  function shouldUseGasFallback(error) {
    if (getDecodedContractError(error)) {
      return false;
    }

    const rawMessage = [
      error?.shortMessage,
      error?.reason,
      error?.message,
      error?.info?.error?.message
    ].find(Boolean) || "";

    return /timeout|network|failed to fetch|server response|could not coalesce|rate limit/i.test(rawMessage);
  }

  function validateConfig() {
    if (!window.ethers) {
      throw new Error("ethers.js is not loaded.");
    }

    if (!config) {
      throw new Error("APP_CONFIG is missing.");
    }

    if (!config.RPC_URL) {
      throw new Error("Sepolia RPC URL is missing from app-config.js.");
    }

    if (!config.CONTRACT_ADDRESS) {
      throw new Error("Contract address is missing from app-config.js.");
    }

    if (!ethers.isAddress(config.CONTRACT_ADDRESS)) {
      throw new Error("The contract address in app-config.js is not a valid Ethereum address.");
    }
  }

  function getProvider() {
    validateConfig();
    return new ethers.JsonRpcProvider(config.RPC_URL);
  }

  async function ensureSepolia(provider) {
    const network = await withTimeout(provider.getNetwork(), "Network check");
    const actualChainId = Number(network.chainId);

    if (actualChainId !== config.NETWORK.chainId) {
      throw new Error(
        `Wrong network detected. Expected Sepolia (${config.NETWORK.chainId}) but got chain ID ${actualChainId}.`
      );
    }
  }

  async function getReadContract() {
    const provider = getProvider();
    await withTimeout(ensureSepolia(provider), "Sepolia network check");

    const contract = new ethers.Contract(
      config.CONTRACT_ADDRESS,
      config.CONTRACT_ABI,
      provider
    );

    return { provider, contract };
  }

  async function loadSignerFromEncryptedJson(keystoreJson, password, progressCallback) {
    validateConfig();

    if (!keystoreJson || typeof keystoreJson !== "string") {
      throw new Error("Encrypted keystore JSON is required.");
    }

    if (!password) {
      throw new Error("Wallet password is required.");
    }

    if (!ethers.isKeystoreJson(keystoreJson)) {
      throw new Error("The uploaded file is not a valid Ethereum keystore JSON.");
    }

    const provider = getProvider();
    await withTimeout(ensureSepolia(provider), "Sepolia network check");

    let wallet;
    try {
      wallet = await ethers.Wallet.fromEncryptedJson(
        keystoreJson,
        password,
        progressCallback
      );
    } catch (error) {
      throw normalizeError(error);
    }

    return wallet.connect(provider);
  }

  async function getWriteContractFromEncryptedJson(keystoreJson, password, progressCallback) {
    const signer = await loadSignerFromEncryptedJson(keystoreJson, password, progressCallback);

    const contract = new ethers.Contract(
      config.CONTRACT_ADDRESS,
      config.CONTRACT_ABI,
      signer
    );

    return { signer, contract, provider: signer.provider };
  }

  async function getEthBalance(address) {
    const { provider } = await getReadContract();
    return await withTimeout(provider.getBalance(address), "ETH balance lookup");
  }

  async function getTokenBalance(address) {
    const { contract } = await getReadContract();
    return await contract.balanceOf(address);
  }

  async function getTokenSymbol() {
    const { contract } = await getReadContract();
    return await contract.symbol();
  }

  async function getTokenDecimals() {
    const { contract } = await getReadContract();
    return await contract.decimals();
  }

  async function hasTicket(address) {
    const { contract } = await getReadContract();
    return await contract.hasTicket(address);
  }

  async function previewCost(quantity) {
    const qty = validateQuantity(quantity);

    const { contract } = await getReadContract();
    return await contract.previewCost(qty);
  }

  async function getVenueOverview() {
    const { contract, provider } = await getReadContract();

    const [
      owner,
      vendor,
      ticketPriceWei,
      remainingInventory,
      ticketsSold,
      ticketsReturned,
      refundLiability,
      ticketsOutstanding,
      totalRevenueHeld,
      totalSupply,
      tokenSymbol,
      decimals
    ] = await Promise.all([
      contract.owner(),
      contract.vendor(),
      contract.ticketPriceWei(),
      contract.remainingInventory(),
      contract.ticketsSold(),
      contract.ticketsReturned(),
      contract.refundLiability(),
      contract.ticketsOutstanding(),
      contract.totalRevenueHeld(),
      contract.totalSupply(),
      contract.symbol(),
      contract.decimals()
    ]);

    const vendorEthBalance = await provider.getBalance(vendor);

    return {
      owner,
      vendor,
      ticketPriceWei,
      remainingInventory,
      ticketsSold,
      ticketsReturned,
      refundLiability,
      ticketsOutstanding,
      totalRevenueHeld,
      totalSupply,
      vendorEthBalance,
      tokenSymbol,
      decimals
    };
  }

  async function estimateGasCost(provider, gasEstimate) {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 0n;
    return gasEstimate * gasPrice;
  }

  async function assertCanBuyTickets(signer, contract, quantity) {
    const qty = validateQuantity(quantity);
    const totalCost = await contract.previewCost(qty);
    const available = await contract.remainingInventory();

    if (available < qty) {
      throw new Error(
        `Only ${formatTickets(available)} ticket(s) remain, but you requested ${formatTickets(qty)}.`
      );
    }

    const ethBalance = await signer.provider.getBalance(signer.address);
    let estimatedGasCost = 0n;

    try {
      const gasEstimate = qty === 1n
        ? await contract.buyTicket.estimateGas({ value: totalCost })
        : await contract.buyTickets.estimateGas(qty, { value: totalCost });
      estimatedGasCost = await estimateGasCost(signer.provider, gasEstimate);
    } catch (error) {
      if (!shouldUseGasFallback(error)) {
        throw normalizeError(error);
      }

      console.warn("Gas estimation failed, using fallback estimate:", error);
      estimatedGasCost = await estimateGasCost(signer.provider, DEFAULT_BUY_GAS_LIMIT);
    }

    const minimumNeeded = totalCost + estimatedGasCost;
    if (ethBalance < minimumNeeded) {
      throw new Error(
        `This wallet needs about ${formatEth(minimumNeeded)} for tickets and gas, but only has ${formatEth(ethBalance)}.`
      );
    }

    return { qty, totalCost, ethBalance, estimatedGasCost };
  }

  async function assertCanReturnTickets(signer, contract, quantity) {
    const qty = validateQuantity(quantity);
    const [ticketBalance, refundPerTicket, contractBalance] = await Promise.all([
      contract.balanceOf(signer.address),
      contract.previewCost(1n),
      contract.totalRevenueHeld()
    ]);

    if (ticketBalance < qty) {
      throw new Error(
        `This wallet only has ${formatTickets(ticketBalance)} ticket(s), but you tried to return ${formatTickets(qty)}.`
      );
    }

    const totalRefund = refundPerTicket * qty;
    if (contractBalance < totalRefund) {
      throw new Error(
        `The contract can refund ${formatEth(contractBalance)}, but this return needs ${formatEth(totalRefund)}.`
      );
    }

    let estimatedGasCost = 0n;
    try {
      const gasEstimate = qty === 1n
        ? await contract.returnTicket.estimateGas()
        : await contract.returnTickets.estimateGas(qty);
      estimatedGasCost = await estimateGasCost(signer.provider, gasEstimate);
    } catch (error) {
      if (!shouldUseGasFallback(error)) {
        throw normalizeError(error);
      }

      console.warn("Gas estimation failed, using fallback estimate:", error);
      estimatedGasCost = await estimateGasCost(signer.provider, DEFAULT_RETURN_GAS_LIMIT);
    }

    const ethBalance = await signer.provider.getBalance(signer.address);
    if (ethBalance < estimatedGasCost) {
      throw new Error(
        `This wallet needs about ${formatEth(estimatedGasCost)} for gas before the refund can be sent, but only has ${formatEth(ethBalance)}.`
      );
    }

    return { qty, totalRefund, refundPerTicket, ethBalance, estimatedGasCost };
  }

  async function previewBuyWithEncryptedJson(keystoreJson, password, quantity, progressCallback) {
    const { signer, contract } = await getWriteContractFromEncryptedJson(
      keystoreJson,
      password,
      progressCallback
    );

    const summary = await assertCanBuyTickets(signer, contract, quantity);

    return {
      signerAddress: signer.address,
      ...summary
    };
  }

  async function buyTicketsWithEncryptedJson(keystoreJson, password, quantity, progressCallback) {
    const { signer, contract } = await getWriteContractFromEncryptedJson(
      keystoreJson,
      password,
      progressCallback
    );

    const { qty, totalCost } = await assertCanBuyTickets(signer, contract, quantity);

    let tx;
    try {
      tx = qty === 1n
        ? await contract.buyTicket({ value: totalCost })
        : await contract.buyTickets(qty, { value: totalCost });
    } catch (error) {
      throw normalizeError(error);
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch (error) {
      throw normalizeError(error);
    }

    return {
      signerAddress: signer.address,
      totalCost,
      txHash: tx.hash,
      receipt
    };
  }

  async function previewReturnWithEncryptedJson(keystoreJson, password, quantity, progressCallback) {
    const { signer, contract } = await getWriteContractFromEncryptedJson(
      keystoreJson,
      password,
      progressCallback
    );

    const summary = await assertCanReturnTickets(signer, contract, quantity);

    return {
      signerAddress: signer.address,
      ...summary
    };
  }

  async function returnTicketsWithEncryptedJson(keystoreJson, password, quantity, progressCallback) {
    const { signer, contract } = await getWriteContractFromEncryptedJson(
      keystoreJson,
      password,
      progressCallback
    );

    const { qty, totalRefund, refundPerTicket } = await assertCanReturnTickets(signer, contract, quantity);

    let tx;
    try {
      tx = qty === 1n
        ? await contract.returnTicket()
        : await contract.returnTickets(qty);
    } catch (error) {
      throw normalizeError(error);
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch (error) {
      throw normalizeError(error);
    }

    return {
      signerAddress: signer.address,
      totalRefund,
      refundPerTicket,
      txHash: tx.hash,
      receipt
    };
  }

  return {
    getProvider,
    getReadContract,
    getEthBalance,
    getTokenBalance,
    getTokenSymbol,
    getTokenDecimals,
    hasTicket,
    previewCost,
    getVenueOverview,
    loadSignerFromEncryptedJson,
    previewBuyWithEncryptedJson,
    buyTicketsWithEncryptedJson,
    previewReturnWithEncryptedJson,
    returnTicketsWithEncryptedJson
  };
})();
