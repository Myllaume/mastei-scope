---
layout: base.liquid
title: Table
---

<h1>Récapitulatif des fiches</h1>

<table x-data="tableSort">
  <caption>Statistiques générales</caption>
  <thead>
    <tr>
      <th scope="col" @click="sort(0)">Titre&nbsp;<span x-text="indicator(0)"></span></th>
      <th scope="col" @click="sort(1)">l.&nbsp;<span x-text="indicator(1)"></span></th>
      <th scope="col" @click="sort(2)">tags&nbsp;<span x-text="indicator(2)"></span></th>
      <th scope="col" @click="sort(3)">liens&nbsp;<span x-text="indicator(3)"></span></th>
      <th scope="col" @click="sort(4)">r.liens&nbsp;<span x-text="indicator(4)"></span></th>
      <th scope="col" @click="sort(5)">dates&nbsp;<span x-text="indicator(5)"></span></th>
      <th scope="col" @click="sort(6)">mots&nbsp;<span x-text="indicator(6)"></span></th>
      <th scope="col" @click="sort(7)">cits.&nbsp;<span x-text="indicator(7)"></span></th>
      <th scope="col" @click="sort(8)">ano.&nbsp;<span x-text="indicator(8)"></span></th>
    </tr>
  </thead>
  <tbody>

{% for r in records %}

  <tr>
    <th scope="row"><a href="/records/{{ r.id }}" target="_blank">{{ r.title | frenchQuotes }}</a></th>
    <td>{{ r.line }}</td>
    <td>{{ r.tags | size | formatNumber }}</td>
    <td>{{ r.links | size | formatNumber }}</td>
    <td>{{ r.backlinks | size | formatNumber }}</td>
    <td>{{ r.dates | size | formatNumber }}</td>
    <td>{{ r.description | number_of_words | formatNumber }}</td>
    <td>{{ r.quotes | size | formatNumber }}</td>
    <td>{{ r.report | size }}</td>
  </tr>
  {% endfor %}
    
  </tbody>
  <tfoot>
    <tr>
      <td>Total ({{ records | size | formatNumber }} fiches)</td>
      <td></td>
      <td>
        {%- assign total_tags = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.tags | size -%}
          {%- assign total_tags = total_tags | plus: count -%}
        {%- endfor -%}
        {{ total_tags | formatNumber }}
      </td>
      <td colspan="2">
        {%- assign total_links = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.links | size -%}
          {%- assign total_links = total_links | plus: count -%}
        {%- endfor -%}
        {{ total_links | formatNumber }}
      </td>
      <td>
        {%- assign total_dates = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.dates | size -%}
          {%- assign total_dates = total_dates | plus: count -%}
        {%- endfor -%}
        {{ total_dates | formatNumber }}
      </td>
      <td>
        {%- assign total_words = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.description | number_of_words -%}
          {%- assign total_words = total_words | plus: count -%}
        {%- endfor -%}
        {{ total_words | formatNumber }}
      </td>
      <td>
        {%- assign total_quotes = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.quotes | size -%}
          {%- assign total_quotes = total_quotes | plus: count -%}
        {%- endfor -%}
        {{ total_quotes | formatNumber }}
      </td>
      <td>
        {%- assign total_report = 0 -%}
        {%- for r in records -%}
          {%- assign count = r.report | size -%}
          {%- assign total_report = total_report | plus: count -%}
        {%- endfor -%}
        {{ total_report | formatNumber }}
      </td>
    </tr>
  </tfoot>
</table>
