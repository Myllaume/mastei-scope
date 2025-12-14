---
layout: base.liquid
title: Masteï
---

# Fiches

<input type="search" placeholder="Rechercher une fiche..." />

<ul class="records-list">
{% for r in records %}
<li class="r" data-tags="{{ r.tags | join: ',' }}"><a href="/records/{{ r.id }}/">{{ r.title }}</a></li>
{% endfor %}
</ul>

<script type="module" src="/assets/search.js"></script>
