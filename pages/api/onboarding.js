// pages/api/onboarding.js
import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  // Retrieve the connection string from Vercel environment
  const dbUrlRaw = process.env.DATABASE_URL;
  if (!dbUrlRaw) {
    console.error('🚨 Missing DATABASE_URL!');
    return res.status(500).json({ error: 'Server misconfiguration: DATABASE_URL not set' });
  }

  // Parse the URL into connection parameters
  const { hostname: host, port, username: user, password, pathname } = new URL(dbUrlRaw);
  const database = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  // Create a new client with SSL enabled for Supabase
  const client = new Client({
    host,
    port: parseInt(port, 10),
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const {
      whatsappNumber,
      email,
      age,
      heightCm,
      weightKg,
      targetWeightKg,
      preferences,
      allergies,
      vegDays,
    } = req.body;

    // Insert user
    const userRes = await client.query(
      'INSERT INTO users (whatsapp_number, email) VALUES ($1, $2) RETURNING id',
      [whatsappNumber, email]
    );
    const userId = userRes.rows[0].id;

    // Insert profile
    await client.query(
      `INSERT INTO profiles
         (user_id, age, height_cm, weight_kg, target_weight_kg, preferences, veg_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        age,
        heightCm,
        weightKg,
        targetWeightKg,
        preferences,
        JSON.stringify(vegDays),
      ]
    );

    // Insert allergies if any
    if (allergies) {
      const list = allergies.split(',').map(a => a.trim()).filter(a => a);
      for (const allergy of list) {
        await client.query(
          'INSERT INTO allergies (user_id, allergy) VALUES ($1, $2)',
          [userId, allergy]
        );
      }
    }

    return res.status(200).json({ success: true, userId });
  } catch (error) {
    console.error('Database error in /api/onboarding:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
}
