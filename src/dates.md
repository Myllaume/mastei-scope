---
layout: base.liquid
title: Dates
---

{%- assign yearGroups = dates | group_by: "date.year" -%}

<nav>
<h2>Navigation par année</h2>
    <ul>
        {%- for group in yearGroups %}
        <li><a href="#year-{{ group.name }}">{{ group.name }} ({{ group.items | size }})</a></li>
        {%- endfor %}
    </ul>
</nav>

{%- for group in yearGroups %}

<section id="year-{{ group.name }}">
    <h2>{{ group.name }}</h2>
    <ul>
    {%- for d in group.items %}
        <li>
        <h3 id="{{ d.date.day }}-{{ d.date.month }}-{{ d.date.year }}">{{ d.inline }}</h3>
        <ul>
        {%- for r in d.records %}
        <li>
            <a href="/records/{{ r.id }}">{{ r.title }}</a>
            {%- for c in r.context %}
            <p class="prose">{{ c | bibliographyIndex: r | bibliographyIndex }}</p>
            {%- endfor %}
        </li>
        {%- endfor %}
        </ul>
        </li>
    {%- endfor %}
    </ul>
</section>
{%- endfor %}
