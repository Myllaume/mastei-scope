import Fuse from '/assets/fuse.mjs';

// Récupérer tous les éléments de la liste
const items = Array.from(document.querySelectorAll('ul a'));

// Préparer les données pour Fuse.js
const data = items.map((item) => {
  return {
    title: item.textContent.split('•'),
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

function filterList() {
  const searchTerm = searchInput.value.trim();

  // Si pas de recherche, utiliser le filtrage par tags classique
  if (!searchTerm) {
    items.forEach((item) => (item.style.display = ''));
    return;
  }

  // Utiliser Fuse.js pour la recherche
  const results = fuse.search(searchTerm);

  // Cacher tous les éléments d'abord
  items.forEach((item) => (item.style.display = 'none'));

  // Afficher les résultats qui correspondent aussi aux tags sélectionnés
  results.forEach((result) => {
    const item = result.item.element;

    item.style.display = '';
  });
}

// Écouteurs d'événements
filterList();
searchInput.addEventListener('input', filterList);
