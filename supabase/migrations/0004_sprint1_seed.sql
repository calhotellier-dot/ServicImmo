-- ============================================================================
-- Sprint 1 — Seed : organisation Servicimmo + catalogue 15 diagnostic_types
-- Migration 0004
-- ============================================================================

-- ── Organisation Servicimmo ────────────────────────────────────────────────
insert into public.organizations (
  slug, name, siret, address_line1, postal_code, city, country, phone, email
) values (
  'servicimmo',
  'Servicimmo',
  null, -- TODO: demander à Servicimmo
  null,
  '37000',
  'Tours',
  'France',
  '02 47 47 01 23',
  'contact@servicimmo.fr'
) on conflict (slug) do nothing;

-- ── Catalogue diagnostic_types (15 entrées) ────────────────────────────────
-- Validité : -1 = illimité, sinon en mois.
insert into public.diagnostic_types (slug, name, short_name, category, description, validity_months, order_index) values
  ('dpe',            'DPE — Diagnostic de Performance Énergétique', 'DPE',       'logement',    'Obligatoire pour la vente ou location de logement.',                                120, 10),
  ('dpe_tertiary',   'DPE Tertiaire',                               'DPE tert.', 'tertiaire',   'DPE pour locaux professionnels / tertiaire.',                                        120, 20),
  ('dpe_collective', 'DPE Collectif',                               'DPE coll.', 'copropriete', 'Obligatoire en copropriété selon calendrier 2024-2026.',                             120, 30),
  ('lead',           'CREP — Constat de Risque d''Exposition au Plomb', 'Plomb',  'logement',   'Obligatoire pour logements avec permis antérieur au 1er janvier 1949.',               12, 40),
  ('asbestos',       'Amiante',                                      'Amiante',  'logement',    'Obligatoire pour bâtiments avec permis antérieur au 1er juillet 1997 (vente).',      -1, 50),
  ('dapp',           'DAPP — Amiante Parties Privatives',           'DAPP',      'logement',    'Amiante parties privatives pour location pré-1997.',                                 -1, 60),
  ('dta',            'DTA — Diagnostic Technique Amiante',          'DTA',       'copropriete', 'Amiante parties communes copropriété pré-1997.',                                     -1, 70),
  ('asbestos_works', 'Repérage Amiante Avant Travaux (RAT)',        'RAT',       'travaux',     'Avant tout chantier dans un bâtiment pré-1997.',                                     -1, 80),
  ('lead_works',     'Plomb Avant Travaux',                          'Plomb trav.', 'travaux',  'Avant tout chantier dans un bâtiment pré-1949.',                                     -1, 90),
  ('termites',       'État parasitaire — Termites',                 'Termites',  'etat',        'Obligatoire pour vente en zone à risque (arrêté préfectoral).',                      6, 100),
  ('gas',            'État de l''installation Gaz',                 'Gaz',       'etat',        'Pour installations gaz de plus de 15 ans.',                                         36, 110),
  ('electric',       'État de l''installation Électrique',           'Élec.',     'etat',       'Pour installations électriques de plus de 15 ans.',                                 36, 120),
  ('carrez',         'Loi Carrez',                                   'Carrez',    'mesurage',    'Mesurage pour vente d''un lot en copropriété.',                                     -1, 130),
  ('boutin',         'Loi Boutin',                                   'Boutin',    'mesurage',    'Mesurage pour location d''un logement vide à usage de résidence principale.',      -1, 140),
  ('erp',            'ERP — État des Risques et Pollutions',         'ERP',       'etat',        'Obligatoire pour toute vente ou location.',                                         6, 150)
on conflict (slug) do nothing;

-- ============================================================================
-- Fin de la migration 0004
-- ============================================================================
