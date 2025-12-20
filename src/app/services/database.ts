// Database Service - LocalStorage based for persistent data
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: 'pelanggan' | 'admin';
  joinDate: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  weight: number;
  totalCost: number;
  status: 'Antrian' | 'Proses' | 'Selesai' | 'Siap Diambil';
  createdAt: string;
  updatedAt: string;
  estimatedTime: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Lunas';
  date: string;
}

class Database {
  private static instance: Database;

  private constructor() {
    this.initializeDatabase();
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private initializeDatabase() {
    // Initialize with default data if empty
    if (!localStorage.getItem('users')) {
      const defaultUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@laundry.com',
          phone: '08111111111',
          username: 'umar',
          password: 'umar123',
          role: 'admin',
          joinDate: new Date().toISOString(),
        },
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('packages')) {
      const defaultPackages: Package[] = [
        { id: '1', name: 'Cuci Kering', price: 7000, description: 'Cuci bersih dan keringkan' },
        { id: '2', name: 'Cuci Setrika', price: 10000, description: 'Cuci, setrika, dan lipat rapi' },
        { id: '3', name: 'Setrika Saja', price: 5000, description: 'Setrika dan lipat rapi' },
        { id: '4', name: 'Cuci Lipat', price: 8000, description: 'Cuci dan lipat rapi' },
      ];
      localStorage.setItem('packages', JSON.stringify(defaultPackages));
    }

    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify([]));
    }

    if (!localStorage.getItem('transactions')) {
      localStorage.setItem('transactions', JSON.stringify([]));
    }
  }

  // Users
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Packages
  getPackages(): Package[] {
    return JSON.parse(localStorage.getItem('packages') || '[]');
  }

  getPackageById(id: string): Package | null {
    const packages = this.getPackages();
    return packages.find(p => p.id === id) || null;
  }

  addPackage(pkg: Package): void {
    const packages = this.getPackages();
    packages.push(pkg);
    localStorage.setItem('packages', JSON.stringify(packages));
  }

  updatePackage(id: string, updates: Partial<Package>): void {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      packages[index] = { ...packages[index], ...updates };
      localStorage.setItem('packages', JSON.stringify(packages));
    }
  }

  deletePackage(id: string): void {
    const packages = this.getPackages().filter(p => p.id !== id);
    localStorage.setItem('packages', JSON.stringify(packages));
  }

  // Orders
  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }

  getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return this.getOrders().filter(o => o.customerId === customerId);
  }

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  updateOrder(id: string, updates: Partial<Order>): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }

  deleteOrder(id: string): void {
    const orders = this.getOrders().filter(o => o.id !== id);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  // Transactions
  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  getTransactionById(id: string): Transaction | null {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === id) || null;
  }

  getTransactionsByCustomerId(customerId: string): Transaction[] {
    return this.getTransactions().filter(t => t.customerId === customerId);
  }

  getTransactionByOrderId(orderId: string): Transaction | null {
    const transactions = this.getTransactions();
    return transactions.find(t => t.orderId === orderId) || null;
  }

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }

  // Statistics
  getTotalRevenue(): number {
    const transactions = this.getTransactions().filter(t => t.paymentStatus === 'Lunas');
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalOrders(): number {
    return this.getOrders().length;
  }

  getTotalCustomers(): number {
    return this.getUsers().filter(u => u.role === 'pelanggan').length;
  }

  getOrdersByStatus(status: string): Order[] {
    return this.getOrders().filter(o => o.status === status);
  }
}

export const db = Database.getInstance();
