---
title: manual
layout: base.liquid
---

# Manuel

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

## Fiches

Une fiche correspond à un élément du fichier fiches.yml.

D'une fiche on peut extraire différentes données :

- **Référence à des fiches**, le titre ou l'un des alias d'une autre fiche.
- **Mots-clés**, expressions listées dans le fichier tags.yml.
- **Références bibliographiques**, notées entre parenthèses avec des clés de citation et pour chacune un numéro de page : `(Chapoutot2025 p.54)`.
- **Dates**, notées au jour près sur le format `24 septembre 1945`.

### Liens

D'une référence de fiche on détermine :

- Une relation entre les deux fiches, **un lien et un rétrolien**.
- Un **contexte**, soit les lignes de la fiche contenant la référence.

### Anomalies

On détermine les anomalies suivantes pour une fiche :

- Pas de description (vide)
- Pas de mot-clé identifié
- Pas de référence à une fiche identifiée
- Pas référence bibliographique

## Graphe

De l'ensemble des références (**liens**) entre les fiches (**nœuds**) on déduit un graphe. Il permet d'établir des relations indirectes entre les fiches par :

- Des niveaux de **relations concentriques**.
- Une **communauté**, d'après l'algorithme de Louvain.

## Biliographie

Les références bibliographiques permettent de

- Retrouver une information dans sa **source de vérité**.
- Identifier un **ensemble de fiches** basée sur les mêmes ouvrages, voire la même page.