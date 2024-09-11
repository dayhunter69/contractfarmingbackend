// This is a placeholder for a potential Book model
// If you decide to use an ORM like Sequelize in the future, you can define your model here

class Book {
  constructor(title, desc, cover, price) {
    this.title = title;
    this.desc = desc;
    this.cover = cover;
    this.price = price;
  }
}

export default Book;
