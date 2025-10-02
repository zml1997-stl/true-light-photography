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
const { slug } = event.queryStringParameters || {};

```
  if (slug) {
    // Get single post by slug
    const post = await sql`
      SELECT * FROM blog_posts 
      WHERE slug = ${slug} AND is_published = true
    `;
    
    if (post.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Post not found' }) };
    }
    
    return { statusCode: 200, headers, body: JSON.stringify(post[0]) };
  }
  
  // Get all published posts
  const posts = await sql`
    SELECT * FROM blog_posts 
    WHERE is_published = true 
    ORDER BY published_date DESC
  `;
  
  return { statusCode: 200, headers, body: JSON.stringify(posts) };
}

if (event.httpMethod === 'POST') {
  const { title, slug, excerpt, content, image_url, published_date, is_published } = JSON.parse(event.body);
  
  const result = await sql`
    INSERT INTO blog_posts (title, slug, excerpt, content, image_url, published_date, is_published)
    VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${image_url}, ${published_date}, ${is_published || false})
    RETURNING *
  `;
  
  return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
}

if (event.httpMethod === 'PUT') {
  const { id, title, slug, excerpt, content, image_url, published_date, is_published } = JSON.parse(event.body);
  
  const result = await sql`
    UPDATE blog_posts 
    SET title = ${title}, slug = ${slug}, excerpt = ${excerpt}, content = ${content}, 
        image_url = ${image_url}, published_date = ${published_date}, is_published = ${is_published},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  
  return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
}

if (event.httpMethod === 'DELETE') {
  const { id } = JSON.parse(event.body);
  await sql`DELETE FROM blog_posts WHERE id = ${id}`;
  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
}

return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
```

} catch (error) {
console.error(‘Blog API error:’, error);
return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
}
};