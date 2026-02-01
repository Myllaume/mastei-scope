---
layout: base.liquid
title: Books
---

<ul>
{% for item in records_by_book %}

{% assign totalRecords = 0 %}
{%- for quote in item.quotes -%}
{% assign totalRecords = totalRecords | plus: quote.records.size %}
{%- endfor -%}

<li>
    <a href="/books/{{ item.bookKey }}">
        {{ item.bookKey }}
    </a>
    <samp>({{ item.quotes | size }} pages citées, {{ totalRecords }} fiches)</samp>
</li>
{% endfor %}
</ul>
