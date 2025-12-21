---
layout: base.liquid
title: Tags
---

<ul>
{% for item in records_by_tag %}
<li>
    <a href="/tags/{{ item.key }}">
        {{ item.key }}
        <span>({{ item.records | size }})</span>
    </a>
</li>
{% endfor %}
</ul>
