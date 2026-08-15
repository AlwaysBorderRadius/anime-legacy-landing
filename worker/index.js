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

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
