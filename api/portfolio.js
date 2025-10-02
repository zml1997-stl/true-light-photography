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
      const { category, featured } = event.queryStringParameters || {};
      
      let query = 'SELECT * FROM portfolio_items WHERE 1=1';
      const params = [];
      
      if (category) {
        params.push(category);
        query += ` AND category = $${params.length}`;
      }
      
      if (featured === 'true') {
        query += ' AND is_featured = true';
      }
      
      query += ' ORDER BY display_order, created_at DESC';
      
      const items = await sql(query, params);
      return { statusCode: 200, headers, body: JSON.stringify(items) };
    }

    if (event.httpMethod === 'POST') {
      const { category, image_url, title, description, is_featured, display_order } = JSON.parse(event.body);
      
      const result = await sql`
        INSERT INTO portfolio_items (category, image_url, title, description, is_featured, display_order)
        VALUES (${category}, ${image_url}, ${title}, ${description}, ${is_featured || false}, ${display_order || 0})
        RETURNING *
      `;
      
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }

    if (event.httpMethod === 'PUT') {
      const { id, category, image_url, title, description, is_featured, display_order } = JSON.parse(event.body);
      
      const result = await sql`
        UPDATE portfolio_items 
        SET category = ${category}, image_url = ${image_url}, title = ${title}, 
            description = ${description}, is_featured = ${is_featured}, display_order = ${display_order}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await sql`DELETE FROM portfolio_items WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Portfolio API error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};