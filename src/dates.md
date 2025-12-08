---
layout: base.liquid
title: Dates
---

<ul>
{% for d in dates %}
    <li>
    <h3>{{ d.inline }}</h3>
    <ul>
    {% for r in d.records %}
    <li>
        <a href="/records/{{ r.id }}">{{ r.title }}</a>
        {% for c in r.context %}
        <p class="context serif">{{ c }}</p>
        {% endfor %}
    </li>
    {% endfor %}
    </ul>
    </li>
{% endfor %}
</ul>
