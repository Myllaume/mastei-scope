---
layout: base.liquid
title: Books
---

<ul>
{% for item in records_by_book %}
<li>
    <a href="/books/{{ item.key }}">
        {{ item.key }}
        <span>({{ item.records | size }})</span>
    </a>
</li>
{% endfor %}
</ul>
