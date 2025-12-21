---
layout: base.liquid
title: Masteï
---

# Fiches

<input type="search" placeholder="Rechercher une fiche..." />

<ul>
    {%- for r in records -%}
    <li>
        <a href="/records/{{ r.id }}/">{{ r.title }}{% if r.alias.size > 0 %} • {{ r.alias | join: " • " }}{% endif %}</a>
    </li>
    {%- endfor -%}
</ul>

<script type="module" src="/assets/search.js"></script>
