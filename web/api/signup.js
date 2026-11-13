import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, source = 'landing' } = req.body || {}

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO signups (email, source) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET source = EXCLUDED.source RETURNING id, email, created_at',
      [email.trim().toLowerCase(), source]
    )

    return res.status(200).json({
      success: true,
      message: 'Signup registered successfully!',
      signup: result.rows[0]
    })
  } catch (err) {
    console.error('Signup DB Error:', err)
    return res.status(500).json({
      error: 'Failed to record signup.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}
