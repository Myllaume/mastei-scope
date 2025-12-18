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
      <th scope="col">rétroliens</th>
      <th scope="col">dates</th>
      <th scope="col">mots</th>
      <th scope="col">citations</th>
    </tr>
  </thead>
  <tbody>

{% for r in records %}

  <tr>
    <th scope="row"><a href="/records/{{ r.id }}" target="_blank">{{ r.title }}</a></th>
    <td>{{ r.line }}</td>
    <td>{{ r.tags | size }}</td>
    <td>{{ r.links | size }}</td>
    <td>{{ r.backlinks | size }}</td>
    <td>{{ r.dates | size }}</td>
    <td>{{ r.description | number_of_words }}</td>
    <td>{{ r.quotes | size }}</td>
  </tr>
  {% endfor %}
    
  </tbody>
  <tfoot>
    <tr>
      <td>nombre de fiches : {{ records | size }}</td>
    </tr>
  </tfoot>
</table>

<script src="/assets/table.js"></script>
