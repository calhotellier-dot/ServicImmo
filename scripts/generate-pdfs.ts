import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { marked } from 'marked';

const OUT_DIR = resolve(process.cwd(), 'docs/pdf');

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  @page {
    size: A4;
    margin: 22mm 20mm 22mm 20mm;
    @bottom-left { content: 'Document confidentiel'; font-family: Inter, sans-serif; font-size: 9pt; color: #888; }
    @bottom-right { content: 'Page ' counter(page) ' / ' counter(pages); font-family: Inter, sans-serif; font-size: 9pt; color: #888; }
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a1a;
    font-size: 10.5pt;
    line-height: 1.55;
  }

  h1 { font-size: 24pt; font-weight: 700; color: #1a1a1a; margin: 0 0 8pt; line-height: 1.15; page-break-after: avoid; }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 14pt; font-weight: 700; color: #1a1a1a; margin: 22pt 0 6pt; padding-top: 8pt; border-top: 1.5pt solid #6d28d9; page-break-after: avoid; page-break-before: auto; }
  h3 { font-size: 11.5pt; font-weight: 600; color: #4c1d95; margin: 14pt 0 4pt; page-break-after: avoid; }
  h4 { font-size: 10.5pt; font-weight: 600; color: #1a1a1a; margin: 10pt 0 3pt; page-break-after: avoid; }

  /* keep heading + following block together */
  h2 + p, h2 + ul, h2 + ol, h2 + table, h2 + blockquote { page-break-before: avoid; }
  h3 + p, h3 + ul, h3 + ol, h3 + table, h3 + blockquote { page-break-before: avoid; }

  p { margin: 0 0 8pt; orphans: 3; widows: 3; }
  ul, ol { margin: 6pt 0 10pt; padding-left: 18pt; page-break-inside: avoid; }
  li { margin-bottom: 3pt; }
  table, blockquote { page-break-inside: avoid; }

  blockquote {
    margin: 10pt 0;
    padding: 10pt 14pt;
    background: #f5f3ff;
    border-left: 3pt solid #6d28d9;
    color: #1a1a1a;
    font-size: 10pt;
  }
  blockquote p:first-child strong:first-child { color: #6d28d9; letter-spacing: 0.04em; font-size: 9pt; text-transform: uppercase; }

  code { background: #f5f3ff; padding: 1pt 4pt; border-radius: 2pt; font-size: 9.5pt; color: #4c1d95; }
  pre { background: #f5f3ff; padding: 8pt; border-radius: 3pt; font-size: 9pt; overflow-x: auto; }
  pre code { background: none; padding: 0; color: #1a1a1a; }

  table { border-collapse: collapse; width: 100%; margin: 8pt 0 14pt; font-size: 9.5pt; }
  th { background: #4c1d95; color: white; text-align: left; padding: 6pt 8pt; font-weight: 600; font-size: 9pt; letter-spacing: 0.02em; }
  td { padding: 5pt 8pt; border-bottom: 0.5pt solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }

  hr { border: none; border-top: 1pt solid #e5e7eb; margin: 16pt 0; }

  a { color: #6d28d9; text-decoration: none; }

  .header {
    display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 0.5pt solid #e5e7eb; padding-bottom: 6pt; margin-bottom: 14pt;
    font-size: 9pt;
  }
  .header .brand { color: #6d28d9; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .header .ref { color: #6b7280; }
`;

function htmlShell(title: string, body: string, brand = "Propul'SEO") {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${BASE_CSS}</style>
</head>
<body>
<div class="header">
  <span class="brand">${brand}</span>
  <span class="ref">${title}</span>
</div>
${body}
</body>
</html>`;
}

async function mdToPdf(mdPath: string, outPdf: string, title: string) {
  const md = await readFile(mdPath, 'utf8');
  const body = await marked.parse(md);
  const html = htmlShell(title, body);
  const htmlPath = outPdf.replace(/\.pdf$/, '.html');
  await writeFile(htmlPath, html, 'utf8');

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
  await browser.close();
  console.log(`✓ ${outPdf}`);
}

const PROPAL_V2_HTML = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Proposition Servicimmo × Propul'SEO — v2</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @page { size: A4; margin: 20mm 18mm 22mm 18mm;
    @bottom-left { content: 'Document confidentiel'; font-family: Inter, sans-serif; font-size: 9pt; color: #888; }
    @bottom-right { content: 'Page ' counter(page) ' / ' counter(pages); font-family: Inter, sans-serif; font-size: 9pt; color: #888; }
  }
  * { box-sizing: border-box; }
  body { font-family: Inter, sans-serif; color: #1a1a1a; font-size: 10pt; line-height: 1.5; margin: 0; }
  h3, h4, .callout, .callout-dark, .step-row, .obj-row, .zone, .deliv, table { page-break-inside: avoid; }
  ul, ol { page-break-inside: avoid; }
  .top { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 6pt; border-bottom: 0.5pt solid #e5e7eb; margin-bottom: 16pt; font-size: 9pt; }
  .top .brand { color: #6d28d9; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .top .ref { color: #6b7280; }
  .page { page-break-after: always; padding-top: 0; }
  .page:last-child { page-break-after: auto; }
  .label { color: #6d28d9; font-size: 9pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4pt; }
  h1.cover { font-size: 32pt; font-weight: 700; line-height: 1.1; margin: 14pt 0 18pt; }
  h1.cover .accent { color: #6d28d9; display: block; }
  h2.section { font-size: 18pt; font-weight: 700; margin: 0 0 14pt; padding-top: 6pt; }
  h3 { font-size: 11pt; font-weight: 600; color: #4c1d95; margin: 11pt 0 4pt; }
  h4 { font-size: 10pt; font-weight: 600; margin: 8pt 0 3pt; }
  p { margin: 0 0 7pt; }
  .rule { border: none; border-top: 1.5pt solid #6d28d9; width: 100%; margin: 10pt 0 14pt; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin-top: 18pt; }
  .meta-card { border: 0.5pt solid #d1d5db; padding: 12pt 14pt; }
  .meta-card .k { color: #6d28d9; font-size: 8pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 5pt; }
  .meta-card .v { font-weight: 600; }
  .meta-card .v2 { color: #6b7280; font-style: italic; font-size: 9pt; }
  .meta-card a { color: #6d28d9; text-decoration: none; }
  .footer-line { display: flex; gap: 18pt; margin-top: 28pt; font-size: 9pt; padding-top: 10pt; border-top: 0.5pt solid #e5e7eb; }
  .footer-line .lbl { color: #6b7280; }
  .footer-line .val { font-weight: 600; }
  .callout { background: #f5f3ff; border-left: 3pt solid #6d28d9; padding: 10pt 14pt; margin: 12pt 0; font-size: 10pt; }
  .callout .ttl { color: #6d28d9; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 5pt; }
  .callout-dark { background: #2e1065; color: white; padding: 12pt 14pt; margin: 14pt 0; font-size: 10pt; }
  .callout-dark .ttl { color: #c4b5fd; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 5pt; }
  .obj-grid { display: grid; gap: 8pt; margin-top: 8pt; }
  .obj-row { display: grid; grid-template-columns: 70pt 1fr; align-items: stretch; border: 0.5pt solid #e5e7eb; }
  .obj-num { background: #6d28d9; color: white; font-size: 22pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .obj-body { padding: 8pt 12pt; }
  .obj-body h4 { margin: 0 0 2pt; font-size: 11pt; }
  .obj-body .sub { color: #6b7280; font-style: italic; font-size: 9pt; margin-bottom: 4pt; }
  .obj-body ul { margin: 4pt 0 0; padding-left: 14pt; font-size: 9.5pt; }
  .obj-body li { margin-bottom: 1pt; }
  .pillars { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10pt; margin: 12pt 0 14pt; }
  .pillar { background: #2e1065; color: white; padding: 12pt; }
  .pillar .num { color: #c4b5fd; font-size: 8pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6pt; }
  .pillar .ttl { font-size: 12pt; font-weight: 600; margin-bottom: 4pt; }
  .pillar .desc { font-size: 9pt; font-style: italic; color: #c4b5fd; margin-bottom: 10pt; }
  .pillar .role-lbl { color: #c4b5fd; font-size: 8pt; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; padding-top: 8pt; border-top: 0.5pt solid #6d28d9; }
  .pillar .role { font-size: 9.5pt; margin-top: 3pt; }
  .step-row { display: grid; grid-template-columns: 32pt 1fr; align-items: stretch; border: 0.5pt solid #e5e7eb; margin-bottom: 4pt; }
  .step-num { background: #6d28d9; color: white; font-size: 13pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .step-body { padding: 6pt 10pt; }
  .step-body .ttl { font-weight: 600; font-size: 10.5pt; }
  .step-body .sub { color: #6b7280; font-style: italic; font-size: 9pt; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; }
  .zone { border: 0.5pt solid #d1d5db; padding: 10pt 14pt; margin-bottom: 10pt; }
  .zone .lbl { color: #6d28d9; font-size: 8pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4pt; }
  .zone .desc { color: #6b7280; font-style: italic; font-size: 9pt; margin-bottom: 6pt; }
  .zone ul { margin: 4pt 0 0; padding-left: 16pt; font-size: 9.5pt; }
  .zone li { margin-bottom: 3pt; }
  .zone li.bonus { color: #4c1d95; font-weight: 500; }
  .zone li.bonus em { display: block; color: #6b7280; font-weight: normal; font-size: 8.5pt; margin-top: 1pt; }
  .badge { display: inline-block; background: #6d28d9; color: white; font-size: 7.5pt; font-weight: 600; padding: 1pt 5pt; border-radius: 2pt; letter-spacing: 0.06em; margin-left: 4pt; }
  table.tarif { width: 100%; border-collapse: collapse; margin-top: 6pt; font-size: 8.5pt; page-break-inside: auto; }
  table.tarif thead th { background: #1a1a1a; color: white; text-align: left; padding: 5pt 8pt; font-weight: 600; font-size: 8.5pt; }
  table.tarif thead th:last-child { text-align: right; }
  table.tarif tbody tr.phase td { background: #f5f3ff; font-weight: 600; padding: 4pt 8pt; }
  table.tarif tbody tr.phase td.amount { text-align: right; color: #6d28d9; }
  table.tarif tbody tr.line td { padding: 2pt 8pt 2pt 18pt; border-bottom: 0.5pt solid #e5e7eb; font-size: 8.5pt; }
  table.tarif tbody tr.total td { background: #6d28d9; color: white; font-weight: 700; padding: 6pt 8pt; font-size: 9.5pt; }
  table.tarif tbody tr.total td.amount { text-align: right; }
  .modal { font-size: 8.5pt; color: #6b7280; margin-top: 6pt; }
  .modal .lbl { color: #6d28d9; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; font-size: 8pt; }
  .signature-box { border: 1pt solid #6d28d9; padding: 16pt 18pt; margin-top: 18pt; }
  .signature-box .lbl { color: #6d28d9; font-size: 8pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14pt; }
  .signature-box .field { margin-bottom: 14pt; }
  .signature-box .field .k { font-size: 9pt; color: #1a1a1a; margin-bottom: 4pt; }
  .signature-box .field .k em { color: #6b7280; font-style: italic; font-weight: normal; }
  .signature-box .field .underline { border-bottom: 0.5pt solid #1a1a1a; height: 14pt; }
  .signature-box .field.tall .underline { height: 60pt; }
  .timeline { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin: 10pt 0; }
  .timeline th { background: #2e1065; color: white; padding: 6pt; text-align: left; font-weight: 600; font-size: 8pt; }
  .timeline th.weeks { text-align: center; }
  .timeline td { padding: 6pt; border-bottom: 0.5pt solid #e5e7eb; vertical-align: middle; }
  .timeline td.phase { background: #6d28d9; color: white; text-align: center; font-weight: 700; font-size: 11pt; width: 40pt; }
  .timeline td.scope { width: 130pt; }
  .timeline td.scope .ttl { font-weight: 600; }
  .timeline td.scope .sub { font-style: italic; color: #6b7280; font-size: 8.5pt; }
  .timeline td.bar { padding: 0; }
  .timeline .bar-grid { display: grid; grid-template-columns: repeat(16, 1fr); height: 22pt; }
  .timeline .bar-grid div { border-right: 0.5pt solid #f3f4f6; }
  .timeline .bar-grid div.fill { background: #6d28d9; }
  .deliv { display: grid; grid-template-columns: 90pt 1fr; align-items: stretch; border: 0.5pt solid #e5e7eb; margin-bottom: 4pt; }
  .deliv .lbl { background: #4c1d95; color: white; font-size: 8pt; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; display: flex; align-items: center; justify-content: center; }
  .deliv .body { padding: 8pt 12pt; font-size: 9.5pt; }
</style></head>
<body>

<!-- Page 1 — Couverture -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Propul'SEO · Proposition commerciale · v2</div>
  <h1 class="cover">Proposition d'accompagnement <span class="accent">digital</span></h1>
  <hr class="rule">
  <h3>Servicimmo × Propul'SEO</h3>
  <p style="font-style: italic; color: #6b7280;">Site internet · Plateforme métier · Stratégie digitale</p>
  <div class="meta-grid">
    <div class="meta-card"><div class="k">De</div><div class="v">Étienne Guimbard</div><div class="v2">Propul'SEO · Fondateur</div><a href="mailto:team@propulseo-site.com">team@propulseo-site.com</a></div>
    <div class="meta-card"><div class="k">Pour</div><div class="v">Fanny &amp; Jacques-Alexandre</div><div class="v2">Servicimmo · Direction</div><div class="v2">Indre-et-Loire · Diagnostic immobilier</div></div>
  </div>
  <div class="footer-line"><span><span class="lbl">Édité le</span> <span class="val">26 avril 2026</span></span><span><span class="lbl">Validité</span> <span class="val">30 jours</span></span></div>
</section>

<!-- Page 2 — Contexte & vision -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 1</div><h2 class="section">Contexte &amp; vision</h2><hr class="rule">
  <h3>Là où Servicimmo se situe aujourd'hui</h3>
  <p>Servicimmo est aujourd'hui un acteur reconnu du diagnostic immobilier en Indre-et-Loire, avec une expertise technique solide et un volume d'activité régulier.</p>
  <p>Cependant, l'organisation actuelle repose encore sur des processus majoritairement manuels, plusieurs outils non centralisés, des doubles saisies fréquentes, une dépendance forte aux échanges téléphoniques et une gestion partiellement papier.</p>
  <div class="callout"><div class="ttl">Ce que cela entraîne concrètement</div>
    <ul style="margin: 0; padding-left: 14pt;">
      <li>Une perte de temps importante au quotidien</li>
      <li>Un risque accru d'erreurs de saisie et de suivi</li>
      <li>Une difficulté structurelle à faire monter l'activité en volume</li>
      <li>Une sous-exploitation de la donnée client déjà présente dans l'entreprise</li>
    </ul>
  </div>
  <h3>Notre vision pour ce projet</h3>
  <p><strong>Ce projet ne consiste pas à refaire un site internet.</strong> Il s'agit de construire un écosystème digital complet, structuré autour de votre métier, pensé pour durer et pour accompagner la croissance de Servicimmo sur les dix prochaines années.</p>
  <p>Concrètement, cet écosystème vous permettra :</p>
  <ul>
    <li>D'automatiser les tâches à faible valeur ajoutée</li>
    <li>De centraliser toute l'information au même endroit</li>
    <li>De fluidifier vos opérations du premier contact à la clôture du dossier</li>
    <li>D'améliorer la performance commerciale sans augmenter la charge de travail</li>
    <li>De poser les bases d'un système scalable, et potentiellement monétisable à terme</li>
  </ul>
</section>

<!-- Page 3 — Objectifs stratégiques -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 2</div><h2 class="section">Objectifs stratégiques</h2><hr class="rule">
  <p>Quatre objectifs structurent l'accompagnement. Chacun répond à un enjeu concret identifié avec vous, et génère des gains mesurables dès les premières semaines.</p>
  <div class="obj-grid">
    <div class="obj-row"><div class="obj-num">01</div><div class="obj-body"><h4>Optimisation opérationnelle</h4><div class="sub">Supprimer les doublons, centraliser l'information, fiabiliser chaque dossier.</div><ul><li>Suppression des doubles saisies entre outils et supports papier</li><li>Réduction du temps de traitement des demandes entrantes</li><li>Centralisation complète des dossiers en un seul endroit</li><li>Fiabilisation des informations (fin des erreurs de recopie)</li></ul></div></div>
    <div class="obj-row"><div class="obj-num">02</div><div class="obj-body"><h4>Performance commerciale</h4><div class="sub">Répondre plus vite, qualifier mieux, convertir davantage.</div><ul><li>Réduction drastique du temps de réponse aux demandes</li><li>Qualification automatique des leads via questionnaire intelligent</li><li>Augmentation mécanique du taux de transformation</li><li>Relances automatisées, aucun dossier oublié</li></ul></div></div>
    <div class="obj-row"><div class="obj-num">03</div><div class="obj-body"><h4>Modernisation de l'image</h4><div class="sub">Aligner la perception externe avec la qualité réelle du travail.</div><ul><li>Refonte complète du site internet, orientée conversion</li><li>Image plus crédible et actuelle auprès des prescripteurs</li><li>Amélioration du référencement local (SEO géolocalisé)</li><li>Cohérence totale entre tous les supports de communication</li></ul></div></div>
    <div class="obj-row"><div class="obj-num">04</div><div class="obj-body"><h4>Vision long terme</h4><div class="sub">Construire dès aujourd'hui les actifs de demain.</div><ul><li>Structuration d'un outil métier interne réutilisable</li><li>Base de données client exploitable pour le marketing</li><li>Possibilité future de licence ou revente du logiciel métier</li><li>Appui à la transmission de l'entreprise à l'horizon 10-15 ans</li></ul></div></div>
  </div>
</section>

<!-- Page 4 — Architecture -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 3</div><h2 class="section">Architecture globale du projet</h2><hr class="rule">
  <p>L'écosystème s'articule autour de trois piliers interconnectés. Chacun apporte une valeur immédiate et peut être livré indépendamment. Leur assemblage crée l'effet de levier.</p>
  <div class="pillars">
    <div class="pillar"><div class="num">Pilier 01</div><div class="ttl">Site internet intelligent</div><div class="desc">Capter &amp; qualifier</div><div class="role-lbl">Rôle</div><div class="role">Point d'entrée des demandes</div></div>
    <div class="pillar"><div class="num">Pilier 02</div><div class="ttl">Plateforme métier</div><div class="desc">Gérer &amp; piloter</div><div class="role-lbl">Rôle</div><div class="role">Cœur opérationnel de l'activité</div></div>
    <div class="pillar"><div class="num">Pilier 03</div><div class="ttl">Connexion Impartial / DS8</div><div class="desc">Fluidifier l'existant</div><div class="role-lbl">Rôle</div><div class="role">Pont vers votre outil métier</div></div>
  </div>
  <h3>Comment les trois piliers fonctionnent ensemble</h3>
  <h4>· Les demandes entrent déjà qualifiées</h4>
  <p>Le questionnaire intelligent du site récolte les informations clés avant même le premier appel. Fini les allers-retours pour comprendre un besoin.</p>
  <h4>· Les données circulent sans friction</h4>
  <p>Une demande devient automatiquement un dossier dans la plateforme. Aucune ressaisie, aucune information perdue entre les outils.</p>
  <h4>· Votre outil métier actuel est préservé</h4>
  <p>Impartial / DS8 continue de faire ce qu'il fait bien. La plateforme Servicimmo ne le remplace pas. Elle le nourrit et en récupère les données.</p>
</section>

<!-- Page 5 — Phase 1 site -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 4</div><h2 class="section">Phase 1 · Site internet &amp; questionnaire intelligent</h2><hr class="rule">
  <h3>Objectif</h3>
  <p>Créer un site qui fait le tri pour vous. Les appels deviennent qualifiés, les demandes structurées, et chaque contact entrant arrive avec les bonnes informations dès la première interaction.</p>
  <h3>Structure du site · 5 pages principales</h3>
  <p><strong>01. Accueil</strong> : présentation immédiate du métier, réassurance, accès direct au questionnaire de devis. Page la plus stratégique, conçue pour convertir le visiteur en lead en moins de 30 secondes.</p>
  <p><strong>02. Diagnostics immobiliers</strong> : détail de chaque diagnostic proposé (DPE, amiante, plomb, gaz, électricité, termites, ERP, Carrez/Boutin), avec explications claires pour des prospects non experts.</p>
  <p><strong>03. Vente / Location</strong> : parcours dédié aux particuliers, explications des diagnostics obligatoires selon le projet, témoignages clients, FAQ.</p>
  <p><strong>04. Professionnels &amp; copropriétés</strong> : parcours B2B dédié aux agences, syndics et notaires, avec mise en avant de l'expertise métier et des conditions spécifiques prescripteurs.</p>
  <p><strong>05. Contact / Demande de devis</strong> : intégration directe du questionnaire intelligent, accès à la prise de rendez-vous, coordonnées complètes et carte.</p>
  <h3>Sous-pages SEO · Référencement local</h3>
  <p>Pages dédiées construites pour capter les recherches qualifiées sur votre zone d'intervention. Chaque page cible une requête précise.</p>
  <div class="columns" style="font-size: 9.5pt;">
    <ul><li>DPE Tours</li><li>Diagnostic immobilier Tours</li><li>Amiante Tours</li><li>Diagnostic immobilier Amboise</li><li>Diagnostic immobilier Chinon</li></ul>
    <ul><li>Diagnostic immobilier Joué-lès-Tours</li><li>DTA · Amiante avant travaux</li><li>Diagnostic plomb · Termites</li><li>DPE tertiaire</li><li>+ pages satellites évolutives</li></ul>
  </div>
  <p style="margin-top: 8pt;"><span style="color: #6d28d9; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; font-size: 8.5pt;">Objectif</span> · <em>capter les recherches locales qualifiées, là où vos prospects cherchent vraiment.</em></p>
</section>

<!-- Page 6 — §4b questionnaire intelligent (RÉÉCRIT) -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 4b</div><h2 class="section">Le questionnaire intelligent · Cœur de la phase 1</h2><hr class="rule">
  <h3>Un parcours intelligent qui s'adapte à chaque projet</h3>
  <p>Pas de questions inutiles. Pas de formulaires interminables. Le questionnaire ne demande que ce qui sert à votre métier.</p>
  <h3>Comment ça fonctionne concrètement</h3>
  <div class="step-row"><div class="step-num">1</div><div class="step-body"><div class="ttl">Entrée par projet</div><div class="sub">Vente · Location · Travaux · Diagnostic périodique. Le parcours se réorganise instantanément selon le choix.</div></div></div>
  <div class="step-row"><div class="step-num">2</div><div class="step-body"><div class="ttl">Branches automatiques</div><div class="sub">Selon le type de bien et la localisation, seules les questions pertinentes apparaissent. Pas de termites en zone non concernée, pas de DPE tertiaire pour un particulier.</div></div></div>
  <div class="step-row"><div class="step-num">3</div><div class="step-body"><div class="ttl">Prix calculé en temps réel</div><div class="sub">Le client voit son devis estimatif s'affiner pendant la saisie. Aucune surprise au moment du contact.</div></div></div>
  <div class="callout-dark"><div class="ttl">Ce qui change concrètement pour vous</div>Un prospect vous contacte ? Vous avez déjà en main : type de projet, caractéristiques du bien, diagnostics pré-identifiés, et créneaux de RDV. <strong>Votre premier appel n'est plus un appel de qualification, c'est un appel de closing.</strong></div>
  <h4>Automatisations incluses dans la phase 1</h4>
  <ul style="font-size: 9.5pt;">
    <li>Email de confirmation envoyé au prospect dès la soumission du questionnaire</li>
    <li>Notification interne immédiate avec toutes les données dans votre boîte mail</li>
    <li>SMS automatique de rappel envoyé au client 24h avant le rendez-vous</li>
    <li>Demande d'avis Google envoyée automatiquement après la mission</li>
    <li>Export automatique des données vers la plateforme métier (phase 2)</li>
  </ul>
  <h4>Livrables de la phase 1</h4>
  <ul style="font-size: 9.5pt;">
    <li>Site internet complet, responsive, optimisé pour la conversion</li>
    <li>Questionnaire intelligent intégré, testé et fonctionnel</li>
    <li>6 articles SEO optimisés sur les mots-clés métier</li>
    <li>10+ sous-pages de référencement local</li>
    <li>Back-office simple pour gérer vos contenus en autonomie</li>
    <li>Formation d'1 heure pour prendre en main l'outil</li>
  </ul>
</section>

<!-- Page 7 — §5 Plateforme étendue -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 5</div><h2 class="section">Phase 2 · Plateforme métier Servicimmo</h2><hr class="rule">
  <h3>Objectif</h3>
  <p>Remplacer le papier, Excel et les échanges par mail/téléphone par une interface unique, pensée pour votre métier de diagnostiqueur. Du premier contact à la clôture comptable, tout passe par la plateforme.</p>
  <h3>La plateforme en 3 grandes zones fonctionnelles</h3>
  <p>Nous avons regroupé les modules en 3 zones de travail, chacune correspondant à un moment de votre journée.</p>
  <div class="zone"><div class="lbl">Zone 1 · Piloter</div><div class="desc">La vue d'ensemble. Où vous démarrez votre journée pour savoir ce qui compte aujourd'hui.</div>
    <ul><li><strong>Tableau de bord</strong> : dossiers en cours, RDV du jour, alertes, CA estimé en temps réel</li><li><strong>Statistiques &amp; pilotage avancé</strong> : dossiers traités, taux de conversion, activité par technicien, CA mensuel, exports CSV pour votre comptable</li></ul></div>
  <div class="zone"><div class="lbl">Zone 2 · Traiter</div><div class="desc">Le cœur opérationnel. Où vos dossiers vivent, du premier contact à la clôture.</div>
    <ul><li><strong>Gestion des dossiers</strong> : liste filtrable par statut, recherche rapide</li><li><strong>Fiche dossier</strong> : contacts, bien, diagnostics, devis, fichiers au même endroit</li><li><strong>Gestion commerciale</strong> : devis, factures immuables, relances automatisées, paiements Stripe + manuels</li><li><strong>Agenda &amp; planification</strong> : planning par technicien, assignation en 2 clics, SMS de rappel automatiques</li><li class="bonus"><strong>Demandes de documents <span class="badge">Bonus inclus</span></strong><em>En un clic, le cabinet envoie au client une demande de documents personnalisée. Le client reçoit un lien sécurisé sans création de compte, dépose ses pièces, le cabinet est notifié.</em></li></ul></div>
  <div class="zone"><div class="lbl">Zone 3 · Relations</div><div class="desc">Votre base de contacts. Clients, prescripteurs, partenaires, tous reliés à leur historique.</div>
    <ul><li><strong>Gestion des tiers</strong> : base centralisée : clients, agences, syndics, prescripteurs, notaires</li><li class="bonus"><strong>Portail client / prescripteur sécurisé <span class="badge">Bonus inclus</span></strong><em>Vos clients et prescripteurs accèdent à leurs devis, factures et documents via un lien sécurisé. Pas de mot de passe à gérer, pas de friction.</em></li></ul></div>
</section>

<!-- Page 8 — §5b Fiche dossier (RÉÉCRIT — wizard parité fiche papier) -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 5b</div><h2 class="section">Fiche dossier · Parité fiche papier</h2><hr class="rule">
  <h3>On reproduit fidèlement votre fiche papier actuelle</h3>
  <p>Vos équipes connaissent leur fiche papier par cœur. Notre approche : ne pas les forcer à réapprendre leur métier. La création de dossier reprend <strong>vos champs, dans votre ordre, avec vos intitulés</strong>. La transition vers le numérique est invisible.</p>
  <h3>Une saisie guidée pas-à-pas</h3>
  <p>Au lieu d'un grand formulaire intimidant, un parcours qui assiste l'opérateur :</p>
  <ul style="font-size: 9.5pt;">
    <li><strong>Auto-complétion adresse</strong> via la Base Adresse Nationale, fini les fautes de saisie</li>
    <li><strong>Suggestions diagnostiques contextuelles</strong> selon le projet (calcul automatique via le moteur de règles)</li>
    <li><strong>Validation au fil de l'eau</strong>, jamais en bloc à la fin</li>
    <li><strong>Sauvegarde automatique</strong> toutes les quelques secondes, aucune perte en cas de coupure</li>
  </ul>
  <h3>Tout converge sur la fiche</h3>
  <p>Chaque dossier regroupe contacts, projet &amp; bien, diagnostics, organisation et fichiers. Mais désormais tout est lié : la saisie alimente la fiche, l'agenda planifie, le devis se génère, la facture émerge, le portail client s'active.</p>
  <div class="columns" style="margin-top: 8pt;">
    <div class="zone"><div class="lbl">1 · Contacts</div><ul style="font-size: 9pt;"><li>Propriétaire · Locataire</li><li>Agence · Syndic · Notaire</li></ul></div>
    <div class="zone"><div class="lbl">2 · Projet &amp; Bien</div><ul style="font-size: 9pt;"><li>Type · vente · location · travaux</li><li>Surface · année · adresse complète</li></ul></div>
    <div class="zone"><div class="lbl">3 · Diagnostics &amp; technique</div><ul style="font-size: 9pt;"><li>DPE · amiante · plomb · gaz · élec · termites · ERP</li><li>Carrez · Boutin · lot · chauffage</li></ul></div>
    <div class="zone"><div class="lbl">4 · Organisation &amp; fichiers</div><ul style="font-size: 9pt;"><li>Technicien · date · statut</li><li>Devis · facture · paiement · rapports</li></ul></div>
  </div>
  <div class="callout-dark"><div class="ttl">Résultat</div><strong>Fin des classeurs papier.</strong> Et surtout : vos équipes ne perdent pas leurs repères. Elles travaillent avec les mêmes champs qu'avant, mais en numérique, lié au reste du système, et sauvegardé.</div>
</section>

<!-- Page 9 — §5c Conformité (NOUVELLE) -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 5c · Nouveau</div><h2 class="section">Conformité &amp; paramétrage</h2><hr class="rule">
  <p>La plateforme couvre aussi vos obligations légales et vous laisse la main sur sa configuration.</p>
  <h3>Export FEC</h3>
  <p>Fichier comptable légal généré en un clic, conforme à l'obligation fiscale (article L.47 A du Livre des procédures fiscales). Votre comptable l'importe directement dans son logiciel.</p>
  <h3>Grille tarifaire éditable</h3>
  <p>Modifiez vos prix en autonomie, sans nous solliciter. Tarifs par diagnostic, par contexte (vente/location), par type de bien.</p>
  <h3>Règles de majoration éditables</h3>
  <p>Frais de déplacement, urgence, chauffage collectif, pack multi-diagnostics. Configurables sans toucher au code.</p>
  <h3>Multi-utilisateurs avec rôles</h3>
  <p>Comptes admin, diagnostiqueur, assistant. Permissions granulaires par fonction.</p>
  <h3>Branding cabinet</h3>
  <p>Votre logo, vos couleurs, vos coordonnées sur tous les supports (devis, factures, emails clients).</p>
  <div class="callout"><div class="ttl">Valeur ajoutée</div>Vous êtes autonome sur les paramètres qui changent souvent (prix, règles, équipe, branding). Aucune dépendance à Propul'SEO pour ces ajustements quotidiens.</div>
</section>

<!-- Page 10 — §5d · Le socle métier (NOUVEAU) -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 5d · Nouveau</div><h2 class="section">Le socle métier</h2><hr class="rule">
  <p>Sous chaque écran, un socle qui fait tenir l'outil dans le temps. Voici les quatre piliers qu'on ne voit pas directement, mais qui font la différence sur dix ans.</p>
  <h3>1 · Moteur de règles diagnostics</h3>
  <p>À chaque demande, l'outil détermine automatiquement les diagnostics obligatoires selon : <strong>type de projet</strong> (vente · location · travaux), <strong>nature du bien</strong> (maison · appartement · local), <strong>année de construction</strong> (avant 1949 → plomb · 1949-1997 → amiante), <strong>localisation</strong> (termites en zone d'arrêté préfectoral). Plus de risque d'oubli. Plus de vérification manuelle.</p>
  <h3>2 · Moteur de tarification modulaire</h3>
  <p>Une grille tarifaire éditable en autonomie + des règles de majoration paramétrables : déplacement au km, urgence sous 48h, chauffage collectif, pack multi-diagnostics. Chaque devis est calculé de façon <strong>transparente, auditable et reproductible</strong>.</p>
  <h3>3 · Conformité légale intégrée</h3>
  <ul style="font-size: 9.5pt;">
    <li><strong>Devis et factures immuables</strong> après émission, traçabilité comptable conforme</li>
    <li><strong>Export FEC</strong> conforme article L.47 A du Livre des procédures fiscales</li>
    <li><strong>Hébergement EU · RGPD by design</strong> : magic links signés, cookieless, pas de tracking tiers</li>
  </ul>
</section>

<!-- Page 11 — Section 6 fonctionnement dossier -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 6</div><h2 class="section">Fonctionnement complet d'un dossier</h2><hr class="rule">
  <p>Du premier contact à la clôture, voici comment un dossier traverse le système que nous construisons, sans aucune ressaisie, sans perte d'information.</p>
  <div class="step-row"><div class="step-num">1</div><div class="step-body"><div class="ttl">Demande reçue</div><div class="sub">Via le site (questionnaire intelligent) ou par téléphone</div></div></div>
  <div class="step-row"><div class="step-num">2</div><div class="step-body"><div class="ttl">Création automatique du dossier</div><div class="sub">Aucune ressaisie, les données du questionnaire alimentent directement la fiche</div></div></div>
  <div class="step-row"><div class="step-num">3</div><div class="step-body"><div class="ttl">Qualification</div><div class="sub">Vérification des informations, complément si nécessaire</div></div></div>
  <div class="step-row"><div class="step-num">4</div><div class="step-body"><div class="ttl">Devis</div><div class="sub">Généré directement depuis la fiche dossier</div></div></div>
  <div class="step-row"><div class="step-num">5</div><div class="step-body"><div class="ttl">Validation</div><div class="sub">Suivi automatisé, relance si besoin</div></div></div>
  <div class="step-row"><div class="step-num">6</div><div class="step-body"><div class="ttl">Planification du RDV</div><div class="sub">Assignation technicien + SMS de rappel auto</div></div></div>
  <div class="step-row"><div class="step-num">7</div><div class="step-body"><div class="ttl">Intervention</div><div class="sub">Technicien sur place, documents remontés à la fiche</div></div></div>
  <div class="step-row"><div class="step-num">8</div><div class="step-body"><div class="ttl">Documents &amp; rapports</div><div class="sub">Centralisation dans la fiche, accès client possible</div></div></div>
  <div class="step-row"><div class="step-num">9</div><div class="step-body"><div class="ttl">Clôture &amp; demande d'avis Google</div><div class="sub">Automatique après la mission</div></div></div>
</section>

<!-- Page 11 — Phase 3 -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 7</div><h2 class="section">Phase 3 · Connexion Impartial / DS8</h2><hr class="rule">
  <h3>Objectif</h3>
  <p><strong>Supprimer la ressaisie entre votre nouvelle plateforme et votre outil métier actuel.</strong> L'un ne remplace pas l'autre, ils travaillent ensemble.</p>
  <h3>Deux méthodes possibles</h3>
  <div class="columns">
    <div class="zone"><div class="lbl">Option 1</div><h4>Export / import automatisé</h4><p>Échange de fichiers CSV programmé à intervalle régulier. Solution simple, rapide à mettre en place, indépendante du prestataire Impartial.</p></div>
    <div class="zone"><div class="lbl">Option 2</div><h4>Connexion API directe</h4><p>Synchronisation en temps réel entre les deux outils. Solution plus robuste, mais nécessite la coopération technique d'Impartial / DS8.</p></div>
  </div>
  <h3>Étapes de mise en œuvre</h3>
  <ul>
    <li>Prise de contact avec Impartial / DS8 pour cadrer les possibilités</li>
    <li>Mapping des champs entre les deux systèmes</li>
    <li>Phase de tests dans un environnement sécurisé</li>
    <li>Ajustements et mise en production progressive</li>
  </ul>
  <div class="callout"><div class="ttl">Point d'attention</div>La faisabilité et les délais de cette phase dépendent directement de la réactivité et des contraintes techniques d'Impartial / DS8. Nous lançons le contact en votre nom dès validation du projet.</div>
</section>

<!-- Page 12 — Phase 4 -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 8</div><h2 class="section">Phase 4 · France Carottage</h2><hr class="rule">
  <h3>Le contexte</h3>
  <p>France Carottage est votre activité complémentaire de carottage béton pour le BTP. Un marché B2B à fort potentiel, aujourd'hui sous-exploité digitalement, et pourtant stratégique pour diversifier les revenus de Servicimmo.</p>
  <h3>Pourquoi une présence digitale dédiée</h3>
  <p>Le carottage béton ne partage ni la même cible (BTP vs particuliers/agences), ni les mêmes cycles de décision, ni les mêmes mots-clés SEO que le diagnostic immobilier. Mélanger les deux activités sur un seul site dessert les deux.</p>
  <p><span style="color: #6d28d9; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; font-size: 8.5pt;">La solution</span> · <em>un site dédié, avec sa propre identité, son propre référencement et sa propre stratégie commerciale, pensé dès le départ pour pouvoir se développer à l'échelle nationale via un modèle de franchise.</em></p>
  <h3>Ce qui est inclus dans la phase</h3>
  <ul>
    <li>Site internet dédié, distinct de la marque Servicimmo</li>
    <li>Positionnement technique B2B : cibles chefs de chantier, maîtres d'œuvre, bureaux d'études</li>
    <li>Pages métier détaillées : carottage béton, carottage bitume, prélèvements, forage de précision</li>
    <li>SEO ciblé sur les requêtes B2B du BTP et géolocalisé sur zones industrielles</li>
    <li>Formulaire de demande de devis technique adapté (type de chantier, diamètre, profondeur)</li>
    <li>Positionnement national, affranchi de la contrainte géographique de Servicimmo</li>
    <li>Base technique prête à accueillir un modèle de franchise (multi-sites, SEO local réplicable)</li>
  </ul>
  <div class="callout"><div class="ttl">Vision long terme</div>France Carottage est conçu dès le départ pour pouvoir se développer à grande échelle : structure technique réplicable, architecture URL pensée franchise, charte graphique réutilisable. L'idée n'est pas de construire un site vitrine de plus, mais de poser les fondations d'une marque nationale.</div>
</section>

<!-- Page 13 — Timeline -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 9</div><h2 class="section">Timeline du projet</h2><hr class="rule">
  <p>Le projet s'étend sur environ 4 mois, avec des livraisons progressives. Chaque phase génère de la valeur dès sa livraison. Inutile d'attendre la fin du projet pour en bénéficier.</p>
  <table class="timeline">
    <thead><tr><th>Phase</th><th>Périmètre</th><th class="weeks" colspan="16">S1 · S2 · S3 · S4 · S5 · S6 · S7 · S8 · S9 · S10 · S11 · S12 · S13 · S14 · S15 · S16</th></tr></thead>
    <tbody>
      <tr><td class="phase">01</td><td class="scope"><div class="ttl">Site &amp; questionnaire</div><div class="sub">4 semaines</div></td><td class="bar" colspan="16"><div class="bar-grid"><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></td></tr>
      <tr><td class="phase">02</td><td class="scope"><div class="ttl">Plateforme métier</div><div class="sub">8 semaines</div></td><td class="bar" colspan="16"><div class="bar-grid"><div></div><div></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div></div><div></div><div></div><div></div><div></div><div></div></div></td></tr>
      <tr><td class="phase">03</td><td class="scope"><div class="ttl">Connexion Impartial</div><div class="sub">variable</div></td><td class="bar" colspan="16"><div class="bar-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div></div><div></div><div></div><div></div></div></td></tr>
      <tr><td class="phase">04</td><td class="scope"><div class="ttl">France Carottage</div><div class="sub">4 semaines</div></td><td class="bar" colspan="16"><div class="bar-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div class="fill"></div><div class="fill"></div><div class="fill"></div><div class="fill"></div></div></td></tr>
    </tbody>
  </table>
  <h3>Livrables principaux par phase</h3>
  <div class="deliv"><div class="lbl">Phase 01</div><div class="body">Site en ligne, questionnaire fonctionnel, premières demandes qualifiées entrantes</div></div>
  <div class="deliv"><div class="lbl">Phase 02</div><div class="body">Plateforme métier complète, formation d'équipe, migration des dossiers en cours</div></div>
  <div class="deliv"><div class="lbl">Phase 03</div><div class="body">Synchronisation opérationnelle entre plateforme et Impartial / DS8</div></div>
  <div class="deliv"><div class="lbl">Phase 04</div><div class="body">Site France Carottage en ligne, prêt à développer à l'échelle nationale</div></div>
</section>

<!-- Page 14 — Méthodo -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 10</div><h2 class="section">Notre méthodologie</h2><hr class="rule">
  <p>Quatre principes guident notre manière de travailler. Ils sont issus de ce qui fonctionne vraiment sur les projets de cette envergure, et de ce qui échoue sur les autres.</p>
  <div class="obj-grid">
    <div class="obj-row"><div class="obj-num">01</div><div class="obj-body"><h4>Travail en itérations</h4><p>Des cycles courts, des livrables réguliers, pas d'effet tunnel. Vous voyez le projet avancer concrètement semaine après semaine.</p><div class="sub" style="color: #6d28d9;">Concrètement · Chaque vendredi, un point de 30 minutes avec une démo de ce qui a avancé. Pas de mauvaise surprise au moment de la livraison finale.</div></div></div>
    <div class="obj-row"><div class="obj-num">02</div><div class="obj-body"><h4>Validation continue</h4><p>Chaque phase est validée avec vous avant de passer à la suivante. Vos retours orientent la suite du travail en permanence.</p><div class="sub" style="color: #6d28d9;">Concrètement · Une maquette avant le développement, une démo avant la mise en production. Si quelque chose ne convient pas, on le corrige avant que ça devienne coûteux.</div></div></div>
    <div class="obj-row"><div class="obj-num">03</div><div class="obj-body"><h4>Adaptation terrain</h4><p>Nous partons de votre fonctionnement réel, pas d'un modèle théorique. Ce que nous livrons s'intègre à vos habitudes, pas l'inverse.</p><div class="sub" style="color: #6d28d9;">Concrètement · Nous passons du temps avec Fanny et Jacques-Alexandre pour comprendre vos dossiers types, vos irritants, vos process. L'outil en ressort sur-mesure.</div></div></div>
    <div class="obj-row"><div class="obj-num">04</div><div class="obj-body"><h4>Sur-mesure</h4><p>Chaque brique est pensée pour Servicimmo. Pas de solution SaaS figée, pas de fonctionnalités inutiles qui polluent l'interface.</p><div class="sub" style="color: #6d28d9;">Concrètement · Vous êtes propriétaire du code source. Aucun abonnement caché, aucune dépendance technique forcée. Votre outil vous appartient.</div></div></div>
  </div>
</section>

<!-- Page 15 — Tarification -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 11</div><h2 class="section">Tarification</h2><hr class="rule">
  <p style="margin-bottom: 4pt;">Récapitulatif détaillé de l'investissement. Chaque ligne correspond à un actif livré, en pleine propriété.</p>
  <table class="tarif">
    <thead><tr><th>Phase</th><th>Livrable</th><th>Montant</th></tr></thead>
    <tbody>
      <tr class="phase"><td>Phase 01</td><td>Site internet &amp; questionnaire intelligent</td><td class="amount">_____ €</td></tr>
      <tr class="line"><td></td><td>✓ Site internet 5 pages principales, sur-mesure, responsive</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Questionnaire intelligent à parcours adaptatif (qualification auto des leads)</td><td></td></tr>
      <tr class="line"><td></td><td>✓ 10+ sous-pages SEO de référencement local</td><td></td></tr>
      <tr class="line"><td></td><td>✓ 6 articles de blog optimisés sur les mots-clés métier</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Automatisations : email, notifications, SMS rappel, avis Google</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Back-office simple + formation 1h</td><td></td></tr>
      <tr class="phase"><td>Phase 02</td><td>Plateforme métier interne Servicimmo</td><td class="amount">_____ €</td></tr>
      <tr class="line"><td></td><td>✓ Zone Piloter, tableau de bord temps réel + statistiques avancées</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Zone Traiter, gestion dossiers, fiche dossier, commercial, agenda, demandes docs</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Zone Relations, base centralisée + portail client/prescripteur sécurisé</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Conformité &amp; paramétrage, export FEC, grille &amp; règles éditables, multi-utilisateurs</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Conception UX sur-mesure avec vos équipes</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Développement propriétaire (code source livré)</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Hébergement sécurisé 12 mois + formation équipe 2h</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Migration des dossiers existants + support prioritaire 30 jours</td><td></td></tr>
      <tr class="phase"><td>Phase 03</td><td>Connexion Impartial / DS8</td><td class="amount">_____ €</td></tr>
      <tr class="line"><td></td><td>✓ Prise de contact + cadrage technique avec Impartial</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Mapping des champs entre les deux systèmes</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Phase de tests dans un environnement sécurisé</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Mise en production progressive + ajustements</td><td></td></tr>
      <tr class="phase"><td>Phase 04</td><td>France Carottage · Site B2B dédié BTP</td><td class="amount">_____ €</td></tr>
      <tr class="line"><td></td><td>✓ Site internet dédié, identité distincte de Servicimmo</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Pages métier : carottage béton, bitume, prélèvements, forage</td><td></td></tr>
      <tr class="line"><td></td><td>✓ SEO B2B ciblé + géolocalisé sur zones industrielles</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Formulaire devis technique (type chantier, diamètre, profondeur)</td><td></td></tr>
      <tr class="line"><td></td><td>✓ Structure prête à dupliquer en modèle franchise</td><td></td></tr>
      <tr class="total"><td>Total</td><td>Accompagnement digital complet · 4 phases</td><td class="amount">_____ €</td></tr>
    </tbody>
  </table>
  <div class="modal"><span class="lbl">Modalités</span> · 50 % à la signature, 50 % à la livraison de chaque phase. <em>Aucun frais caché, aucun abonnement. Code source livré, propriété pleine et entière.</em></div>
</section>

<!-- Page 16 — Conclusion -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 12</div><h2 class="section">Conclusion</h2><hr class="rule">
  <p>Ce projet permet à Servicimmo :</p>
  <ul>
    <li>De gagner du temps immédiatement, dès la première phase livrée</li>
    <li>De structurer son activité sur des bases solides et pérennes</li>
    <li>D'améliorer sa performance commerciale sans augmenter la charge de travail</li>
    <li>De moderniser son image auprès des clients et des prescripteurs</li>
    <li>De préparer sereinement sa croissance et, à terme, sa transmission</li>
  </ul>
  <div class="callout-dark"><div class="ttl">Et surtout</div><strong>Tout cela sans perturber l'existant.</strong> Vos dossiers en cours continuent d'avancer, vos habitudes sont respectées, et chaque phase s'intègre progressivement dans votre quotidien.</div>
  <div class="callout"><div class="ttl">Prochaines étapes</div>
    <p style="margin: 0 0 4pt;"><strong>01. Échange de cadrage</strong> : 30 minutes pour répondre à vos questions et valider le périmètre</p>
    <p style="margin: 0 0 4pt;"><strong>02. Contractualisation</strong> : envoi d'un contrat précis par phase, acompte à la signature</p>
    <p style="margin: 0;"><strong>03. Kick-off phase 1</strong> : démarrage du site &amp; questionnaire dans la semaine qui suit</p>
  </div>
</section>

<!-- Page 17 — Bon pour accord -->
<section class="page">
  <div class="top"><span class="brand">Propul'SEO</span><span class="ref">Proposition · Servicimmo × Propul'SEO</span></div>
  <div class="label">Section 13</div><h2 class="section">Bon pour accord</h2><hr class="rule">
  <p>Pour valider cette proposition, il vous suffit de signer le bon pour accord ci-dessous ou de me répondre par retour de mail en confirmant votre accord.</p>
  <div class="signature-box"><div class="lbl">Bon pour accord</div>
    <div class="field"><div class="k">Nom &amp; fonction du signataire</div><div class="underline"></div></div>
    <div class="field"><div class="k">Date</div><div class="underline"></div></div>
    <div class="field tall"><div class="k">Signature <em>· précédée de la mention « Bon pour accord »</em></div><div class="underline"></div></div>
  </div>
  <p style="margin-top: 28pt; font-weight: 600;">Propul'SEO · Accompagnement digital sur-mesure</p>
  <p style="font-size: 9pt; color: #6b7280;">propulseo-site.com &nbsp;·&nbsp; team@propulseo-site.com</p>
</section>

</body></html>`;

async function buildPropalV2(outPdf: string) {
  const htmlPath = outPdf.replace(/\.pdf$/, '.html');
  await writeFile(htmlPath, PROPAL_V2_HTML, 'utf8');

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
  await browser.close();
  console.log(`✓ ${outPdf}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const audit = resolve(process.cwd(), 'docs/audit-interne-propal.md');
  const docClient = resolve(process.cwd(), 'docs/propal-v2-questionnaire-plateforme.md');

  const changements = resolve(process.cwd(), 'docs/changements-propal-pour-etienne.md');

  await mdToPdf(audit, resolve(OUT_DIR, 'audit-interne-propal.pdf'), 'Audit interne · Propal Servicimmo v1');
  await mdToPdf(docClient, resolve(OUT_DIR, 'propal-v2-sections-reecrites.pdf'), 'Propal v2 · Sections réécrites');
  await mdToPdf(changements, resolve(OUT_DIR, 'changements-propal-pour-etienne.pdf'), 'Changements propal Servicimmo · pour Étienne');
  await buildPropalV2(resolve(OUT_DIR, 'Proposition_Servicimmo_PropulSEO_v2.pdf'));
}

main().catch((e) => { console.error(e); process.exit(1); });
