import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) =>{
    console.error(err, "\nSomething unexpected happened while connecting with the database")
    process.exit(-1);
})

export {pool};