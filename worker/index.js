export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    if (url.pathname === '/api/server-info') {
      try {
        const cached = await env.CACHE.get('server-info', 'json');
        
        if (cached && cached.timestamp && (Date.now() - cached.timestamp) < env.CACHE_TTL * 1000) {
          return new Response(JSON.stringify(cached.data), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=300',
              ...corsHeaders
            }
          });
        }

        const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${env.GUILD_ID}?with_counts=true`, {
          headers: {
            'Authorization': `Bot ${env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!guildResponse.ok) {
          throw new Error(`Discord API error: ${guildResponse.status}`);
        }

        const guild = await guildResponse.json();

        const data = {
          name: guild.name,
          memberCount: guild.approximate_member_count,
          onlineCount: guild.approximate_presence_count,
          iconUrl: guild.icon 
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=128`
            : null,
          bannerUrl: guild.banner 
            ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : null
        };

        await env.CACHE.put('server-info', JSON.stringify({
          data,
          timestamp: Date.now()
        }), { expirationTtl: env.CACHE_TTL });

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders
          }
        });

      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch server info',
          message: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    if (url.pathname === '/api/reviews') {
      try {
        const cached = await env.CACHE.get('reviews', 'json');
        
        if (cached && cached.timestamp && (Date.now() - cached.timestamp) < 3600 * 1000) {
          return new Response(JSON.stringify(cached.data), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600',
              ...corsHeaders
            }
          });
        }

        const reviewsResponse = await fetch(`https://disboard.org/es/server/reviews/${env.GUILD_ID}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!reviewsResponse.ok) {
          throw new Error(`Disboard error: ${reviewsResponse.status}`);
        }

        const html = await reviewsResponse.text();
        const reviews = parseReviews(html);

        await env.CACHE.put('reviews', JSON.stringify({
          data: reviews,
          timestamp: Date.now()
        }), { expirationTtl: 3600 });

        return new Response(JSON.stringify(reviews), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });

      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch reviews',
          message: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

function parseReviews(html) {
  const reviews = [];
  const reviewBlocks = html.split('class="review"').slice(1);
  
  for (const block of reviewBlocks.slice(0, 6)) {
    try {
      const authorMatch = block.match(/class="review-owner-name[^>]*>([^<]+)</);
      const author = authorMatch ? authorMatch[1].trim() : 'Anónimo';
      
      const dateMatch = block.match(/class="review-date"[^>]*>([^<]+)</);
      const date = dateMatch ? dateMatch[1].trim() : '';
      
      const ratingMatch = block.match(/class="star-rating"[^>]*data-rating="(\d+)"/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 5;
      
      const titleMatch = block.match(/class="review-title"[^>]*>([^<]+)</);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      const bodyMatch = block.match(/class="review-body"[^>]*>([\s\S]*?)<\/div>/);
      const body = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      if (author && body) {
        reviews.push({
          author,
          date,
          rating,
          title,
          body: body.substring(0, 200) + (body.length > 200 ? '...' : '')
        });
      }
    } catch (e) {
      continue;
    }
  }
  
  return reviews;
}
