# mastei-scope

```bash
nodemon --watch '../mastei-notes/dates.yml' --exec '../mastei-notes-parser/bin/mastei-notes-parser.js' -q
```

## Suggestions GPT

### Nouvelles Relations

Co‑citation: fiches qui citent les mêmes sources; force par nombre/poids des sources partagées.
Couplage bibliographique: fiches citées par les mêmes livres/auteurs; utile pour “proximité documentaire”.
Dates partagées: relier fiches mentionnant la même date ou fenêtre temporelle; pondérer par précision (jour/mois/année).
Entités nommées: relier via personnes, lieux, organisations co‑mentionnés; extraire NER pour densifier le graphe.
Ponts inter‑communautés: liens entre clusters Louvain différents; surface les “passeurs” et controverses.
Typologie de lien: distinguer citation, influence, opposition, synthèse; afficher pictos ou styles de traits.

### Scores et Similarité

Similarité Jaccard tags/sources:
frac∣AcapB∣∣AcupB∣ sur tags, livres, dates.
TF‑IDF/embeddings: proximité textuelle des contenus; suggestions “fiches proches” dans la sidebar.
Force de lien pondérée: cumul de signaux (co‑citation, NER, dates, tags) avec poids ajustables.
Centralités: degré, PageRank, intermédiarité pour détecter pivots, autorités et courtiers d’information.
Fermeture de triade: probabilité de liens manquants entre voisins; proposer “liens suggérés”.

### Analytique Temporelle

Heatmap par année/mois: volume de fiches, de liens, et “intensité” de co‑mentions.
Lags documentaires: délai entre événement (date) et première citation/traitement; comparer par tag/cluster.
Burst detection: repérer périodes de “surchauffe” (Kleinberg) pour thèmes/entités.
Chronologie des clusters: évolution des communautés (Louvain/Leiden) dans le temps.
Chaînes narratives: parcours de fiches par proximité chronologique + similarité sémantique.

### Focus Bibliographie

Densité de notes: ratio notes/texte par fiche; repérer fiches très sourcées vs synthétiques.
Réseaux auteurs‑livres: qui cite qui, co‑auteurs récurrents, “écoles” documentaires.
Co‑références: paires de sources souvent citées ensemble; réductions en “paquets bibliographiques”.
Portée des pages: agrégats p.xx–yy pour estimer profondeur de traitement d’une source.
Autorité des sources: PageRank sur le graphe des références; top sources par cluster.

### Diagnostics de Graphe

Qualité de communauté: modularité Q, comparer Louvain vs Leiden pour stabilité.
Noyau‑coquille (k‑core): cœur du graphe vs périphérie; utile pour Table/overview.
Cliques et motifs: triangles, carrés, motifs bipartites livre‑fiche; sur‑représentations (“signatures”).
Structural holes: contrainte de Burt pour repérer courtiers; mettre en avant ces fiches.
Orphelins et feuilles: fiches isolées ou à faible degré; candidates à enrichissement.

### Améliorations UI et Table

Profils fiche: mini‑graphe local (ego‑network), top voisins par type de lien.
Pages cluster: résumé (tags dominants, sources clés, entités top), indicateurs et timeline.
Sidebar “liens suggérés”: propositions avec justification (tags communs, dates, co‑citation).
Filtrage multi‑critères: tags + période + type de lien; sauvegarde de vues.
Table enrichie: colonnes pour centralités, densité de notes, force moyenne des liens, taux d’orphelins; tri/exports.

## Ce que j'en retiens

- NER (Reconnaissance d’Entités) : selon les tags des fiches (personne, organisation, lieu...) ou avec reconnaissance lib Python
  - être capable de lister ces Entités dans une liste en bas de fiche.
  - filtrer les fiches contenant personnes/lieux
- Créer un score de ressemblance
  - 0 = rien en commun, 1 = identiques. Entre les deux, plus c’est haut, plus c’est proche
  - Met un seuil doux (ex. n’afficher que si score ≥ 0,2) et exige au moins 2 éléments communs
  1. liste ce que chaque fiche possède : tags (proximité thématique) et sources (proximité documentaire)
  2. compte ce qu’elle a en commun par rapport à toutes les autres fiches
  3. compte tout ce qu’elles ont au total (sans doublons)
  4. Score = commun ÷ total
