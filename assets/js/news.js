/**
 * news.js — Health News RSS loader
 * Fetches Punjab/India health news from Google News RSS via allorigins proxy.
 * Lazy-loaded on first visit to the News page.
 */

let newsLoaded = false;

/**
 * loadNews — fetches and renders up to 9 health news cards.
 * Called by app.js router on first visit to 'news' page.
 */
async function loadNews() {
  const grid   = document.getElementById('news-grid');
  const loader = document.getElementById('news-loader');

  loader.style.display = 'block';
  grid.innerHTML = '';

  try {
    // Fetch from our own backend proxy
    const data = await api.get('/news');
    
    // Google RSS JSON structure: data.rss.channel.item
    const items = data.rss.channel.item.slice(0, 9);

    loader.style.display = 'none';
    newsLoaded = true;

    items.forEach((item, i) => {
      const title = item.title   || 'No title';
      const link  = item.link    || '#';
      const pubDateText = item.pubDate;
      const pub   = new Date(pubDateText)
                      .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span class="badge badge-green">Health News</span>
          <span style="font-size:11px;color:var(--muted)">
            <i class="far fa-clock"></i> ${pub}
          </span>
        </div>
        <h3 style="font-size:14px;font-weight:700;line-height:1.4;margin-bottom:12px;color:var(--text)">
          ${title}
        </h3>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:10px;margin-top:auto">
          <span style="font-size:12px;color:var(--emerald);font-weight:600">
            Read Article <i class="fas fa-arrow-right" style="font-size:10px"></i>
          </span>
        </div>`;

      card.addEventListener('click', () => window.open(link, '_blank'));
      grid.appendChild(card);

      // Staggered fade-in
      setTimeout(() => card.classList.add('show'), i * 150);
    });

  } catch (e) {
    loader.innerHTML = '<span style="color:var(--rose)">❌ Could not load news. Try again later.</span>';
  }
}
