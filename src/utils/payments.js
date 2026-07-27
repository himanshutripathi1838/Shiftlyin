export function parseMoneyAmount(value) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const match = String(value).replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export function calculatePaymentAmount({ salaryAmount, salary, salaryType = "fixed", workingHours = 0 }) {
  const baseAmount = parseMoneyAmount(salaryAmount || salary);
  if (!baseAmount) return 0;

  if (salaryType === "hourly") {
    return Number((baseAmount * Number(workingHours || 0)).toFixed(2));
  }

  return Number(baseAmount.toFixed(2));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}
