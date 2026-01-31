---
layout: base.liquid
title: Dates
---

<a href="/dates/tags-timeline">Tags timeline</a>
<a href="/dates/books-timeline">Books timeline</a>

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
            <a href="/records/{{ r.id }}">{{ r.title | frenchQuotes }}</a>
            {%- for c in r.context %}
            <p class="prose">{{ c | frenchQuotes | bibliographyIndex: r | highlightWord : d.inline }}</p>
            {%- endfor %}
        </li>
        {%- endfor %}
        </ul>
        </li>
    {%- endfor %}
    </ul>
</section>
{%- endfor %}
