import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max:10
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:\n", error.message);
    process.exit(1);
  }
};

export default pool;