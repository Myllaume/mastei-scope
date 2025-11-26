---
layout: base.liquid
title: Masteï
---

# Fiches

## Tags

<form id="form-tags">
{% for tag in collections.allTags %}
  <label>
    <input value="{{ tag }}" type="checkbox" checked>
    {{ tag }}
  </label>
{% endfor %}
</form>

## Records

<ul>
{% for r in records %}
<li class="r" data-tags="{{ r.tags | join: ',' }}"><a href="/record/{{ r.id }}/">{{ r.title }}</a></li>
{% endfor %}
</ul>
