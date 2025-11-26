import Fuse from '/assets/fuse.mjs';

// Récupérer tous les éléments de la liste
const items = Array.from(document.querySelectorAll('.r'));

// Préparer les données pour Fuse.js
const data = items.map((item) => {
  const link = item.querySelector('a');
  return {
    title: link.textContent.trim(),
    tags: item.dataset.tags || '',
    element: item,
  };
});

// Configuration de Fuse.js
const fuse = new Fuse(data, {
  keys: ['title'],
  threshold: 0.3,
  includeScore: true,
});

// Gestion de la recherche
const searchInput = document.querySelector('input[type="search"]');
const tagCheckboxes = document.querySelectorAll(
  '#form-tags input[type="checkbox"]'
);

function filterList() {
  const searchTerm = searchInput.value.trim();
  const selectedTags = Array.from(tagCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  // Si pas de recherche, utiliser le filtrage par tags classique
  if (!searchTerm) {
    items.forEach((item) => {
      const itemTags = item.dataset.tags.split(',').filter((t) => t);
      const hasSelectedTag = itemTags.some((tag) => selectedTags.includes(tag));
      item.style.display = hasSelectedTag ? '' : 'none';
    });
    return;
  }

  // Utiliser Fuse.js pour la recherche
  const results = fuse.search(searchTerm);

  // Cacher tous les éléments d'abord
  items.forEach((item) => (item.style.display = 'none'));

  // Afficher les résultats qui correspondent aussi aux tags sélectionnés
  results.forEach((result) => {
    const item = result.item.element;
    const itemTags = item.dataset.tags.split(',').filter((t) => t);
    const hasSelectedTag = itemTags.some((tag) => selectedTags.includes(tag));

    if (hasSelectedTag) {
      item.style.display = '';
    }
  });
}

// Écouteurs d'événements
searchInput.addEventListener('input', filterList);
tagCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', filterList);
});
