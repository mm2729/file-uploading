const adminPassword = "melis";

document.getElementById("transactionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const fatherName = document.getElementById("fatherName").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0]; // File is optional, so we may not have one.

    // Validate that all required fields are filled in
    if (!name || !fatherName || isNaN(amount) || amount <= 0) {
        showStatusMessage("Please fill in all required fields correctly!", "error", document.querySelector("button[type='submit']"));
        return;
    }

    // If file is uploaded, process it, otherwise skip
    let fileData = null;
    let fileName = null;
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            fileData = event.target.result;
            fileName = file.name;
            saveTransaction(name, fatherName, amount, fileData, fileName);
        };
        reader.readAsDataURL(file);
    } else {
        saveTransaction(name, fatherName, amount, null, null);
    }

    // Reset form after submission
    this.reset();

    showStatusMessage("Transaction submitted successfully!", "success", document.querySelector("button[type='submit']"));
});

function saveTransaction(name, fatherName, amount, fileData, fileName) {
    const transactionData = {
        name,
        fatherName,
        amount,
        date: new Date().toLocaleString(),
        fileData: fileData,
        fileName: fileName
    };

    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push(transactionData);
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function displayTransactions() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const historyContainer = document.getElementById("transactionHistory");
    historyContainer.innerHTML = "";

    if (transactions.length === 0) {
        historyContainer.innerHTML = "<p>No transactions found.</p>";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Number</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Screenshot</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${transactions.map((transaction, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${transaction.name}</td>
                    <td>${transaction.fatherName}</td>
                    <td>${transaction.amount}</td>
                    <td>${calculateRunningTotal(transactions, index)}</td>
                    <td>
                        ${transaction.fileData ?
            `<a class="file-link" href="${transaction.fileData}" target="_blank" download="${transaction.fileName}">
                                ${transaction.fileName}
                            </a>` : 'No file uploaded'}
                    </td>
                    <td>${transaction.date}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    historyContainer.appendChild(table);
}

document.getElementById("showAllButton").addEventListener("click", () => {
    displayTransactions();
    document.getElementById("transactionHistory").style.display = "block";
    showStatusMessage("Showing all transactions", "success", document.getElementById("showAllButton"));
});

document.getElementById("removeAllButton").addEventListener("click", () => {
    const password = prompt("Enter admin password:");
    if (password === adminPassword) {
        localStorage.removeItem("transactions");
        document.getElementById("transactionHistory").style.display = "none";
        showStatusMessage("All transactions removed!", "success", document.getElementById("removeAllButton"));
    } else {
        showStatusMessage("Incorrect password!", "error", document.getElementById("removeAllButton"));
    }
});

function calculateRunningTotal(transactions, currentIndex) {
    return transactions.slice(0, currentIndex + 1)
        .reduce((sum, t) => sum + t.amount, 0);
}

function showStatusMessage(message, type, button) {
    const statusElement = document.getElementById("statusMessage");
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = "block";

    // Position the status message below the clicked button
    const rect = button.getBoundingClientRect();
    statusElement.style.position = 'absolute';
    statusElement.style.top = `${rect.bottom + window.scrollY}px`;
    statusElement.style.left = `${rect.left}px`;

    setTimeout(() => {
        statusElement.style.display = "none";
    }, 3000);
}
