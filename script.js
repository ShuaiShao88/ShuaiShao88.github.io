document.documentElement.classList.add('js');

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const publicationList = document.querySelector('#publication-list');
const publications = window.portfolioPublications || [];
const authorHTML = (authors) => escapeHTML(authors).replace(/Shao, S\./g, '<strong>Shao, S.</strong>');

function renderPublications(filter = 'all') {
  if (!publicationList) return;
  const items = publications.filter(item => filter === 'all' || item.group === filter);
  publicationList.innerHTML = items.map(item => {
    const index = publications.indexOf(item);
    return `<article class="publication"><div class="publication-meta"><span class="publication-status ${item.group === 'review' ? 'status-review' : ''}">${escapeHTML(item.status)}</span>${item.firstAuthor ? '<span class="first-author">First author</span>' : ''}</div><div class="publication-content"><h3>${item.url ? `<a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)} <span aria-hidden="true">↗</span></a>` : escapeHTML(item.title)}</h3><p class="publication-authors">${authorHTML(item.authors)}</p><p class="publication-venue">${escapeHTML(item.venue)}</p>${item.summary ? `<p class="publication-summary">${escapeHTML(item.summary)}</p>` : ''}<button class="copy-citation" data-citation="${index}" aria-label="Copy citation for ${escapeHTML(item.title)}">Copy citation <span aria-hidden="true">↗</span></button></div></article>`;
  }).join('');
  const count = document.querySelector('#publication-count');
  if (count) count.textContent = `${items.length} works`;
}

renderPublications();
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  renderPublications(button.dataset.filter);
}));

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

if (publicationList) publicationList.addEventListener('click', async event => {
  const button = event.target.closest('[data-citation]');
  if (!button) return;
  const citation = publications[Number(button.dataset.citation)]?.citation;
  if (!citation) return;
  try {
    await navigator.clipboard.writeText(citation);
    showToast('Citation copied to clipboard');
  } catch {
    const field = document.createElement('textarea');
    field.value = citation;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    button.focus();
    if (copied) showToast('Citation copied to clipboard');
    else {
      const existing = button.parentElement.querySelector('.citation-text');
      if (!existing) {
        const text = document.createElement('p');
        text.className = 'citation-text';
        text.textContent = citation;
        button.insertAdjacentElement('afterend', text);
      }
      showToast('Select the citation below to copy it');
    }
  }
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('open');
}
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

if ('IntersectionObserver' in window && navigation) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));
