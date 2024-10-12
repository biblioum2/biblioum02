const { getRandomValues } = require("crypto");
const pool = require("../config/database");
const { Pool } = require("pg");

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


  const updateOrder = async (orderId, loanDate, returnDate) => {
    const query = `
        UPDATE orders
        SET  loan_date = $2, return_date = $3
        WHERE id = $1;
    `;
    console.log('datos desde update order: ', orderId, loanDate, returnDate);

    try {
        await pool.query('BEGIN');
        await pool.query(query, [orderId, loanDate, returnDate]);
        await pool.query('COMMIT');
        console.log(`Orden con ID ${orderId} actualizada correctamente.`);
    } catch (error) {
      await pool.query('ROLLBACK');
        console.error(`Error al actualizar la orden:`, error);
    }
};

const updateOrderStatus = async (orderId, status) => {
  const query = `
            UPDATE order_status
            SET status = $1
            WHERE order_id = $2;
        `;
        console.log('datos desde update status', orderId, status);
        
  try {
      await pool.query(query, [status, orderId]);
      console.log(`Orden con ID ${orderId} actualizada correctamente.`);
  } catch (error) {
      console.error(`Error al actualizar la orden:`, error);
  }
};

module.exports = {
  updateOrder,
  updateOrderStatus,
};
