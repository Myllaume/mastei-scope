---
layout: base.liquid
---

# Statistiques des fiches

<table>
  <caption>
    Front-end web developer course 2021
  </caption>
  <thead>
    <tr>
      <th scope="col">Titre</th>
      <th scope="col">tags</th>
      <th scope="col">liens</th>
      <th scope="col">rétroliens</th>
      <th scope="col">dates</th>
      <th scope="col">caractères</th>
    </tr>
  </thead>
  <tbody>

{% for r in records %}

  <tr>
    <th scope="row"><a href="/record/{{ r.id }}" target="_blank">{{ r.title }}</a></th>
    <td>{{ r.tags | size }}</td>
    <td>{{ r.links | size }}</td>
    <td>{{ r.backlinks | size }}</td>
    <td>{{ r.dates | size }}</td>
    <td>{{ r.description | size }}</td>
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
