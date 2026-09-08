# GlitchTip — ServicImmo

- Instance : https://errors.propulseo-site.com
- Organisation : `propulseo` ; projet : `servicimmo`.
- Site / hébergement : https://servicimmo.propulseo-site.com.
- Branche à déployer : `feat/vitrine-home-portage`.
- Couverture : Next.js (navigateur, serveur et edge).

## Activation

Le DSN public du projet est fourni dans le code. Ce DSN permet uniquement
l'envoi d'événements ; ce n'est ni un mot de passe ni un jeton d'administration.
Fusionner la PR puis reconstruire et déployer la branche ci-dessus.

Surcharge facultative : `NEXT_PUBLIC_GLITCHTIP_DSN` au **build** ; une valeur vide désactive
l'envoi côté navigateur. Le serveur accepte aussi `GLITCHTIP_DSN` au runtime.
Le développement local est désactivé. Les déploiements utilisent un environnement
distinct lorsque Vercel expose sa variable d'environnement publique.
Les variables historiques `SENTRY_DSN` ne pilotent plus cette intégration.

## Données et limites

Suivi des erreurs uniquement : pas de sessions, replays ni transactions de
performance. Le filtrage conserve les informations techniques et retire les
données d'identité et les données de requête sensibles. Il ne remplace pas la
prudence dans les messages d'erreur ajoutés par l'application.

Les exceptions interceptées par le code métier doivent être transmises avec
`captureException` si elles doivent apparaître dans GlitchTip.

Les sourcemaps sont facultatives : un `GLITCHTIP_AUTH_TOKEN` de build permet
leur envoi vers cette instance. Sans jeton, l'envoi est désactivé ; les erreurs
restent collectées, mais les piles navigateur peuvent contenir du code minifié.

## Vérification

```sh
node scripts/test-glitchtip.mjs
```

Les neuf DSN ont répondu HTTP 200 à un événement synthétique le 8 septembre 2026
(environnement `integration-check`, tag `test=dsn-ingestion`).
Cela valide l'acceptation par le collecteur, pas le déploiement du site.

Après déploiement, déclencher une erreur contrôlée dans un environnement de test,
vérifier l'envoi `/api/<id>/envelope/`, puis retrouver l'événement dans le bon
projet GlitchTip. Ne pas ajouter de route publique permettant de faire planter
le serveur pour ce test.
