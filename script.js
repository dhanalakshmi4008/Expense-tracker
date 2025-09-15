let budget = 0;
let expenses = [];
let expenseId = 0;
let chart;

function setBudget() {
  budget = parseFloat(document.getElementById("budget-input").value) || 0;
  updateSummary();
}

function addExpense() {
  const name = document.getElementById("expense-name").value.trim();
  const amount = parseFloat(document.getElementById("expense-amount").value);

  if (name === "" || isNaN(amount) || amount <= 0) {
    showNotification("❌ Please enter valid expense details.");
    return;
  }

  if (budget <= 0) {
    showNotification("⚠️ Please set a valid budget before adding expenses!");
    return;
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = budget - totalExpenses;

  if (amount > balance) {
    showNotification(`⚠️ Expense exceeds balance! Only $${balance} left.`);
    return;
  }

  // Add expense
  expenses.push({ id: ++expenseId, name, amount });
  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";

  renderExpenses();
  updateSummary();
  updateChart();

  // Success message
  showNotification("✅ Expense added successfully!", "success");
}

function showNotification(message, type = "error") {
  const box = document.getElementById("notification");
  box.innerText = message;
  box.className = `notification ${type}`;
  box.style.display = "block";

  // Hide automatically after 3 seconds
  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}


function renderExpenses() {
  const tbody = document.querySelector("#expense-table tbody");
  tbody.innerHTML = "";

  expenses.forEach((expense, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${expense.name}</td>
      <td>$${expense.amount}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editExpense(${expense.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    document.getElementById("expense-name").value = expense.name;
    document.getElementById("expense-amount").value = expense.amount;
    deleteExpense(id);
  }
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  renderExpenses();
  updateSummary();
  updateChart();
}

function resetApp() {
  budget = 0;
  expenses = [];
  expenseId = 0;
  document.getElementById("budget-input").value = "";
  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";
  renderExpenses();
  updateSummary();
  if (chart) chart.destroy();
}

function updateSummary() {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = budget - totalExpenses;

  document.getElementById("budget-display").innerText = `$${budget}`;
  document.getElementById("expense-display").innerText = `$${totalExpenses}`;

  const balanceDisplay = document.getElementById("balance-display");
  balanceDisplay.innerText = `$${balance}`;
  balanceDisplay.className = balance >= 0 ? "positive" : "negative";
}

function updateChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: expenses.map(e => `${e.name} (${((e.amount / budget) * 100).toFixed(1)}%)`),
      datasets: [{
        data: expenses.map(e => e.amount),
        backgroundColor: [
          "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40"
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#333",
            font: { size: 12 }
          }
        }
      }
    }
  });
}
