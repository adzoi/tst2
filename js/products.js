// products.js - product data loading, search, filtering, categories
export class ProductService {
  constructor({ fallback = [] } = {}) {
    this.products = [];
    this.filteredProducts = [];
    this.categories = [];
    this.fallback = fallback;
    this.loadError = null;
  }

  async load() {
    try {
      // First, try to load from products.json
      const response = await fetch('./products.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        this.products = data;
        console.log(`✅ Loaded ${this.products.length} products from products.json`);
        this.loadError = null;
      } else {
        throw new Error('products.json is empty or invalid');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load products.json, using fallback data:', error.message);
      
      // Fall back to embedded data
      if (this.fallback && Array.isArray(this.fallback) && this.fallback.length > 0) {
        this.products = this.fallback;
        console.log(`✅ Loaded ${this.products.length} products from embedded fallback data`);
        this.loadError = new Error(`Using fallback data: ${error.message}`);
      } else {
        // No fallback data available
        this.products = [];
        console.error('💥 CRITICAL: No embedded product data available!');
        this.loadError = new Error('No embedded product data available');
        throw new Error('No products available - no embedded data');
      }
    }
    
    // Merge admin products from localStorage
    const adminProducts = JSON.parse(localStorage.getItem('admin-products') || '[]');
    if (adminProducts.length > 0) {
      this.products = [...this.products, ...adminProducts];
      console.log(`✅ Merged ${adminProducts.length} admin products`);
    }
    
    this.filteredProducts = [...this.products];
    this.categories = [...new Set(this.products.map(p => p.category))].sort();
    return this.products;
  }

  getProducts() { return this.products; }
  getFiltered() { return this.filteredProducts; }
  getCategories() { return this.categories; }
  getLoadError() { return this.loadError; }
  hasError() { return this.loadError !== null; }

  search(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredProducts = [...this.products];
      return this.filteredProducts;
    }
    this.filteredProducts = this.products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.active_ingredient || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
    return this.filteredProducts;
  }

  filterByCategory(category) {
    if (!category || category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    return this.filteredProducts;
  }

  sortBy({ key, order = 'asc' }) {
    const dir = order === 'desc' ? -1 : 1;
    const sorted = [...this.filteredProducts].sort((a, b) => {
      if (key === 'name') return a.name.localeCompare(b.name) * dir;
      if (key === 'price') return (a.price - b.price) * dir;
      return 0;
    });
    this.filteredProducts = sorted;
    return this.filteredProducts;
  }
}
