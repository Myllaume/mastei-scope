const formTags = document.getElementById('form-tags');

if (formTags) {
  formTags.addEventListener('change', () => {
    const checkedTags = Array.from(
      formTags.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => input.value);
    const records = document.querySelectorAll('li.r');

    records.forEach((record) => {
      const recordTags = record.getAttribute('data-tags').split(',');

      const isVisible = checkedTags.some((tag) => recordTags.includes(tag));
      record.style.display = isVisible ? '' : 'none';
    });
  });
}
