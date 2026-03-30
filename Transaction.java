package java;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Transaction {
    private int id;
    private int userId;
    private int bookId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private double fine;

    public Transaction(int id, int userId, int bookId) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.issueDate = LocalDate.now();
        this.dueDate = this.issueDate.plusDays(7);
        this.returnDate = null;
        this.fine = 0.0;
    }

    public void processReturn() {
        this.returnDate = LocalDate.now();
        if (this.returnDate.isAfter(this.dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(this.dueDate, this.returnDate);
            this.fine = daysLate * 10.0;
        }
    }

    public int getId() { return id; }
    public int getUserId() { return userId; }
    public int getBookId() { return bookId; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public double getFine() { return fine; }
}
