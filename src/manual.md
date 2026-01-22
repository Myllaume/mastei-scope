---
title: manual
layout: base.liquid
---

# Manuel

Indications techniques pour l'écriture de ce site web.

[toc]

## Fichiers

**fiches.yml**, contient un tableau de fiches tel que

```yml
- title: Titre
  description: Description (Chapoutot2025 p.54).
  tags:
    - personne
```

**config.yml**, contient les options du logiciel de conversion des fiches.

```yml
recordsFile: ./fiches.yml
tagsFile: ./tags.yml
bibliography: ./biblio.json
graph_depth: 2
```

**tags.yml**, contient la liste des mots-clés

```yml
france:
  - français
  - française
Première guerre mondiale: true
```

**bib.json**, contient la références des ouvrages cités, au format CSL.

## Pages

**Fiches** liste toutes les notes historiques.

**Tableau** compare les fiches avec des critères quantitatifs dans un tableau triable. Le nombre d'anomalies permet pas exemple de retrouver rapidement les fiches qui nécessite une correction.

**Graphe** est une représentation graphique des liens entre les différentes fiches historiques.

**Dates** est une liste chronologique des dates extraites des fiches. Pour chaque date sont listées les fiches comportant la date, ainsi qu'un extrait contextuel.

**Wiki** est le support de concepts et de conception du projet Masteï.

**Colophon** est la présentation de l'objet et de l'outillage de ce site web.
