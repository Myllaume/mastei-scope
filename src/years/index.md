---
layout: base.liquid
title: Années
---

<ul>
{% for item in records_by_year %}
<li>
    <a href="/years/{{ item.key }}">
        {{ item.key }}
        <span>({{ item.records | size }})</span>
    </a>
</li>
{% endfor %}
</ul>
