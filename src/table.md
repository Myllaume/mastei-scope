---
layout: base.liquid
title: Table
---

<h1>Récapitulatif des fiches</h1>

<table>
  <caption>Statistiques générales</caption>
  <thead>
    <tr>
      <th scope="col">Titre</th>
      <th scope="col">ligne</th>
      <th scope="col">tags</th>
      <th scope="col">liens</th>
      <th scope="col">r.liens</th>
      <th scope="col">dates</th>
      <th scope="col">mots</th>
      <th scope="col">citations</th>
      <th scope="col">anomalies</th>
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

<script src="/assets/table.js"></script>
