---
layout: base.liquid
title: Masteï
---

# Fiches

<a href="/table/">Tableau</a>
<a href="/tags/">Tags</a>
<a href="/books/">Livres</a>
<a href="/dates/">Dates</a>
<a href="/graph/">Graphe</a>
<a href="/records/tags-graph">Tags graph</a>

<div x-data="search()" @input="filterList()" x-init="init()">
  <input x-init="$el.focus()" type="search" x-model="searchTerm" placeholder="Rechercher une fiche..." />

  <ul>
      {%- for r in records -%}
      <li>
          <a href="/records/{{ r.id }}/">{{ r.title | frenchQuotes }}{% if r.alias.size > 0 %} • {{ r.alias | join: " • " }}{% endif %}</a>
      </li>
      {%- endfor -%}
  </ul>
</div>
