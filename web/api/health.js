import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT NOW() as current_time, version() as pg_version')
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      time: rows[0].current_time,
      version: rows[0].pg_version
    })
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    })
  }
}
