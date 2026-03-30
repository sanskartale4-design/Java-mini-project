document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return; // index.html should have handled redirection

    const isPage = (id) => !!document.getElementById(id);
    const isAdmin = currentUser.role === 'admin';

    // Sidebar Navigation logic
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.section;
            
            navItems.forEach(ni => ni.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(s => s.style.display = 'none');
            const targetSection = document.getElementById(target + 'Section');
            if (targetSection) targetSection.style.display = 'block';

            const sectionTitle = document.getElementById('sectionTitle');
            if (sectionTitle) sectionTitle.textContent = item.textContent.trim();

            renderActiveSection(target);
        });
    });

    // Helper: Render table rows
    function renderTable(tableId, data, columns, actions) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                if (typeof col === 'function') {
                    td.innerHTML = col(item);
                } else {
                    td.innerText = item[col];
                }
                tr.appendChild(td);
            });

            if (actions) {
                const tdAction = document.createElement('td');
                actions(item, tdAction);
                tr.appendChild(tdAction);
            }
            tbody.appendChild(tr);
        });
    }

    function renderActiveSection(section) {
        switch(section) {
            case 'overview': renderOverview(); break;
            case 'books': renderAdminBooks(); break;
            case 'users': renderAdminUsers(); break;
            case 'transactions': renderAdminTransactions(); break;
            case 'allBooks': renderUserBrowse(); break;
            case 'myBooks': renderUserMyBooks(); break;
        }
    }

    // Admin Rendering
    function renderOverview() {
        const books = BookManager.getBooks();
        const txs = TransactionManager.getTransactions();
        const users = JSON.parse(localStorage.getItem('users')) || [];

        document.getElementById('totalBooks').textContent = books.length;
        document.getElementById('availableBooks').textContent = books.reduce((sum, b) => sum + b.available, 0);
        document.getElementById('issuedBooks').textContent = txs.filter(t => !t.returnDate).length;
        document.getElementById('totalUsersCount').textContent = users.length;

        // Recent transactions table
        const recentTxs = txs.slice(-5).reverse();
        renderTable('recentTransactionsTable', recentTxs, [
            (tx) => {
                const user = users.find(u => u.id === tx.userId);
                return user ? user.name : 'Unknown';
            },
            (tx) => {
                const book = books.find(b => b.id === tx.bookId);
                return book ? book.title : 'Deleted Book';
            },
            'issueDate',
            'dueDate',
            (tx) => `<span class="badge ${tx.returnDate ? 'badge-success' : 'badge-warning'}">${tx.returnDate ? 'Returned' : 'Pending'}</span>`
        ]);
    }

    function renderAdminBooks() {
        const books = BookManager.getBooks();
        renderTable('booksTable', books, [
            'id', 'title', 'author', 'category',
            (b) => `${b.available} / ${b.quantity}`
        ], (book, cell) => {
            cell.innerHTML = `
                <button class="btn-sm" onclick="editBook(${book.id})" style="background:#4f46e5; color:white; border:none; padding:4px 8px; border-radius:4px; margin-right:4px;">Edit</button>
                <button class="btn-sm" onclick="deleteBook(${book.id})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px;">Del</button>
            `;
        });
    }

    function renderAdminUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        renderTable('usersTable', users, ['id', 'name', 'email', 'role'], (u, cell) => {
            if (u.role !== 'admin') {
                cell.innerHTML = `<button class="btn-sm" onclick="deleteUser(${u.id})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px;">Delete</button>`;
            }
        });
    }

    function renderAdminTransactions() {
        const txs = TransactionManager.getTransactions();
        const books = BookManager.getBooks();
        const users = JSON.parse(localStorage.getItem('users')) || [];

        renderTable('allTransactionsTable', txs, [
            'id',
            (tx) => users.find(u => u.id === tx.userId)?.name || 'N/A',
            (tx) => books.find(b => b.id === tx.bookId)?.title || 'N/A',
            'issueDate', 'dueDate',
            (tx) => tx.returnDate || '-',
            (tx) => `₹${tx.fine}`
        ], (tx, cell) => {
            if (!tx.returnDate) {
                cell.innerHTML = `<button onclick="handleReturn(${tx.id})" style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:4px;">Return</button>`;
            }
        });
    }

    // User Rendering
    function renderUserBrowse() {
        const books = BookManager.getBooks();
        renderTable('userBooksTable', books, [
            'title', 'author', 'category',
            (b) => `<span class="badge ${b.available > 0 ? 'badge-success' : 'badge-danger'}">${b.available > 0 ? 'Available' : 'Out of Stock'}</span>`
        ], (book, cell) => {
            if (book.available > 0) {
               cell.innerHTML = `<button onclick="handleIssue(${book.id})" style="background:#4f46e5; color:white; border:none; padding:4px 12px; border-radius:4px;">Borrow</button>`;
            }
        });
    }

    function renderUserMyBooks() {
        const myTxs = TransactionManager.getUserTransactions(currentUser.id);
        const books = BookManager.getBooks();
        renderTable('myIssuedTable', myTxs, [
            (tx) => books.find(b => b.id === tx.bookId)?.title || 'Deleted Book',
            'issueDate', 'dueDate',
            (tx) => `₹${tx.fine}`
        ], (tx, cell) => {
            if (!tx.returnDate) {
                cell.innerHTML = `<button onclick="handleReturn(${tx.id})" style="background:#10b981; color:white; border:none; padding:4px 12px; border-radius:4px;">Return Book</button>`;
            } else {
                cell.innerHTML = `<span class="badge badge-success">Returned</span>`;
            }
        });
    }

    // Modal Handling
    const modalOverlay = document.getElementById('modalOverlay');
    const modalForm = document.getElementById('modalForm');
    const closeModal = document.getElementById('closeModal');

    if (closeModal) closeModal.onclick = () => modalOverlay.style.display = 'none';

    window.editBook = (id) => {
        const book = BookManager.getBooks().find(b => b.id === id);
        if (!book) return;
        document.getElementById('modalTitle').textContent = 'Edit Book';
        modalForm.innerHTML = `
            <input type="hidden" id="edit-id" value="${book.id}">
            <div class="form-group"><label>Title</label><input type="text" id="edit-title" value="${book.title}" required></div>
            <div class="form-group"><label>Author</label><input type="text" id="edit-author" value="${book.author}" required></div>
            <div class="form-group"><label>Category</label><input type="text" id="edit-category" value="${book.category}" required></div>
            <div class="form-group"><label>Quantity</label><input type="number" id="edit-quantity" value="${book.quantity}" required></div>
        `;
        modalOverlay.style.display = 'flex';
        modalForm.onsubmit = (e) => {
            e.preventDefault();
            const q = parseInt(document.getElementById('edit-quantity').value);
            BookManager.updateBook(id, {
                title: document.getElementById('edit-title').value,
                author: document.getElementById('edit-author').value,
                category: document.getElementById('edit-category').value,
                quantity: q,
                available: q // Simple update for demo
            });
            modalOverlay.style.display = 'none';
            renderAdminBooks();
        };
    };

    window.deleteBook = (id) => {
        if (confirm('Are you sure you want to delete this book?')) {
            BookManager.deleteBook(id);
            renderAdminBooks();
        }
    };

    window.deleteUser = (id) => {
        if (confirm('Delete this user?')) {
            const users = JSON.parse(localStorage.getItem('users')).filter(u => u.id !== id);
            localStorage.setItem('users', JSON.stringify(users));
            renderAdminUsers();
        }
    };

    window.handleReturn = (txId) => {
        if (confirm('Confirm book return?')) {
            const res = TransactionManager.returnBook(txId);
            if (res.success) {
                alert(`Book returned successfully. Fine: ₹${res.tx.fine}`);
                if (isAdmin) renderAdminTransactions();
                else renderUserMyBooks();
            }
        }
    };

    window.handleIssue = (bookId) => {
        if (confirm('Borrow this book?')) {
            const res = TransactionManager.issueBook(currentUser.id, bookId);
            if (res.success) {
                alert('Book issued! Return within 7 days.');
                renderUserBrowse();
            } else {
                alert(res.message);
            }
        }
    };

    // Global Add Book
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.onclick = () => {
            document.getElementById('modalTitle').textContent = 'Add New Book';
            modalForm.innerHTML = `
                <div class="form-group"><label>Title</label><input type="text" id="add-title" required></div>
                <div class="form-group"><label>Author</label><input type="text" id="add-author" required></div>
                <div class="form-group"><label>Category</label><input type="text" id="add-category" required></div>
                <div class="form-group"><label>Total Quantity</label><input type="number" id="add-quantity" required></div>
            `;
            modalOverlay.style.display = 'flex';
            modalForm.onsubmit = (e) => {
                e.preventDefault();
                BookManager.addBook(
                    document.getElementById('add-title').value,
                    document.getElementById('add-author').value,
                    document.getElementById('add-category').value,
                    document.getElementById('add-quantity').value
                );
                modalOverlay.style.display = 'none';
                renderAdminBooks();
            };
        };
    }

    // Global Issue Book (Admin)
    const issueBookBtn = document.getElementById('issueBookBtn');
    if (issueBookBtn) {
        issueBookBtn.onclick = () => {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const books = BookManager.getBooks().filter(b => b.available > 0);
            
            document.getElementById('modalTitle').textContent = 'Issue Book (Admin)';
            modalForm.innerHTML = `
                <div class="form-group">
                    <label>Select User</label>
                    <select id="issue-user">${users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}</select>
                </div>
                <div class="form-group">
                    <label>Select Book</label>
                    <select id="issue-book">${books.map(b => `<option value="${b.id}">${b.title} (${b.available} left)</option>`).join('')}</select>
                </div>
            `;
            modalOverlay.style.display = 'flex';
            modalForm.onsubmit = (e) => {
                e.preventDefault();
                TransactionManager.issueBook(
                    document.getElementById('issue-user').value,
                    document.getElementById('issue-book').value
                );
                modalOverlay.style.display = 'none';
                renderAdminTransactions();
            };
        };
    }

    // Initialize Page
    if (isPage('overviewSection')) renderOverview();
    if (isPage('allBooksSection')) renderUserBrowse();

    // Setup search listeners
    const bookSearch = document.getElementById('bookSearch');
    if (bookSearch) {
        bookSearch.oninput = () => {
            const results = BookManager.searchBooks(bookSearch.value);
            renderTable('booksTable', results, ['id', 'title', 'author', 'category', (b) => `${b.available} / ${b.quantity}`]);
        };
    }

    const userBookSearch = document.getElementById('userBookSearch');
    if (userBookSearch) {
        userBookSearch.oninput = () => {
            const results = BookManager.searchBooks(userBookSearch.value);
            renderTable('userBooksTable', results, [
                'title', 'author', 'category',
                (b) => `<span class="badge ${b.available > 0 ? 'badge-success' : 'badge-danger'}">${b.available > 0 ? 'Available' : 'Out of Stock'}</span>`
            ], (book, cell) => {
                if (book.available > 0) cell.innerHTML = `<button onclick="handleIssue(${book.id})" style="background:#4f46e5; color:white; border:none; padding:4px 12px; border-radius:4px;">Borrow</button>`;
            });
        };
    }
});
