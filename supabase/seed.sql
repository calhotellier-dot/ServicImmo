-- ============================================================================
-- Servicimmo v2 — Seed minimal (dev / preview)
-- 3 services, 5 villes (Indre-et-Loire), 2 articles
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Services (catalogue d'offres)
-- ---------------------------------------------------------------------------
insert into public.services (slug, name, category, short_description, content, price_min, price_max, duration_minutes, validity_months, order_index, seo_title, seo_description)
values
  (
    'dpe',
    'DPE — Diagnostic de Performance Énergétique',
    'particulier',
    'Obligatoire pour toute vente ou location de logement. Valide 10 ans.',
    E'# DPE à Tours\n\nLe Diagnostic de Performance Énergétique (DPE) informe sur la consommation énergétique et les émissions de gaz à effet de serre d''un logement. Obligatoire pour toute vente ou location, il doit être annexé à la promesse de vente ou au bail.\n\n## Durée de validité\n10 ans depuis la réforme 2021.\n\n## Tarifs\nEntre 90 € et 220 € selon la surface et le type de bien.',
    90,
    220,
    60,
    120,
    1,
    'DPE à Tours (37) — Diagnostic de Performance Énergétique | Servicimmo',
    'Réalisation de votre DPE à Tours et en Indre-et-Loire. Cabinet certifié Qualixpert depuis 1998. Devis sous 2h ouvrées.'
  ),
  (
    'amiante',
    'Diagnostic Amiante',
    'particulier',
    'Obligatoire pour la vente de tout bien dont le permis est antérieur au 1er juillet 1997.',
    E'# Diagnostic Amiante à Tours\n\nObligatoire pour la vente de biens construits avant le 1er juillet 1997. Pour la location, c''est le DAPP (Diagnostic Amiante des Parties Privatives) qui s''applique.\n\n## Durée de validité\nIllimitée si absence d''amiante constatée. Sinon, réévaluation tous les 3 ans.\n\n## Tarifs\nÀ partir de 70 €.',
    70,
    150,
    45,
    -1,
    2,
    'Diagnostic Amiante Tours 37 — Cabinet certifié | Servicimmo',
    'Recherche et diagnostic amiante à Tours et en Indre-et-Loire. Laboratoire COFRAC. Devis sous 2h ouvrées.'
  ),
  (
    'termites',
    'Diagnostic Termites',
    'particulier',
    'Obligatoire pour la vente en Indre-et-Loire (département classé par arrêté préfectoral).',
    E'# Diagnostic Termites à Tours\n\nL''Indre-et-Loire est classée zone à risque termites par arrêté préfectoral du 27 février 2018. Le diagnostic est obligatoire pour toute vente et valable 6 mois.\n\n## Tarifs\nEntre 90 € et 170 € selon la surface.',
    90,
    170,
    45,
    6,
    3,
    'Diagnostic Termites Tours 37 — Indre-et-Loire | Servicimmo',
    'Diagnostic termites obligatoire pour la vente en Indre-et-Loire. Validité 6 mois. Cabinet certifié.'
  );

-- ---------------------------------------------------------------------------
-- Cities (zone d'intervention prioritaire — Indre-et-Loire)
-- ---------------------------------------------------------------------------
insert into public.cities (slug, name, postal_code, department, latitude, longitude, is_primary_zone, seo_content)
values
  ('tours',                'Tours',                '37000', '37', 47.3941, 0.6848,  true,
    E'# Diagnostic immobilier à Tours\n\nServicimmo intervient au cœur de Tours et de sa métropole depuis 1998. Notre cabinet est basé 58 Rue de la Chevalerie (37100).'),
  ('joue-les-tours',       'Joué-lès-Tours',       '37300', '37', 47.3528, 0.6686,  true,
    E'# Diagnostic immobilier à Joué-lès-Tours\n\nDeuxième commune du département, Joué-lès-Tours est couverte en intervention rapide (J+1 à J+2).'),
  ('amboise',              'Amboise',              '37400', '37', 47.4133, 0.9829,  true,
    E'# Diagnostic immobilier à Amboise\n\nInterventions régulières à Amboise et dans la vallée du Cher. Biens anciens, pierre de tuffeau, spécificités amiante.'),
  ('chambray-les-tours',   'Chambray-lès-Tours',   '37170', '37', 47.3414, 0.7036,  true,
    E'# Diagnostic immobilier à Chambray-lès-Tours\n\nZone résidentielle et commerciale au sud de Tours, intervention rapide possible.'),
  ('fondettes',            'Fondettes',            '37230', '37', 47.4089, 0.6194,  true,
    E'# Diagnostic immobilier à Fondettes\n\nCommune de l''ouest de l''agglomération tourangelle. Nombreux biens de caractère en bord de Loire.');

-- ---------------------------------------------------------------------------
-- Articles (veille réglementaire — 2 stubs pour dev)
-- ---------------------------------------------------------------------------
insert into public.articles (legacy_id, slug, title, content, excerpt, category, published_at, seo_title, seo_description, is_published)
values
  (
    1,
    'dpe-2026-nouveau-calendrier-interdiction-location',
    'DPE 2026 : le nouveau calendrier d''interdiction de location',
    E'# DPE 2026 : ce qui change\n\nDepuis le 1er janvier 2025, les logements classés G au DPE ne peuvent plus être loués. En 2028, ce sera au tour des logements F. Un calendrier qui pousse les propriétaires à engager des travaux de rénovation énergétique.\n\n## Les échéances clés\n\n- **2025** : interdiction de louer les logements classés G\n- **2028** : interdiction de louer les logements classés F\n- **2034** : interdiction de louer les logements classés E\n\n## Que faire avant de vendre ?\n\nUn audit énergétique est désormais obligatoire pour la vente d''un logement classé F ou G. À partir de 2025, cette obligation s''étend aux logements classés E.\n\nContactez Servicimmo pour réaliser votre DPE et votre audit énergétique à Tours et en Indre-et-Loire.',
    'Le calendrier d''interdiction de location des passoires thermiques se précise. G en 2025, F en 2028, E en 2034.',
    'dpe',
    now() - interval '7 days',
    'DPE 2026 : calendrier interdiction location — Servicimmo',
    'Tout savoir sur le nouveau calendrier DPE 2025-2034 et les obligations de rénovation énergétique avant location.',
    true
  ),
  (
    2,
    'amiante-avant-travaux-obligations-particuliers',
    'Amiante avant travaux : les obligations des particuliers',
    E'# Amiante avant travaux : ce que vous devez savoir\n\nTout chantier de rénovation ou démolition dans un bâtiment construit avant le 1er juillet 1997 impose un diagnostic amiante avant travaux (RAT). Cette obligation protège les intervenants et vous engage comme donneur d''ordre.\n\n## Qui est concerné ?\n\n- Les particuliers qui rénovent une maison ou un appartement pré-1997\n- Les maîtres d''ouvrage de chantiers de démolition\n- Les syndics de copropriété pour les parties communes\n\n## Que fait Servicimmo ?\n\nNous réalisons le repérage amiante avant travaux avec prélèvements et analyse en laboratoire COFRAC. Rapport remis sous 5 jours ouvrés.',
    'Avant tout chantier dans un bâtiment pré-1997, le diagnostic amiante avant travaux est obligatoire. Obligations et process.',
    'amiante',
    now() - interval '14 days',
    'Amiante avant travaux : obligations des particuliers | Servicimmo',
    'Guide complet sur le diagnostic amiante avant travaux pour les particuliers en Indre-et-Loire. Process, tarifs, délais.',
    true
  );
