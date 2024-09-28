const pool = require("../config/database");

const getBooks = async (limit, offset) => {
    const query = `
  SELECT *
  FROM books
  LIMIT $1 OFFSET $2;
    `;
    const values = [limit, offset];
    try {
      const res = await pool.query(query, values);
      // console.log(`LIBROS: ${res.rows}`);
      const data= JSON.stringify(res.rows);
      // console.log(data);
      console.log(res.rows);
       res.rows;
    } catch (error) {
      console.log("Error al obtener los libros", error);
    }
  };

  module.exports = {

  }