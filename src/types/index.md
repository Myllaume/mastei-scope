---
layout: base.liquid
title: Types
---

<ul>
{% for item in records_by_type %}
<li>
    <a href="/types/{{ item.key }}">
        {{ item.key }}
        <span class="link-badge">({{ item.records | size }})</span>
    </a>
</li>
{% endfor %}
</ul>
