const { getRandomValues } = require("crypto");
const pool = require("../config/database");

// Category
async function updateCategory(id, name) {
    const query = `
        UPDATE categories
        SET name = $1
        WHERE id = $2
        RETURNING *;
    `;
    const values = [name, id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error("Error updating category", err);
    }
  }
  
// BOOKS UPDATE
async function updateBook(
    id,
    title,
    author,
    isbn,
    publication_year,
    available_copies
  ) {
    const query = `
        UPDATE books
        SET title = $1, author = $2, isbn = $3, publication_year = $4, available_copies = $5
        WHERE id = $6
        RETURNING *;
    `;
    const values = [title, author, isbn, publication_year, available_copies, id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error("Error updating book", err);
    }
  }

module.exports = {
};
