const { Client } = require('pg');
const crypto = require('crypto');
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

const AID = '03006b76-7c42-48e2-b379-29be0b11e283';
const now = new Date();
const ago = (d, h = 0) => { const t = new Date(now); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); return t; };
const ri = (a, b) => Math.floor(a + Math.random() * (b - a));
const rf = (a, b) => a + Math.random() * (b - a);

(async () => {
  await c.connect();
  console.log('🧠 Cortex Final Seed\n');
  const E = (await c.query('SELECT id FROM endpoints WHERE customer_id=$1', [AID])).rows.map(e => e.id);
  if (!E.length) { console.log('❌ No endpoints'); await c.end(); return; }
  console.log('Endpoints:', E.length);

  // 1. PROFILES
  console.log('👤 Profiles...');
  for (const e of E) {
    await c.query(`INSERT INTO endpoint_profiles (endpoint_id, latency_p50, latency_p95, latency_p99, latency_stddev, success_rate_1h, success_rate_24h, success_rate_7d, baseline_success_rate, avg_deliveries_per_hour, peak_deliveries_per_hour, traffic_pattern, dominant_error_type, error_distribution, busiest_hour, quietest_hour, weekday_avg, weekend_avg, sample_size, confidence, last_updated, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW()) ON CONFLICT (endpoint_id) DO UPDATE SET updated_at=NOW()`,
      [e, ri(80,180), ri(150,350), ri(300,600), rf(30,80), rf(.93,.99), rf(.92,.99), rf(.90,.98), rf(.91,.97), rf(20,100), rf(100,300), JSON.stringify({pattern:'business_hours'}), 'timeout', JSON.stringify({timeout:40,503:30}), 14, 3, rf(35,75), rf(10,30), ri(1000,6000), rf(.85,.95)]);
  }
  console.log('  ✅ ' + E.length);

  // 2. HOURLY STATS (840 = 5 eps * 7 days * 24 hours)
  console.log('📊 Hourly Stats...');
  let sc = 0;
  for (const e of E) { for (let d = 0; d < 7; d++) { for (let h = 0; h < 24; h++) {
    const vol = (h>=8&&h<=18) ? ri(40,100) : ri(5,20);
    const ok = Math.floor(vol * rf(.88,.99));
    await c.query('INSERT INTO endpoint_hourly_stats (endpoint_id,hour_start,total_deliveries,successful,failed,avg_latency_ms,p50_latency_ms,p95_latency_ms,p99_latency_ms,error_breakdown) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING',
      [e, ago(d,h), vol, ok, vol-ok, ri(80,280), ri(60,140), ri(150,450), ri(300,800), JSON.stringify({timeout:ri(0,5)})]);
    sc++;
  }}}
  console.log('  ✅ ' + sc);

  // 3. ANOMALIES (score = INTEGER!)
  console.log('🚨 Anomalies...');
  let ac = 0;
  for (const e of E) { for (let d = 0; d < 3; d++) { for (const cat of ['latency','failure_rate','volume','timeout','error_pattern']) {
    await c.query('INSERT INTO anomaly_scores (endpoint_id,customer_id,score,factors,category,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [e, AID, ri(30,99), JSON.stringify({baseline:50,current:ri(30,99),deviation:ri(5,40)}), cat, ago(d,ri(0,24))]);
    ac++;
  }}}
  console.log('  ✅ ' + ac);

  // 4. ML MODELS (training_samples = INTEGER!)
  console.log('🤖 ML Models...');
  let mc = 0;
  for (const e of E) { for (const mt of ['latency_predictor','failure_predictor','volume_forecaster','anomaly_detector']) {
    await c.query('INSERT INTO ml_models (endpoint_id,model_type,parameters,training_samples,last_trained,accuracy) VALUES ($1,$2,$3,$4,$5,$6)',
      [e, mt, JSON.stringify({n_estimators:100,max_depth:6}), ri(500,2500), ago(0,ri(0,12)), rf(.75,.95)]);
    mc++;
  }}
  console.log('  ✅ ' + mc);

  // 5. HEALING
  console.log('🔧 Healing...');
  const HA = [{t:'retry_slowdown',r:'Repeated failures'},{t:'circuit_break',r:'10 consecutive failures'},{t:'fallback_url',r:'Primary timeout'},{t:'rate_limit_reduce',r:'Overload'},{t:'auto_disable',r:'50% failure rate'}];
  let hc = 0;
  for (const e of E) { for (let d = 0; d < 5; d++) {
    const h = HA[ri(0,HA.length)];
    await c.query('INSERT INTO healing_actions (endpoint_id,action_type,reason,details,outcome,outcome_details,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [e, h.t, h.r, JSON.stringify({auto:true}), 'success', JSON.stringify({rate_after:rf(.95,.99)}), ago(d,ri(0,24))]);
    hc++;
  }}
  console.log('  ✅ ' + hc);

  // 6. DECISIONS
  console.log('🎯 Decisions...');
  const DC = [{t:'increase_retries',a:'retry_count=5',r:.85,rg:.02},{t:'switch_fallback',a:'fallback_activate',r:.92,rg:.01},{t:'reduce_timeout',a:'timeout=3000',r:.78,rg:.05},{t:'enable_circuit_breaker',a:'circuit_enable',r:.95,rg:.005}];
  let dc = 0;
  for (const e of E) { for (const m of DC) {
    await c.query('INSERT INTO ml_decisions (endpoint_id,decision_type,chosen_action,context,reward,regret,confidence,created_at,evaluated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL)',
      [e, m.t, m.a, JSON.stringify({anomaly:rf(.8,.95)}), m.r, m.rg, rf(.7,.95), ago(ri(0,3))]);
    dc++;
  }}
  console.log('  ✅ ' + dc);

  // 7. FEATURES (feature_value = double precision)
  console.log('📐 Features...');
  const FN = ['avg_latency','p95_latency','success_rate','volume','error_rate','retry_rate','timeout_rate','payload_size'];
  let fc = 0;
  for (const e of E) { for (let d = 0; d < 7; d++) { for (let h = 0; h < 24; h += 6) { for (const fn of FN) {
    await c.query('INSERT INTO ml_features (endpoint_id,feature_name,feature_value,context_hash,recorded_at) VALUES ($1,$2,$3,$4,$5)',
      [e, fn, fn.includes('rate') ? rf(.8,1) : rf(50,450), crypto.createHash('md5').update(e+d+h+fn).digest('hex').slice(0,16), ago(d,h)]);
    fc++;
  }}}}
  console.log('  ✅ ' + fc);

  // 8. TRACES (duration_ms = bigint, items_processed = bigint)
  console.log('🔍 Traces...');
  const ST = ['signal_collect','anomaly_detect','healing_eval','ml_predict','proactive_scan','drift_check'];
  let tc = 0;
  for (let d = 0; d < 7; d++) { for (const s of ST) {
    const ts = ago(d, ri(0,24)); const dur = ri(30,530);
    await c.query('INSERT INTO cortex_traces (run_id,stage_name,duration_ms,items_processed,status,error_message,started_at,completed_at) VALUES ($1,$2,$3,$4,$5,NULL,$6,$7)',
      ['run-'+d+'-'+s, s, dur, ri(10,110), Math.random()>.05?'success':'timeout', new Date(ts-dur), ts]);
    tc++;
  }}
  console.log('  ✅ ' + tc);

  // 9. AB TESTS
  console.log('🧪 AB Tests...');
  await c.query("INSERT INTO ab_tests (endpoint_id,model_type,variant_a,variant_b,split_ratio,metric,status,winner,created_at) VALUES ($1,'retry','{\"s\":\"exp\"}','{\"s\":\"lin\"}',.5,'success_rate','running',NULL,NOW()-INTERVAL '3 days'),($1,'timeout','{\"ms\":5000}','{\"ms\":10000}',.5,'p95_latency','completed','variant_b',NOW()-INTERVAL '7 days') ON CONFLICT DO NOTHING", [E[0]]);
  console.log('  ✅ 2');

  // 10. DRIFT (severity = double precision!, features_affected = jsonb!, detected_by = jsonb!)
  console.log('📈 Drift...');
  for (const e of E.slice(0,3)) { for (const d of [{t:'feature_drift',s:0.5,f:['avg_latency','p95_latency'],a:'Retrain'},{t:'concept_drift',s:0.8,f:['failure_rate'],a:'Reset model'},{t:'data_drift',s:0.3,f:['payload_size'],a:'Update baseline'}]) {
    await c.query('INSERT INTO ml_drift_events (endpoint_id,drift_type,severity,features_affected,detected_by,recommended_action,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [e,d.t,d.s,JSON.stringify(d.f),JSON.stringify({method:'statistical_test',p_value:rf(.001,.05)}),d.a,ago(ri(0,5))]);
  }}
  console.log('  ✅ drifts');

  // 11. QUALITY
  console.log('📊 Quality...');
  let mqc = 0;
  for (const e of E.slice(0,3)) { for (let d = 0; d < 7; d++) {
    const p = rf(100,300), a = p+(Math.random()-.5)*40, err = Math.abs(p-a);
    await c.query("INSERT INTO ml_model_quality (endpoint_id,model_type,predicted_value,actual_value,absolute_error,error_pct,within_tolerance,measured_at) VALUES ($1,'latency_predictor',$2,$3,$4,$5,$6,$7)",
      [e,p,a,err,((err/p)*100),err<p*.1,ago(d)]);
    mqc++;
  }}
  console.log('  ✅ ' + mqc);

  // 12. AUTOML
  console.log('🔬 AutoML...');
  for (let i = 0; i < 8; i++) {
    await c.query("INSERT INTO automl_trials (endpoint_id,model_type,params,score,metric,created_at) VALUES ($1,'latency_predictor',$2,$3,'mae',$4)",
      [E[0], JSON.stringify({n_estimators:50+i*20,max_depth:3+i}), 0.7+i*.03, ago(Math.floor(i/2),i*3)]);
  }
  console.log('  ✅ 8');

  // 13. INSIGHTS
  console.log('💡 Insights...');
  for (const ins of [{t:'performance',title:'Latency improving',body:'P95 decreased 15%',s:'info'},{t:'reliability',title:'Success rate stable',body:'All endpoints >95%',s:'info'},{t:'capacity',title:'Traffic spike expected',body:'2x at 14:00',s:'warning'},{t:'cost',title:'Retry optimization',body:'5→3 saves 20% bw',s:'info'}]) {
    await c.query('INSERT INTO cortex_insights (customer_id,insight_type,title,body,severity,action_url,data,dismissed,created_at) VALUES ($1,$2,$3,$4,$5,NULL,$6,false,$7)',
      [AID,ins.t,ins.title,ins.body,ins.s,JSON.stringify({}),ago(ri(0,3))]);
  }
  console.log('  ✅ 4');

  // VERIFY
  console.log('\n═══ SONUÇ ═══');
  for (const t of ['endpoint_profiles','endpoint_hourly_stats','anomaly_scores','ml_models','healing_actions','ml_decisions','ml_features','cortex_traces','ab_tests','ml_drift_events','ml_model_quality','automl_trials','cortex_insights']) {
    const r = await c.query('SELECT COUNT(*) FROM ' + t);
    console.log('  ' + t.padEnd(25) + r.rows[0].count);
  }
  console.log('\n✅ Dashboard > Cortex sayfasını yenileyin!');
  await c.end();
})();
