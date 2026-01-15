---
layout: base.liquid
title: Masteï
---

# Fiches

<div x-data="tagFilter">
    <div>
        <h2>Filtrer par tags</h2>
        <div id="tag-checkboxes">
            <template x-for="tag in allTags" :key="tag">
                <label style="display: inline-block; margin-right: 1rem;">
                    <input 
                        type="checkbox" 
                        :value="tag"
                        @change="toggleTag(tag)"
                        :checked="isTagSelected(tag)"
                    >
                    <span x-text="tag"></span>
                </label>
            </template>
        </div>
    </div>

    <div style="margin-top: 2rem;">
        <p x-show="selectedTags.length > 0">
            <strong x-text="filteredCount"></strong> fiche(s) trouvée(s)
        </p>
    </div>

    <ul>
        {%- for r in records -%}
        <li data-tags="{{ r.tags | join: ',' }}">
            <a href="/records/{{ r.id }}/">{{ r.title | frenchQuotes }}{% if r.alias.size > 0 %} • {{ r.alias | join: " • " }}{% endif %}</a>
        </li>
        {%- endfor -%}
    </ul>

</div>

<script type="module" src="/assets/search.js"></script>
<script type="module" src="/assets/filter.js"></script>
