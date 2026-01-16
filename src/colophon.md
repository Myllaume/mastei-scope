---
title: Colophon
layout: base.liquid
---

# Colophon

**Masteï Scope** est une encyclopédie numérique consacrée à l’histoire politique du XX<sup>ème</sup> siècle, avec un accent particulier sur les régimes et dynamiques de la Seconde Guerre mondiale. Le site propose des fiches thématiques, des notices sur des événements, acteurs, concepts, sources et bibliographies, organisées par tags, dates, et ouvrages.

Dernière génération : <samp>{{ today }}</samp>.

---

## Technologies et conception

- **Générateur statique** : [Eleventy (11ty)](https://www.11ty.dev/) v3.1.2.
- **Langages** : Markdown, Liquid, HTML5, CSS3, JavaScript (ES6 modules).
- **Scripts** : Tableaux interactifs (tri, recherche) via JS natif et [Fuse.js](https://fusejs.io/) pour la recherche plein texte.
- **Structuration** : Données organisées en dossiers (`records`, `books`, `dates`, `tags`), chaque fiche étant générée à partir de sources structurées (YAML/Markdown).
- **Mise en page** : Templates Liquid, styles personnalisés.
- **Développement** : Utilisation de Prettier pour la cohérence du code.

## Données et contenu

- **Fiches** : Synthèses sur des événements, concepts, acteurs, institutions, etc. du XXᵉ siècle, principalement autour de la Seconde Guerre mondiale
- **Réseaux** : Liens entre fiches par citations, co-citations, tags, dates, sources bibliographiques
- **Statistiques** : Tableaux récapitulatifs, indicateurs de centralité, densité de notes, anomalies, etc.
- **Navigation** : Par tags, dates, ouvrages, et moteur de recherche

## Objectifs éditoriaux

Ce projet vise à :

- Offrir une vue d’ensemble structurée et interconnectée sur l’histoire politique du XXᵉ siècle.
- Mettre en valeur les relations documentaires (sources, co-citations, réseaux d’auteurs).
- Faciliter l’exploration thématique, chronologique et bibliographique.
- Proposer des outils analytiques pour la recherche et l’enseignement.

## Contributeur principal

- Guillaume Brioudes Capponi

## Licence

Code et contenus sous licence ISC, sauf mention contraire pour certains extraits ou données.
