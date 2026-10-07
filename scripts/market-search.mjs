import { marketSearch } from './search-content.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => Number.isFinite(value) ? value.toLocaleString('en-US', {maximumFractionDigits:2}) : 'Unavailable';

export function marketSearchHtml(snapshot) {
  return `<!-- MARKET-SEARCH:START -->
    <section class="signals-section decision-guides" id="business-decisions" aria-labelledby="decision-title">
      <div class="signals-section-heading"><div><h2 id="decision-title">Business loan, hiring &amp; pricing decisions</h2></div><p>Use national economic data alongside your own costs, demand, and cash flow.</p></div>
      <p class="decision-byline">Published by RE IMAGE Business Solutions, Hartford, Connecticut · Guidance reviewed <time datetime="${marketSearch.reviewed}">October 6, 2026</time></p>
      <div class="decision-grid">${marketSearch.decisions.map(item=>`<article id="${item.id}"><h3>${escape(item.title)}</h3><p>${escape(item.answer)}</p><h4>Which signals matter?</h4><p>${escape(item.signals)}</p><h4>Put it into practice</h4><p>${escape(item.action)}</p><a href="${item.link}">${escape(item.linkLabel)}</a><p class="decision-source"><a href="${item.source}" target="_blank" rel="noopener noreferrer">${escape(item.sourceLabel)}</a></p></article>`).join('')}</div>
      <p class="signals-small">This is general business-planning information. The model does not assess a particular loan, employee, or price change. Review commitments using your business records and qualified advice where needed.</p>
    </section>
    <section class="signals-section decision-faq" id="business-decisions-faq" aria-labelledby="decision-faq-title">
      <div class="signals-section-heading"><div><h2 id="decision-faq-title">Business decision questions</h2></div></div>
      <div class="method-notes">${marketSearch.faqs.map(([question,answer])=>`<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div>
    </section>
    <section class="signals-section published-data" id="published-economic-data" aria-labelledby="published-data-title">
      <h2 id="published-data-title">Published small-business economic indicators</h2>
      <p>Latest published snapshot: <time datetime="${escape(snapshot.updated_at)}">${escape(snapshot.updated_at)}</time>. Observation dates show when each measurement applies.</p>
      <div class="signals-table-wrap"><table><caption>FRED and BLS economic observations used by RE IMAGE</caption><thead><tr><th scope="col">Indicator</th><th scope="col">Level</th><th scope="col">Units</th><th scope="col">Annual change</th><th scope="col">Observed</th></tr></thead><tbody>${snapshot.indicators.map(item=>`<tr><th scope="row"><a href="${escape(item.source_url)}">${escape(item.name)}</a></th><td>${number(item.current)}</td><td>${escape(item.unit)}</td><td>${number(item.change)}${Number.isFinite(item.change) ? ` ${escape(item.change_unit)}` : ''}</td><td><time datetime="${item.observation_date}">${item.observation_date}</time></td></tr>`).join('')}</tbody></table></div>
      <p>M2 year-to-date growth: ${number(snapshot.m2_projection.ytd_growth)}${Number.isFinite(snapshot.m2_projection.ytd_growth)?'%':''}. Linear annual projection: ${number(snapshot.m2_projection.projected_annual_growth)}${Number.isFinite(snapshot.m2_projection.projected_annual_growth)?'%':''}. Projection year: ${snapshot.m2_projection.year}. <a href="#methodology">Model methodology</a> · <a href="/data/market/latest.json">Download the JSON snapshot</a>.</p>
    </section>
    <!-- MARKET-SEARCH:END -->`;
}

export function marketSearchSchema(snapshot, canonical) {
  return [
    {'@type':'BreadcrumbList','@id':`${canonical}#breadcrumb`,itemListElement:[
      {'@type':'ListItem',position:1,name:'RE IMAGE',item:'https://reimagebs.com/'},
      {'@type':'ListItem',position:2,name:'Market Signals',item:canonical}
    ]},
    {'@type':'FAQPage','@id':`${canonical}#business-decisions-faq`,mainEntity:marketSearch.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))},
    {'@type':'Dataset','@id':`${canonical}#economic-data`,name:'RE IMAGE small-business economic indicators and M2 projection',description:'Published FRED and BLS observations, observation dates, and the RE IMAGE weighted business-pressure model. M2 is a linear money-supply projection, not a forecast of consumer inflation.',url:`${canonical}#published-economic-data`,creator:{'@id':'https://reimagebs.com/#organization'},dateModified:snapshot.updated_at,measurementTechnique:`${canonical}#methodology`,variableMeasured:snapshot.indicators.map(item=>({'@type':'PropertyValue',name:item.name,propertyID:item.source_series,unitText:item.unit})),citation:snapshot.indicators.map(item=>item.source_url),distribution:[{'@type':'DataDownload',contentUrl:'https://reimagebs.com/data/market/latest.json',encodingFormat:'application/json'}]},
    ...marketSearch.decisions.map(item=>({'@type':'WebPageElement','@id':`${canonical}#${item.id}`,name:item.title,description:item.answer,isPartOf:{'@id':`${canonical}#webpage`}}))
  ];
}
