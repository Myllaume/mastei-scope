/**
 * Script de tri de tableau
 * Permet de trier chaque colonne en cliquant sur son en-tête
 */

const table = document.querySelector('table');
const headers = table.querySelectorAll('thead th');
const tbody = table.querySelector('tbody');

// État de tri pour chaque colonne (1 = ascendant, -1 = descendant)
const sortStates = new Array(headers.length).fill(1);

headers.forEach((header, columnIndex) => {
  header.style.cursor = 'pointer';
  header.style.userSelect = 'none';

  // Ajouter un indicateur visuel
  const indicator = document.createElement('span');
  indicator.className = 'sort-indicator';
  indicator.innerHTML = ' ⇅';
  indicator.style.opacity = '0.3';
  header.appendChild(indicator);

  header.addEventListener('click', function () {
    // Alterner entre ascendant et descendant
    sortStates[columnIndex] = sortStates[columnIndex] === 1 ? -1 : 1;

    // Réinitialiser les autres colonnes
    sortStates.forEach((state, idx) => {
      if (idx !== columnIndex) {
        sortStates[idx] = 1;
        headers[idx].querySelector('.sort-indicator').innerHTML = ' ⇅';
        headers[idx].querySelector('.sort-indicator').style.opacity = '0.3';
      }
    });

    // Mettre à jour l'indicateur
    if (sortStates[columnIndex] === 1) {
      indicator.innerHTML = ' ▲';
      indicator.style.opacity = '1';
    } else {
      indicator.innerHTML = ' ▼';
      indicator.style.opacity = '1';
    }

    sortTable(columnIndex, sortStates[columnIndex]);
  });
});

function sortTable(columnIndex, direction) {
  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((rowA, rowB) => {
    const cellA = rowA.children[columnIndex];
    const cellB = rowB.children[columnIndex];

    let valueA, valueB;

    // Si la cellule contient un lien, extraire le texte
    const linkA = cellA.querySelector('a');
    const linkB = cellB.querySelector('a');

    if (linkA && linkB) {
      valueA = linkA.textContent.trim();
      valueB = linkB.textContent.trim();
    } else {
      valueA = cellA.textContent.trim();
      valueB = cellB.textContent.trim();
    }

    // Détecter si ce sont des nombres
    const numA = parseFloat(valueA);
    const numB = parseFloat(valueB);

    let comparison = 0;

    if (!isNaN(numA) && !isNaN(numB)) {
      // Comparaison numérique
      comparison = numA - numB;
    } else {
      // Comparaison alphabétique (insensible à la casse)
      comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    }

    return direction === 1 ? comparison : -comparison;
  });

  // Réorganiser les lignes dans le tableau
  rows.forEach((row) => tbody.appendChild(row));
}
