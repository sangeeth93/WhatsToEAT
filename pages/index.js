// pages/api/onboarding.js
import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

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

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    // 1) Insert into users table
    const userResult = await client.query(
      'INSERT INTO users (whatsapp_number, email) VALUES ($1, $2) RETURNING id',
      [whatsappNumber, email]
    );
    const userId = userResult.rows[0].id;

    // 2) Insert into profiles table
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

    // 3) Insert each allergy
    const allergyList = allergies
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length);

    for (const allergy of allergyList) {
      await client.query(
        'INSERT INTO allergies (user_id, allergy) VALUES ($1, $2)',
        [userId, allergy]
      );
    }

    return res.status(200).json({ success: true, userId });
  } catch (error) {
    console.error('Database insertion error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
}
