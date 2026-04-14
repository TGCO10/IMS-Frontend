const BACKEND_URL = 'https://backend-inventory-management-system.onrender.com/api';

class API {
    static getToken() {
        return localStorage.getItem('token');
    }

    static getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    static async request(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                headers: this.getHeaders()
            };
            if (data) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${BACKEND_URL}${endpoint}`, config);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // --- User APIs ---
    static login(email, password) {
        return this.request('/users/login', 'POST', { email, password });
    }

    static register(name, email, password) {
        return this.request('/users', 'POST', { name, email, password });
    }

    // --- Product APIs ---
    static getProducts() {
        return this.request('/products', 'GET');
    }

    static createProduct(productData) {
        return this.request('/products', 'POST', productData);
    }

    static updateProduct(id, productData) {
        return this.request(`/products/${id}`, 'PUT', productData);
    }

    static deleteProduct(id) {
        return this.request(`/products/${id}`, 'DELETE');
    }

    // --- Stock APIs ---
    static getDashboardStats() {
        return this.request('/stock/stats', 'GET');
    }

    static addStockMovement(data) {
        return this.request('/stock', 'POST', data);
    }
}