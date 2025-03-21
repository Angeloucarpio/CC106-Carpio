let incomeTotal = 0;
let expenseTotal = 0;
let currentEditRow = null;

// Load transactions from localStorage when the page loads
window.onload = () => {
  loadTransactions();
};

const setCategory = (category) => {
  document.getElementById("category").value = category;
};

const addTransaction = () => {
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const type = document.querySelector('input[name="type"]:checked').value;

  if (!name || !category || amount <= 0) {
    alert("Please fill out all fields with valid values.");
    return;
  }

  if (type === "expense" && expenseTotal + amount > incomeTotal) {
    alert("Insufficient income to cover this expense.");
    return;
  }

  const transaction = {
    name,
    category,
    type,
    amount: amount.toFixed(2),
  };

  if (currentEditRow) {
    // If editing an existing transaction, update it
    updateTransaction(transaction);
  } else {
    // Otherwise, add it as a new transaction
    saveTransaction(transaction);
    addToTransactionList(transaction);
    updateTotals(type, amount);
  }

  // Clear the inputs after adding or editing
  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("amount").value = "";
  document.querySelector('input[name="type"][value="income"]').checked = true;
  currentEditRow = null; // Reset the edit mode
};

const saveTransaction = (transaction) => {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

const loadTransactions = () => {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // If no transactions exist, set initial data
  if (transactions.length === 0) {
    transactions = [];
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  transactions.forEach((transaction) => {
    addToTransactionList(transaction);
    updateTotals(transaction.type, parseFloat(transaction.amount));
  });
};

const addToTransactionList = (transaction) => {
  const tbody = document.getElementById("transactionList");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${transaction.name}</td>
    <td>${transaction.category}</td>
    <td class="${transaction.type}">${
    transaction.type === "income" ? "Income" : "Expense"
  }</td>
    <td>P ${transaction.amount}</td>
    <td class="transaction-actions">
      <i class="fas fa-edit" onclick="editTransaction(this)"></i>
      <i class="fas fa-trash" onclick="deleteTransaction(this)"></i>
    </td>
  `;
  tbody.appendChild(row);
};

const editTransaction = (icon) => {
  const row = icon.closest("tr");
  const name = row.children[0].textContent;
  const category = row.children[1].textContent;
  const amount = parseFloat(
    row.children[3].textContent.replace("P ", "").trim()
  );
  const type = row.children[2].textContent === "Income" ? "income" : "expense";

  // Fill in the values for editing
  document.getElementById("name").value = name;
  document.getElementById("category").value = category;
  document.getElementById("amount").value = amount;
  document.querySelector(`input[name="type"][value="${type}"]`).checked = true;

  // Store the row in the currentEditRow variable to update later
  currentEditRow = row;
};

const deleteTransaction = (icon) => {
  const row = icon.closest("tr");
  const amount = parseFloat(
    row.children[3].textContent.replace("P ", "").trim()
  );
  const type = row.children[2].textContent === "Income" ? "income" : "expense";

  row.remove();
  deleteTransactionFromStorage(row);
  updateTotalsOnDelete(type, amount);
};

const deleteTransactionFromStorage = (row) => {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const transactionName = row.children[0].textContent;
  transactions = transactions.filter(
    (transaction) => transaction.name !== transactionName
  );
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

const updateTransaction = (updatedTransaction) => {
  // Update the row in the table
  currentEditRow.children[0].textContent = updatedTransaction.name;
  currentEditRow.children[1].textContent = updatedTransaction.category;
  currentEditRow.children[3].textContent = `P ${updatedTransaction.amount}`;

  // Update totals
  const oldAmount = parseFloat(
    currentEditRow.children[3].textContent.replace("P ", "").trim()
  );
  updateTotalsOnDelete(
    currentEditRow.children[2].textContent.toLowerCase(),
    oldAmount
  ); // Remove old amount from totals
  updateTotals(updatedTransaction.type, parseFloat(updatedTransaction.amount));

  // Update the transaction in localStorage
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions = transactions.map((transaction) =>
    transaction.name === updatedTransaction.name
      ? updatedTransaction
      : transaction
  );
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

const updateTotals = (type, amount) => {
  if (type === "income") incomeTotal += amount;
  if (type === "expense") expenseTotal += amount;
  const balance = incomeTotal - expenseTotal;

  document.getElementById("income").textContent = `+ P ${incomeTotal.toFixed(
    2
  )}`;
  document.getElementById("expense").textContent = `- P ${expenseTotal.toFixed(
    2
  )}`;
  document.getElementById("balance").textContent = `P ${balance.toFixed(2)}`;
};

const updateTotalsOnDelete = (type, amount) => {
  if (type === "income") incomeTotal -= amount;
  if (type === "expense") expenseTotal -= amount;
  const balance = incomeTotal - expenseTotal;

  document.getElementById("income").textContent = `+ P ${incomeTotal.toFixed(
    2
  )}`;
  document.getElementById("expense").textContent = `- P ${expenseTotal.toFixed(
    2
  )}`;
  document.getElementById("balance").textContent = `P ${balance.toFixed(2)}`;
};
