// Transaction Logic Module
const TransactionManager = {
    getTransactions: () => JSON.parse(localStorage.getItem('transactions')) || [],
    saveTransactions: (txs) => localStorage.setItem('transactions', JSON.stringify(txs)),

    issueBook: (userId, bookId) => {
        const books = BookManager.getBooks();
        const book = books.find(b => b.id === parseInt(bookId));
        if (book && book.available > 0) {
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(issueDate.getDate() + 7);

            const tx = {
                id: Date.now(),
                userId: parseInt(userId),
                bookId: parseInt(bookId),
                issueDate: issueDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                returnDate: null,
                fine: 0
            };

            const transactions = TransactionManager.getTransactions();
            transactions.push(tx);
            TransactionManager.saveTransactions(transactions);

            // Update Book Availability
            book.available--;
            BookManager.saveBooks(books);
            return { success: true, tx };
        }
        return { success: false, message: 'Book not available' };
    },

    returnBook: (txId) => {
        const transactions = TransactionManager.getTransactions();
        const tx = transactions.find(t => t.id === txId);
        if (tx && !tx.returnDate) {
            const returnDate = new Date();
            tx.returnDate = returnDate.toISOString().split('T')[0];

            // Calculate Fine (₹10/day)
            const dueDate = new Date(tx.dueDate);
            if (returnDate > dueDate) {
                const diffTime = Math.abs(returnDate - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                tx.fine = diffDays * 10;
            }

            TransactionManager.saveTransactions(transactions);

            // Update Book Availability
            const books = BookManager.getBooks();
            const book = books.find(b => b.id === tx.bookId);
            if (book) {
                book.available++;
                BookManager.saveBooks(books);
            }
            return { success: true, tx };
        }
        return { success: false, message: 'Transaction not found or already returned' };
    },

    getUserTransactions: (userId) => {
        return TransactionManager.getTransactions().filter(t => t.userId === userId);
    }
};
