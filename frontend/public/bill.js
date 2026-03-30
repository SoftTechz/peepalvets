// -----------------------------
// URL parameter parser
// -----------------------------
const params = new URLSearchParams(window.location.search);
const billingId = params.get("billing_id") || params.get("bill_id");
const shouldPrint =
  params.get("print") === "1" || params.get("print") === "true";
const API_BASE_URL = params.get("api_base") || "/api/v1";

// -----------------------------
// Helper functions
// -----------------------------
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderItems(items) {
  const body = document.getElementById("prescription-body");
  const totalEl = document.getElementById("total_amount");

  if (!body || !totalEl) return;

  if (!items || items.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No items available</td>
      </tr>
    `;
    totalEl.textContent = "₹0.00";
    return;
  }

  let total = 0;
  body.innerHTML = items
    .map((item, idx) => {
      const serviceName =
        item.service_or_item || item.description || item.name || "-";
      const quantity = Number(item.quantity ?? item.qty ?? 0);
      const rate = Number(item.rate ?? item.price ?? 0);
      const amount = Number(item.amount ?? quantity * rate ?? 0);
      total += amount;

      return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${serviceName}</td>
          <td class="text-center">${quantity || "-"}</td>
          <td class="text-right">₹${rate.toFixed(2)}</td>
          <td class="text-right">₹${amount.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  totalEl.textContent = `₹${total.toFixed(2)}`;
}

function renderBill(bill) {
  if (!bill) {
    alert("Bill data is not available");
    return;
  }

  setText(
    "owner_name",
    bill.patient_name || bill.customerName || bill.name || "-",
  );
  setText("phone", bill.phone_number || bill.phone || "-");
  setText("pet_name", bill.pet_name || bill.petName || "-");
  setText("address", bill.address || "-");
  setText(
    "signature_date",
    formatDate(bill.date || bill.created_at || new Date()),
  );

  if (Array.isArray(bill.items) && bill.items.length > 0) {
    renderItems(bill.items);
    setText(
      "total_amount",
      `₹${Number(bill.total_amount || bill.total || 0).toFixed(2)}`,
    );
  } else if (Array.isArray(bill.medicines)) {
    const mappedItems = bill.medicines.map((m) => ({
      service_or_item: m.drugName || m.medicineName || m.name || "-",
      quantity: m.quantity || m.duration || 1,
      rate: m.rate || m.price || Number(m.timing?.A || 0) || 0,
      amount:
        m.amount ||
        (m.quantity || m.duration || 1) *
          (m.rate || m.price || Number(m.timing?.A || 0) || 0),
    }));
    renderItems(mappedItems);
    const total = Number(
      bill.total_amount ||
        bill.total ||
        mappedItems.reduce((sum, item) => sum + item.amount, 0),
    );
    document.getElementById("total_amount").textContent =
      `₹${total.toFixed(2)}`;
  } else {
    renderItems([]);
  }

  if (shouldPrint) {
    setTimeout(() => {
      window.focus();
      window.print();
    }, 400);
    window.onafterprint = () => window.close();
  }
}

// -----------------------------
// Data loading
// -----------------------------
(async () => {
  if (!billingId) {
    console.error("No billing_id provided in query string.");
    return;
  }

  try {
    let url;
    if (billingId) {
      url = `${API_BASE_URL}/billing/${billingId}`;
    }

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const bill = data.billing;

    renderBill(bill);
  } catch (error) {
    console.error("Unable to load bill:", error);
  }
})();
