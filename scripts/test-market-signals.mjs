import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSnapshot, snapshotState, formatChange, loadIndicators } from '../market-signals.js';

const weights = { M2SL:.25, PPIFIS:.25, ENERGY_FUEL:.20, FEDFUNDS:.10, LABOR_COST:.15, CPIAUCSL:.05 };
const snapshot = () => ({
  schema_version: 1, updated_at:'2026-10-06T12:00:00Z',
  indicators: [...Object.keys(weights),'UMCSENT'].map(series=>({series, current:100, change:2, observation_date:'2026-08-01', source_url:'https://fred.stlouisfed.org/series/M2SL'})),
  m2_projection:{year:2026, months_covered:8, ytd_growth:4, projected_annual_growth:6},
  pressure_signal:{score:50, components:Object.entries(weights).map(([series,weight])=>({series,weight,contribution:weight*50}))},
  trend_signal:{label:'Stable'},
});

test('valid snapshot and correct 48-hour freshness boundary',()=>{
  const data = validateSnapshot(snapshot());
  assert.equal(snapshotState(data,new Date('2026-10-08T12:00:00Z')).stale,false);
  assert.equal(snapshotState(data,new Date('2026-10-08T12:00:01Z')).stale,true);
});
test('new year hides last year’s score and projection',()=>{
  const state = snapshotState(snapshot(),new Date('2027-01-01T00:00:00Z'));
  assert.equal(state.score,null);
  assert.equal(state.projection,null);
});
test('malformed, incomplete, and unsafe snapshot rejected',()=>{
  for (const modify of [d=>d.indicators.pop(),d=>d.indicators[0].current=null,d=>d.indicators[0].current='100',d=>d.updated_at='invalid',d=>d.m2_projection.months_covered=13,d=>d.pressure_signal.score=101,d=>d.pressure_signal.components[0].contribution=null,d=>d.indicators[0].source_url='javascript:alert(1)']) {
    const data=snapshot(); modify(data); assert.throws(()=>validateSnapshot(data));
  }
});
test('explicit unavailable score is accepted without making it zero',()=>{
  const data=snapshot();data.pressure_signal.score=null;data.pressure_signal.components[0].contribution=null;
  assert.equal(validateSnapshot(data).pressure_signal.score,null);
});
test('correct annual-change units and null behavior',()=>{
  assert.equal(formatChange({series:'FEDFUNDS',change:-.5}),'-0.50 pp over 12 months');
  assert.equal(formatChange({series:'UMCSENT',change:3}),'+3.00 points over 12 months');
  assert.equal(formatChange({series:'CPIAUCSL',change:2}),'+2.00% year over year');
  assert.equal(formatChange({series:'CPIAUCSL',change:null}),'Annual comparison unavailable');
});

test('HTTP failures and malformed JSON show unavailable state',async()=>{
  const originalFetch=globalThis.fetch;
  const elements=new Map();
  globalThis.document={getElementById(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',style:{},hidden:true});return elements.get(id);}};
  try {
    for(const response of [{ok:false},{ok:true,json:async()=>{throw new SyntaxError('Invalid JSON');}},{ok:true,json:async()=>({})}]) {
      globalThis.fetch=async()=>response;
      await loadIndicators();
      assert.equal(elements.get('pressureTier').textContent,'Score unavailable');
      assert.match(elements.get('dataStatus').textContent,/temporarily unavailable/);
    }
  } finally {globalThis.fetch=originalFetch;delete globalThis.document;}
});
