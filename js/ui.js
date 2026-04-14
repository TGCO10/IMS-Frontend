class UI {
    static checkAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        // If on login page and has token, go to dashboard
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (token) window.location.href = 'pages/dashboard.html';
        } else {
            // If on secured page and no token, go to login
            if (!token) window.location.href = '../index.html';
        }
        
        // Render user info badge
        const userInfo = document.getElementById('userInfo');
        if (userInfo && user) {
            userInfo.textContent = `${user.name} ${user.isAdmin ? '(Admin)' : ''}`;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    static showMessage(elementId, msg, isError = false) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hide');
        el.className = `mt-tight align-center badge ${isError ? 'low' : 'ok'}`;
        el.style.display = 'block';
        setTimeout(() => {
            el.classList.add('hide');
        }, 3000);
    }

    static async initDashboard() {
        this.checkAuth();
        try {
            const stats = await API.getDashboardStats();
            document.getElementById('statTotalProducts').textContent = stats.totalProducts;
            document.getElementById('statTotalStock').textContent = stats.totalStock;
            document.getElementById('statTotalValue').textContent = this.formatCurrency(stats.totalValue);
            document.getElementById('statLowStock').textContent = stats.lowStockItems;

            const products = await API.getProducts();
            this.renderProductsTable(products, 'productsTableBody');
        } catch (error) {
            console.error(error);
        }
    }

    static renderProductsTable(products, tbodyId) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="align-center text-muted">No products found.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td style="font-weight: 500;">${p.name}</td>
                <td>${this.formatCurrency(p.price)}</td>
                <td>${p.quantity}</td>
                <td>
                    ${p.quantity < 10 ? '<span class="badge low">Low Stock</span>' : '<span class="badge ok">In Stock</span>'}
                </td>
            </tr>
        `).join('');
    }

    static async initAddProduct() {
        this.checkAuth();
        const form = document.getElementById('addProductForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;

            const productData = {
                name: document.getElementById('prodName').value,
                price: Number(document.getElementById('prodPrice').value),
                quantity: Number(document.getElementById('prodQty').value),
                description: document.getElementById('prodDesc').value
            };

            try {
                await API.createProduct(productData);
                this.showMessage('addProductMsg', 'Product added successfully!', false);
                form.reset();
            } catch (error) {
                this.showMessage('addProductMsg', error.message, true);
            } finally {
                btn.disabled = false;
            }
        });
    }

    static async initManageStock() {
        this.checkAuth();
        
        // Fetch products to populate dropdown and table
        await this.loadManageData();

        const form = document.getElementById('stockMovementForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                btn.disabled = true;

                const data = {
                    product: document.getElementById('stockProduct').value,
                    type: document.getElementById('stockType').value,
                    quantity: Number(document.getElementById('stockQty').value)
                };

                try {
                    await API.addStockMovement(data);
                    this.showMessage('stockMsg', 'Stock movement applied!', false);
                    form.reset();
                    await this.loadManageData(); // Refresh UI
                } catch (error) {
                    this.showMessage('stockMsg', error.message, true);
                } finally {
                    btn.disabled = false;
                }
            });
        }
    }

    static async loadManageData() {
        try {
            const products = await API.getProducts();
            
            // Populate Dropdown
            const select = document.getElementById('stockProduct');
            if (select) {
                select.innerHTML = '<option value="">-- Select Product --</option>' + products.map(p => `
                    <option value="${p._id}">${p.name} (Qty: ${p.quantity})</option>
                `).join('');
            }

            // Populate Table
            const tbody = document.getElementById('manageProductsTableBody');
            if (tbody) {
                if (products.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="align-center text-muted">No products found.</td></tr>';
                    return;
                }

                tbody.innerHTML = products.map(p => `
                    <tr>
                        <td style="font-weight: 500;">${p.name}</td>
                        <td>${this.formatCurrency(p.price)}</td>
                        <td>${p.quantity}</td>
                        <td style="display:flex; gap:0.5rem;">
                            <button class="btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick='UI.openEditProduct(${JSON.stringify(p)})'>Edit</button>
                            <button class="btn btn-danger" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="UI.deleteProduct('${p._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error(error);
        }
    }

    static openEditProduct(product) {
        document.getElementById('editModal').classList.remove('hide');
        document.getElementById('editId').value = product._id;
        document.getElementById('editName').value = product.name;
        document.getElementById('editPrice').value = product.price;

        const form = document.getElementById('editForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const updateProps = {
                name: document.getElementById('editName').value,
                price: Number(document.getElementById('editPrice').value)
            };

            try {
                await API.updateProduct(id, updateProps);
                document.getElementById('editModal').classList.add('hide');
                this.loadManageData();
            } catch(e) {
                alert(e.message);
            }
        };
    }

    static async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await API.deleteProduct(id);
            this.loadManageData();
        } catch (error) {
            alert(error.message);
        }
    }
}

// Global logout hook
document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn') {
        e.preventDefault();
        UI.logout();
    }
});