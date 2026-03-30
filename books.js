// Book Management Module
const BookManager = {
    getBooks: () => JSON.parse(localStorage.getItem('books')) || [],
    saveBooks: (books) => localStorage.setItem('books', JSON.stringify(books)),

    addBook: (title, author, category, quantity) => {
        const books = BookManager.getBooks();
        const newBook = {
            id: Date.now(),
            title,
            author,
            category,
            quantity: parseInt(quantity),
            available: parseInt(quantity)
        };
        books.push(newBook);
        BookManager.saveBooks(books);
        return newBook;
    },

    updateBook: (id, updatedData) => {
        let books = BookManager.getBooks();
        books = books.map(book => book.id === id ? { ...book, ...updatedData } : book);
        BookManager.saveBooks(books);
    },

    deleteBook: (id) => {
        let books = BookManager.getBooks();
        books = books.filter(book => book.id !== id);
        BookManager.saveBooks(books);
    },

    searchBooks: (query) => {
        const books = BookManager.getBooks();
        const q = query.toLowerCase();
        return books.filter(b => 
            b.title.toLowerCase().includes(q) || 
            b.author.toLowerCase().includes(q) || 
            b.category.toLowerCase().includes(q)
        );
    }
};

// Initial Sample Data if empty
if (BookManager.getBooks().length === 0) {
    const samples = [
        { id: 101, title: "Atomic Habits", author: "James Clear", category: "Self-help", quantity: 5, available: 5 },
        { id: 102, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", quantity: 3, available: 3 },
        { id: 103, title: "Clean Code", author: "Robert C. Martin", category: "Technology", quantity: 2, available: 1 }
    ];
    BookManager.saveBooks(samples);
}
