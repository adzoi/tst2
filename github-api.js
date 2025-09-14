// GitHub API Integration for updating products.json
class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseURL = 'https://api.github.com';
  }

  // Get current products.json content
  async getProducts() {
    try {
      const response = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/products.json`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      const content = atob(data.content.replace(/\s/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Update products.json with new product
  async addProduct(newProduct) {
    try {
      // Get current products
      const currentProducts = await this.getProducts();
      
      // Add new product
      currentProducts.push(newProduct);
      
      // Get current file info
      const fileResponse = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/products.json`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const fileData = await fileResponse.json();
      
      // Update the file
      const updateResponse = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/products.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add new product: ${newProduct.name}`,
          content: btoa(JSON.stringify(currentProducts, null, 2)),
          sha: fileData.sha
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Failed to update products: ${errorData.message}`);
      }

      return await updateResponse.json();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Get repository info
  async getRepoInfo() {
    try {
      const response = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repo info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repo info:', error);
      throw error;
    }
  }
}

// Export for use in admin.html
window.GitHubAPI = GitHubAPI;
