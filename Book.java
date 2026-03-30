package java;

public class Book {
    private int id;
    private String title;
    private String author;
    private String category;
    private int quantity;
    private int available;

    public Book(int id, String title, String author, String category, int quantity) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.quantity = quantity;
        this.available = quantity;
    }

    // Getters and Setters
    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    public int getQuantity() { return quantity; }
    public int getAvailable() { return available; }

    public void setAvailable(int available) { this.available = available; }
    
    public boolean isAvailable() {
        return available > 0;
    }

    public void issue() {
        if (isAvailable()) available--;
    }

    public void returnBook() {
        if (available < quantity) available++;
    }
}
