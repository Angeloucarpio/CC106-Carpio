let incomeTotal = 0;
      let expenseTotal = 0;
      let currentEditRow = null;
      let initialBudget = 0;

      // Load data from localStorage when the page loads
      window.onload = () => {
        loadInitialBudget();
        loadTransactions();
      };

      const setInitialBudget = () => {
        const budget = parseFloat(document.getElementById("budget").value);
        if (isNaN(budget) || budget <= 0) {
          alert("Please enter a valid budget.");
          return;
        }

        initialBudget = budget;
        localStorage.setItem("initialBudget", initialBudget);
        updateBudgetDisplay();
      };

      const loadInitialBudget = () => {
        const storedBudget = localStorage.getItem("initialBudget");
        if (storedBudget) {
          initialBudget = parseFloat(storedBudget);
          updateBudgetDisplay();
        }
      };

      const updateBudgetDisplay = () => {
        document.getElementById("budgetRemaining").textContent = `P ${(
          initialBudget - expenseTotal
        ).toFixed(2)}`;
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

        if (type === "expense" && expenseTotal + amount > initialBudget) {
          alert("You cannot exceed your initial budget.");
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
        document.querySelector(
          'input[name="type"][value="income"]'
        ).checked = true;
        currentEditRow = null; // Reset the edit mode
      };

      const saveTransaction = (transaction) => {
        let transactions =
          JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));
      };

      const loadTransactions = () => {
        let transactions =
          JSON.parse(localStorage.getItem("transactions")) || [];

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
        const type =
          row.children[2].textContent === "Income" ? "income" : "expense";

        // Fill in the values for editing
        document.getElementById("name").value = name;
        document.getElementById("category").value = category;
        document.getElementById("amount").value = amount;
        document.querySelector(
          `input[name="type"][value="${type}"]`
        ).checked = true;

        currentEditRow = row; // Mark that we are in edit mode
      };

      const updateTransaction = (transaction) => {
        const rows = document.querySelectorAll("#transactionList tr");
        rows.forEach((row) => {
          const name = row.children[0].textContent;
          if (name === transaction.name) {
            row.children[1].textContent = transaction.category;
            row.children[3].textContent = `P ${transaction.amount}`;
            row.children[2].textContent =
              transaction.type === "income" ? "Income" : "Expense";
          }
        });

        // Update the totals
        updateTotals(transaction.type, parseFloat(transaction.amount));
      };

      const deleteTransaction = (icon) => {
        const row = icon.closest("tr");
        const amount = parseFloat(
          row.children[3].textContent.replace("P ", "").trim()
        );
        const type =
          row.children[2].textContent === "Income" ? "income" : "expense";

        row.remove();
        updateTotals(type, -amount); // Adjust totals
      };

      const updateTotals = (type, amount) => {
        if (type === "income") {
          incomeTotal += amount;
          document.getElementById(
            "income"
          ).textContent = `+ P ${incomeTotal.toFixed(2)}`;
        } else {
          expenseTotal += amount;
          document.getElementById(
            "expense"
          ).textContent = `- P ${expenseTotal.toFixed(2)}`;
        }

        document.getElementById("balance").textContent = `P ${
          incomeTotal - expenseTotal
        }`;

        updateBudgetDisplay();
      };

      // Edit and delete budget functionality
      const editBudget = () => {
        const newBudget = prompt("Enter the new budget amount:", initialBudget);
        const newBudgetNumber = parseFloat(newBudget);

        if (isNaN(newBudgetNumber) || newBudgetNumber <= 0) {
          alert("Please enter a valid number greater than 0.");
          return;
        }

        initialBudget = newBudgetNumber;
        localStorage.setItem("initialBudget", initialBudget);
        updateBudgetDisplay();
      };

      const deleteBudget = () => {
        const confirmation = confirm(
          "Are you sure you want to delete the budget?"
        );
        if (confirmation) {
          initialBudget = 0;
          localStorage.setItem("initialBudget", initialBudget);
          updateBudgetDisplay();
        }
      };