---
layout: base.liquid
title: Masteï
---

# Fiches

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
