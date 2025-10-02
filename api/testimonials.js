const { neon } = require(’@neondatabase/serverless’);

exports.handler = async (event) => {
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’,
‘Content-Type’: ‘application/json’
};

if (event.httpMethod === ‘OPTIONS’) {
return { statusCode: 200, headers, body: ‘’ };
}

const sql = neon(process.env.DATABASE_URL);

try {
if (event.httpMethod === ‘GET’) {
const testimonials = await sql`SELECT * FROM testimonials  WHERE is_active = true  ORDER BY display_order, created_at DESC`;

```
  return { statusCode: 200, headers, body: JSON.stringify(testimonials) };
}

if (event.httpMethod === 'POST') {
  const { author_name, testimonial_text, rating, display_order } = JSON.parse(event.body);
  
  const result = await sql`
    INSERT INTO testimonials (author_name, testimonial_text, rating, display_order)
    VALUES (${author_name}, ${testimonial_text}, ${rating || 5}, ${display_order || 0})
    RETURNING *
  `;
  
  return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
}

if (event.httpMethod === 'PUT') {
  const { id, author_name, testimonial_text, rating, display_order, is_active } = JSON.parse(event.body);
  
  const result = await sql`
    UPDATE testimonials 
    SET author_name = ${author_name}, testimonial_text = ${testimonial_text}, 
        rating = ${rating}, display_order = ${display_order}, is_active = ${is_active}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
}

if (event.httpMethod === 'DELETE') {
  const { id } = JSON.parse(event.body);
  await sql`DELETE FROM testimonials WHERE id = ${id}`;
  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
}

return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
```

} catch (error) {
console.error(‘Testimonials API error:’, error);
return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
}
};