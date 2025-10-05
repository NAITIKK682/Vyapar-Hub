// Main App Controller
class VyaparHub {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.initDatabase();
        this.updateDashboard();
        this.setupPWA();
        this.loadSampleData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Menu Toggle (Mobile)
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('main-nav').classList.toggle('active');
        });

        // Quick Actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Form Submissions
        document.getElementById('billing-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateInvoice();
        });

        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Tool Selection
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.openTool(tool);
            });
        });

        // Close Tool Buttons
        document.querySelectorAll('.close-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeTool();
            });
        });

        // Modal Close
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('invoice-modal').classList.remove('active');
            });
        });

        // Weather Search
        document.getElementById('get-weather-btn').addEventListener('click', () => {
            this.getWeather();
        });

        // EMI Calculator
        document.getElementById('calculate-emi').addEventListener('click', () => {
            this.calculateEMI();
        });

        // Currency Converter
        document.getElementById('convert-currency').addEventListener('click', () => {
            this.convertCurrency();
        });

        // QR Generator
        document.getElementById('generate-qr').addEventListener('click', () => {
            this.generateQR();
        });

        // Chatbot
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Voice Command
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.startVoiceRecognition();
        });

        // Quick Commands
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.currentTarget.textContent;
                this.processCommand(command);
            });
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update main content
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        
        // Close mobile menu
        document.getElementById('main-nav').classList.remove('active');
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.loadTheme();
    }

    loadTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.querySelectorAll('.card, .app-nav, .modal-content, .toast').forEach(el => {
                el.classList.add('dark-mode');
            });
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelectorAll('.card, .app-nav, .modal-content, .toast').forEach(el => {
                el.classList.remove('dark-mode');
            });
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
    }

    openTool(tool) {
        document.querySelectorAll('.tool-detail').forEach(detail => {
            detail.classList.remove('active');
        });
        document.getElementById(`${tool}-calculator` || `${tool}-converter` || `${tool}-tools` || `${tool}-calendar`).classList.add('active');
    }

    closeTool() {
        document.querySelectorAll('.tool-detail').forEach(detail => {
            detail.classList.remove('active');
        });
    }

    handleQuickAction(action) {
        switch(action) {
            case 'new-bill':
                this.switchSection('billing');
                break;
            case 'add-product':
                this.switchSection('shop');
                break;
            case 'check-weather':
                this.switchSection('weather');
                break;
            case 'emi-calculator':
                this.switchSection('tools');
                this.openTool('emi');
                break;
        }
    }

    // Database Initialization
    initDatabase() {
        // Initialize IndexedDB or use localStorage fallback
        this.db = {
            products: JSON.parse(localStorage.getItem('products')) || [],
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            expenses: JSON.parse(localStorage.getItem('expenses')) || [],
            todos: JSON.parse(localStorage.getItem('todos')) || [],
            wallet: JSON.parse(localStorage.getItem('wallet')) || { balance: 0, history: [] }
        };
    }

    // Dashboard Updates
    updateDashboard() {
        // Update sales figures
        const today = new Date().toDateString();
        const thisMonth = new Date().getMonth();
        
        let todaySales = 0;
        let monthlySales = 0;
        let lowStock = 0;
        let pendingBills = 0;

        this.db.transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.toDateString() === today) {
                todaySales += transaction.amount;
            }
            if (transactionDate.getMonth() === thisMonth) {
                monthlySales += transaction.amount;
            }
        });

        this.db.products.forEach(product => {
            if (product.stock <= product.minStock) {
                lowStock++;
            }
        });

        document.getElementById('today-sales').textContent = `₹${todaySales.toLocaleString('en-IN')}`;
        document.getElementById('monthly-sales').textContent = `₹${monthlySales.toLocaleString('en-IN')}`;
        document.getElementById('low-stock').textContent = lowStock;
        document.getElementById('pending-bills').textContent = pendingBills;

        // Update transaction list
        this.updateTransactionList();
    }

    updateTransactionList() {
        const container = document.getElementById('transaction-list');
        const recentTransactions = this.db.transactions.slice(-5).reverse();
        
        if (recentTransactions.length === 0) {
            container.innerHTML = '<p class="empty-state">No recent transactions</p>';
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-details">
                    <h4>${transaction.customer || 'Unknown Customer'}</h4>
                    <p>${new Date(transaction.date).toLocaleString('en-IN')}</p>
                </div>
                <div class="transaction-amount ${transaction.type === 'sale' ? '' : 'negative'}">
                    ₹${transaction.amount.toLocaleString('en-IN')}
                </div>
            </div>
        `).join('');
    }

    // Billing Functions
    generateInvoice() {
        const customerName = document.getElementById('customer-name').value;
        const customerMobile = document.getElementById('customer-mobile').value;
        
        const items = [];
        let subtotal = 0;
        let totalGST = 0;
        
        document.querySelectorAll('.item-row').forEach(row => {
            const name = row.querySelector('.item-name').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const gst = parseFloat(row.querySelector('.item-gst').value) || 0;
            
            if (name && qty && price) {
                const itemTotal = qty * price;
                const itemGST = (itemTotal * gst) / 100;
                
                items.push({
                    name,
                    qty,
                    price,
                    gst,
                    total: itemTotal + itemGST
                });
                
                subtotal += itemTotal;
                totalGST += itemGST;
            }
        });
        
        const total = subtotal + totalGST;
        
        // Update invoice preview
        document.getElementById('invoice-customer-name').textContent = customerName;
        document.getElementById('invoice-customer-mobile').textContent = customerMobile;
        document.getElementById('invoice-date').textContent = new Date().toLocaleDateString('en-IN');
        document.getElementById('invoice-subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('invoice-gst').textContent = totalGST.toFixed(2);
        document.getElementById('invoice-total').textContent = total.toFixed(2);
        
        // Update items table
        const itemsBody = document.getElementById('invoice-items-body');
        itemsBody.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.gst}%</td>
                <td>₹${item.total.toFixed(2)}</td>
            </tr>
        `).join('');
        
        // Show modal
        document.getElementById('invoice-modal').classList.add('active');
        
        // Save transaction
        this.saveTransaction({
            customer: customerName,
            amount: total,
            date: new Date().toISOString(),
            type: 'sale',
            items
        });
    }

    saveTransaction(transaction) {
        this.db.transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.db.transactions));
        this.updateDashboard();
        this.showToast('Invoice generated successfully!', 'success');
    }

    // Weather Function
    async getWeather() {
        const pincode = document.getElementById('pincode-input').value;
        if (!pincode || pincode.length !== 6) {
            this.showToast('Please enter a valid 6-digit PIN code', 'error');
            return;
        }

        // Simulate API call with mock data
        setTimeout(() => {
            const mockWeather = {
                location: 'Mumbai, Maharashtra',
                temperature: 32,
                description: 'Sunny',
                humidity: 65,
                windSpeed: 12,
                pressure: 1013
            };

            document.getElementById('weather-location').textContent = mockWeather.location;
            document.getElementById('weather-temp').textContent = `${mockWeather.temperature}°C`;
            document.getElementById('weather-desc').textContent = mockWeather.description;
            document.getElementById('humidity').textContent = `${mockWeather.humidity}%`;
            document.getElementById('wind-speed').textContent = `${mockWeather.windSpeed} km/h`;
            document.getElementById('pressure').textContent = `${mockWeather.pressure} hPa`;
            
            document.getElementById('weather-result').style.display = 'block';
            this.showToast('Weather data updated', 'success');
        }, 1000);
    }

    // EMI Calculator
    calculateEMI() {
        const loanAmount = parseFloat(document.getElementById('loan-amount').value);
        const interestRate = parseFloat(document.getElementById('interest-rate').value);
        const loanTenure = parseFloat(document.getElementById('loan-tenure').value);

        if (!loanAmount || !interestRate || !loanTenure) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        const monthlyRate = interestRate / (12 * 100);
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) / 
                   (Math.pow(1 + monthlyRate, loanTenure) - 1);
        
        const totalPayment = emi * loanTenure;
        const totalInterest = totalPayment - loanAmount;

        document.getElementById('monthly-emi').textContent = `₹${emi.toFixed(2)}`;
        document.getElementById('total-payment').textContent = `₹${totalPayment.toFixed(2)}`;
        document.getElementById('total-interest').textContent = `₹${totalInterest.toFixed(2)}`;
        
        document.getElementById('emi-result').style.display = 'block';
        this.showToast('EMI calculated successfully', 'success');
    }

    // Currency Converter
    convertCurrency() {
        const amount = parseFloat(document.getElementById('convert-amount').value);
        const from = document.getElementById('from-currency').value;
        const to = document.getElementById('to-currency').value;

        if (!amount) {
            this.showToast('Please enter amount', 'error');
            return;
        }

        // Mock exchange rates (INR as base)
        const rates = {
            INR: 1,
            USD: 83,
            EUR: 90,
            GBP: 102
        };

        const inrAmount = from === 'INR' ? amount : amount * rates[from];
        const resultAmount = to === 'INR' ? inrAmount : inrAmount / rates[to];
        const rate = rates[to] / rates[from];

        document.getElementById('converted-amount').textContent = 
            `${amount} ${from} = ${resultAmount.toFixed(2)} ${to}`;
        document.getElementById('exchange-rate').textContent = 
            `Exchange rate: 1 ${from} = ${rate.toFixed(4)} ${to}`;

        this.showToast('Currency converted', 'success');
    }

    // QR Generator
    generateQR() {
        const text = document.getElementById('qr-text').value;
        if (!text) {
            this.showToast('Please enter text for QR code', 'error');
            return;
        }

        // Mock QR generation
        const canvas = document.getElementById('qr-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 200;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(i * 10, j * 10, 10, 10);
                }
            }
        }
        
        document.getElementById('qr-result').style.display = 'block';
        this.showToast('QR Code generated', 'success');
    }

    // Chatbot Functions
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Process message and generate response
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "Hello! How can I assist you with your business today?";
        } else if (lowerMsg.includes('invoice') || lowerMsg.includes('bill')) {
            return "I can help you create invoices. Go to the GST Billing section to generate professional invoices with GST calculation.";
        } else if (lowerMsg.includes('weather')) {
            return "Check the weather in your area by entering your PIN code in the Weather section.";
        } else if (lowerMsg.includes('emi') || lowerMsg.includes('loan')) {
            return "Use the EMI calculator in the Tools section to calculate your monthly loan payments.";
        } else if (lowerMsg.includes('product') || lowerMsg.includes('inventory')) {
            return "Manage your products and inventory in the Shop Management section. You can add, edit, and track stock levels.";
        } else {
            return "I'm here to help with your business needs. You can ask about invoices, weather, EMI calculations, or product management.";
        }
    }

    startVoiceRecognition() {
        this.showToast('Voice recognition would be implemented in the mobile app version', 'info');
    }

    processCommand(command) {
        this.addMessage(command, 'user');
        
        setTimeout(() => {
            let response = '';
            switch(command.toLowerCase()) {
                case 'create invoice':
                    response = "I'll help you create an invoice. Please go to the GST Billing section and fill in the customer details and items.";
                    this.switchSection('billing');
                    break;
                case 'add product':
                    response = "Let's add a new product. Navigate to Shop Management and click 'Add Product'.";
                    this.switchSection('shop');
                    break;
                case 'check weather':
                    response = "To check weather, go to the Weather section and enter your PIN code.";
                    this.switchSection('weather');
                    break;
                case 'calculate emi':
                    response = "Opening EMI calculator...";
                    this.switchSection('tools');
                    this.openTool('emi');
                    break;
                case 'show sales report':
                    response = "Your sales reports are available in the Shop Management section under Sales Reports.";
                    this.switchSection('shop');
                    break;
                case 'add expense':
                    response = "Let's add an expense. Go to Customer Utilities and switch to the Expenses tab.";
                    this.switchSection('customer');
                    this.switchTab('expenses');
                    break;
                default:
                    response = "I've noted your command. How else can I assist you?";
            }
            this.addMessage(response, 'bot');
        }, 1000);
    }

    // Utility Functions
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type} ${this.isDarkMode ? 'dark-mode' : ''}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // PWA Setup
    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    // Load Sample Data
    loadSampleData() {
        if (this.db.products.length === 0) {
            this.db.products = [
                { id: 1, name: 'Rice 1kg', price: 45, stock: 50, minStock: 10 },
                { id: 2, name: 'Wheat Flour 1kg', price: 35, stock: 30, minStock: 15 },
                { id: 3, name: 'Sugar 1kg', price: 40, stock: 8, minStock: 10 }
            ];
            localStorage.setItem('products', JSON.stringify(this.db.products));
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vyaparHub = new VyaparHub();
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}