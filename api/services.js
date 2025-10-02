const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (event.httpMethod === 'GET') {
      const services = await sql`
        SELECT * FROM services 
        WHERE is_active = true 
        ORDER BY display_order, id
      `;
      return { statusCode: 200, headers, body: JSON.stringify(services) };
    }

    if (event.httpMethod === 'POST') {
      const { name, price_min, price_max, description, features, display_order } = JSON.parse(event.body);
      
      const result = await sql`
        INSERT INTO services (name, price_min, price_max, description, features, display_order)
        VALUES (${name}, ${price_min}, ${price_max}, ${description}, ${JSON.stringify(features)}, ${display_order || 0})
        RETURNING *
      `;
      
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }

    if (event.httpMethod === 'PUT') {
      const { id, name, price_min, price_max, description, features, display_order, is_active } = JSON.parse(event.body);
      
      const result = await sql`
        UPDATE services 
        SET name = ${name}, price_min = ${price_min}, price_max = ${price_max}, 
            description = ${description}, features = ${JSON.stringify(features)}, 
            display_order = ${display_order}, is_active = ${is_active}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await sql`DELETE FROM services WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Services API error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};