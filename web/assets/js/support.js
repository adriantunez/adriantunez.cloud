// Support widget: tabs, plus Lightning invoices via LNURL-pay (LUD-06/16) and payment checks via LUD-21.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-support]").forEach(initSupport);
});

function initSupport(root) {
  const address = root.dataset.address;
  const status = root.querySelector(".support-status");
  const invoiceBox = root.querySelector(".support-invoice");
  const qrBox = root.querySelector(".support-qr");
  const openLink = root.querySelector(".support-open");
  const invoiceCopy = invoiceBox.querySelector(".support-copy");
  const weblnButton = root.querySelector(".support-webln");
  let payRequest = null; // cached LNURL-pay metadata
  let pollTimer = null;
  let currentInvoice = "";

  // Tabs
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      const selected = t === tab;
      t.setAttribute("aria-selected", selected);
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (event) {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  // Copy buttons
  root.addEventListener("click", async function (event) {
    const button = event.target.closest(".support-copy");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const label = button.textContent;
      button.textContent = "Copied";
      setTimeout(function () { button.textContent = label; }, 1500);
    } catch {
      status.textContent = "Couldn’t copy. Select the text and copy it manually.";
    }
  });

  // Amount
  root.querySelector(".support-custom").addEventListener("submit", function (event) {
    event.preventDefault();
    const sats = Math.floor(Number(event.target.querySelector("input").value));
    if (sats > 0) requestInvoice(sats);
  });

  weblnButton.addEventListener("click", async function () {
    try {
      await window.webln.enable();
      await window.webln.sendPayment(currentInvoice);
      paid();
    } catch {
      status.textContent = "The browser wallet didn’t complete the payment.";
    }
  });

  async function requestInvoice(sats) {
    clearTimeout(pollTimer);
    invoiceBox.hidden = true;
    status.textContent = "Creating invoice…";
    try {
      const { pr, verify } = address ? await fetchInvoice(sats) : await fakeInvoice();
      showInvoice(pr, sats);
      if (verify) poll(verify);
    } catch (error) {
      status.textContent = error.message || "Couldn’t create the invoice. Please try again.";
    }
  }

  async function fetchInvoice(sats) {
    if (!payRequest) {
      const [user, domain] = address.split("@");
      payRequest = await getJSON("https://" + domain + "/.well-known/lnurlp/" + encodeURIComponent(user));
      if (payRequest.tag !== "payRequest") throw new Error("This Lightning Address doesn’t accept payments.");
    }
    const msats = sats * 1000;
    if (msats < payRequest.minSendable || msats > payRequest.maxSendable) {
      throw new Error("Choose an amount between " + Math.ceil(payRequest.minSendable / 1000) +
        " and " + Math.floor(payRequest.maxSendable / 1000) + " sats.");
    }
    const url = new URL(payRequest.callback);
    url.searchParams.set("amount", msats);
    const result = await getJSON(url);
    if (!result.pr) throw new Error(result.reason || "The wallet didn’t return an invoice.");
    return result;
  }

  async function getJSON(url) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await response.json();
    if (data.status === "ERROR") throw new Error(data.reason || "The Lightning wallet returned an error.");
    return data;
  }

  // Demo mode: a random, invalid invoice so the layout can be checked without a real address.
  async function fakeInvoice() {
    await new Promise(function (resolve) { setTimeout(resolve, 400); });
    const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    let body = "";
    for (let i = 0; i < 300; i++) body += chars[Math.floor(Math.random() * chars.length)];
    return { pr: "lnbcdemo1" + body };
  }

  function showInvoice(pr, sats) {
    currentInvoice = pr;
    const qr = qrcode(0, "M");
    qr.addData(("lightning:" + pr).toUpperCase(), "Alphanumeric"); // uppercase keeps the QR small
    qr.make();
    qrBox.innerHTML = qrSvg(qr);
    openLink.href = "lightning:" + pr;
    invoiceCopy.dataset.copy = pr;
    weblnButton.hidden = !window.webln;
    invoiceBox.hidden = false;
    status.textContent = "Scan or open the invoice for " + sats.toLocaleString() + " sats.";
  }

  function qrSvg(qr) {
    const size = qr.getModuleCount();
    const quiet = 2;
    let path = "";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (qr.isDark(row, col)) path += "M" + (col + quiet) + " " + (row + quiet) + "h1v1h-1z";
      }
    }
    const box = size + quiet * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + box + " " + box +
      '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + path + '"/></svg>';
  }

  // LUD-21: poll the verify URL until the invoice settles (gives up after ~10 minutes).
  function poll(verify, attempt) {
    attempt = attempt || 0;
    if (attempt > 200) return;
    pollTimer = setTimeout(async function () {
      try {
        const result = await getJSON(verify);
        if (result.settled) return paid();
      } catch { /* keep polling */ }
      poll(verify, attempt + 1);
    }, 3000);
  }

  function paid() {
    clearTimeout(pollTimer);
    invoiceBox.hidden = true;
    status.textContent = "Payment received. Thank you! ⚡";
  }
}
