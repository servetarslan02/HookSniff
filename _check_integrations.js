const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

(async () => {
  await c.connect();
  try {
    // Check tables exist
    const tables = await c.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('connectors','connector_configs','integrations','integration_events','stream_channels','stream_subscriptions','stream_messages') ORDER BY table_name"
    );
    console.log('=== Integration Tables ===');
    console.table(tables.rows);

    // Check connector data
    const connectors = await c.query("SELECT name, display_name, is_active FROM connectors ORDER BY name");
    console.log('\n=== Connectors ===');
    console.table(connectors.rows);

    // Check connector_configs
    const cc = await c.query("SELECT COUNT(*) as total FROM connector_configs");
    console.log('\nConnector configs:', cc.rows[0].total);

    // Check integrations
    const ig = await c.query("SELECT COUNT(*) as total FROM integrations");
    console.log('Integrations:', ig.rows[0].total);

    // Check integration_events
    const ev = await c.query("SELECT COUNT(*) as total FROM integration_events");
    console.log('Integration events:', ev.rows[0].total);

    // Check stream tables
    const sch = await c.query("SELECT COUNT(*) as total FROM stream_channels");
    console.log('Stream channels:', sch.rows[0].total);

    const ssub = await c.query("SELECT COUNT(*) as total FROM stream_subscriptions");
    console.log('Stream subscriptions:', ssub.rows[0].total);

    const smsg = await c.query("SELECT COUNT(*) as total FROM stream_messages");
    console.log('Stream messages:', smsg.rows[0].total);

    // Check connector supported_events
    const ce = await c.query("SELECT name, supported_events FROM connectors ORDER BY name");
    console.log('\n=== Connector Events ===');
    ce.rows.forEach(r => console.log(r.name + ': ' + JSON.stringify(r.supported_events)));

    // Check integration route on API
    console.log('\n=== Integration System Status ===');
    console.log('✅ Tables exist');
    console.log('✅ ' + connectors.rows.length + ' connectors seeded');
    console.log('✅ ' + cc.rows[0].total + ' connector configs');
    console.log('✅ ' + ig.rows[0].total + ' integrations');
    console.log('✅ ' + sch.rows[0].total + ' stream channels');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await c.end();
})();
