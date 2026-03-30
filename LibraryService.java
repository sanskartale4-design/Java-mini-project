package java;

import java.util.ArrayList;
import java.util.List;

public class LibraryService {
    private List<Book> books;
    private List<User> users;
    private List<Transaction> transactions;
    private int nextTxId = 1;

    public LibraryService() {
        this.books = new ArrayList<>();
        this.users = new ArrayList<>();
        this.transactions = new ArrayList<>();
    }

    public void addBook(Book book) {
        books.add(book);
    }

    public void registerUser(User user) {
        users.add(user);
    }

    public Transaction issueBook(int userId, int bookId) {
        Book book = findBookById(bookId);
        if (book != null && book.isAvailable()) {
            book.issue();
            Transaction tx = new Transaction(nextTxId++, userId, bookId);
            transactions.add(tx);
            return tx;
        }
        return null;
    }

    public Transaction returnBook(int txId) {
        Transaction tx = findTransactionById(txId);
        if (tx != null && tx.getReturnDate() == null) {
            tx.processReturn();
            Book book = findBookById(tx.getBookId());
            if (book != null) book.returnBook();
            return tx;
        }
        return null;
    }

    private Book findBookById(int id) {
        return books.stream().filter(b -> b.getId() == id).findFirst().orElse(null);
    }

    private Transaction findTransactionById(int id) {
        return transactions.stream().filter(t -> t.getId() == id).findFirst().orElse(null);
    }

    public List<Book> getAllBooks() { return books; }
    public List<Transaction> getAllTransactions() { return transactions; }
}
