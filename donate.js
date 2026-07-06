/* ============================================
   DONATE PAGE — campaigns, donor wall, giving
   ============================================

   HOW TO ADD OR UPDATE A CAMPAIGN
   Campaigns are managed entirely from a Google Sheet — set
   CAMPAIGN_SHEET_CSV_URL below and it's the only source of truth (the
   CAMPAIGNS array stays empty in code, same as DONORS, so nothing
   fake ever shows before it's configured or if the fetch fails):
   1. Make a Google Sheet with header row: id, title, tagline, goal,
      raised, status, deadline, donateLink
      - id: a short unique slug, e.g. "winter-study-kits-2026". This
        is also what donors' campaignId values in the donor sheet
        should match to count toward this campaign's total.
      - goal / raised: plain numbers, no ₹ symbol or commas (e.g. 250000).
        `raised` is a baseline — cash/offline gifts, or a starting
        total from before the sheet existed. Any donor-sheet row whose
        campaignId matches this id gets added on top automatically.
      - status: leave blank/"active", or type "completed" once a
        campaign is done — the card then shows the green "Done" badge
        and locks the progress bar. This is never set automatically,
        even if the raised total reaches the goal, so you control
        exactly when a campaign is declared finished.
      - deadline: optional, e.g. "2026-08-15". Leave blank for no
        countdown.
      - donateLink: optional — a Razorpay Payment Page/Link or any
        hosted checkout URL for that specific campaign. Leave blank
        to fall back to a pre-filled WhatsApp message.
   2. File -> Share -> Publish to web -> select the sheet -> CSV ->
      copy that URL into CAMPAIGN_SHEET_CSV_URL below. Add a new row
      any time you want a new campaign to appear — no code, no pushes.

   PAYMENT_CONFIG
   Fill these in once you have real payment accounts. Every field is
   optional and its button simply won't render until it's set:
   - whatsappNumber: already wired to the number in the site footer.
   - razorpayLink: a Razorpay Payment Page/Link URL. Free to create,
     accepts Indian UPI/cards/netbanking AND international cards —
     the cheapest all-in-one option for an India-based org with
     donors abroad. razorpay.com/payment-pages
   - upiId: a UPI VPA like 'flyhighfoundation@okaxis'. Completely
     free, opens directly in GPay/PhonePe/Paytm on a donor's phone.
     India-only, mobile-only.
   - paypalMeLink: a paypal.me link for international donors who
     prefer PayPal over a card.

   WALL OF KINDNESS — AUTOMATING IT
   By default the wall reads the DONORS array below (hand-edited,
   same pattern as team.js's TEAM array). To stop editing code every
   time someone gives, set DONOR_SHEET_CSV_URL instead:
   1. Make a Google Sheet with header row: name, amount, date, campaignId
      (leave campaignId blank for general/unrestricted gifts — those
      still show on the wall but don't count toward any campaign's
      progress bar). campaignId must exactly match a campaign's `id`
      in the CAMPAIGNS array below, e.g. "winter-study-kits-2026".
      Format the date column as a full date (Format -> Number -> Date)
      so it always includes a year — a year-less value like "July 3"
      still works (the code assumes the current year), but an
      explicit year avoids any ambiguity once entries carry over into
      a new year.
   2. File -> Share -> Publish to web -> select the sheet -> CSV ->
      copy that URL into DONOR_SHEET_CSV_URL below. The page will
      fetch it on load and render whatever rows are in the sheet —
      add a row, refresh the page, done. No code, no pushes.
   3. To skip typing rows in yourself entirely: connect your payment
      gateway (e.g. Razorpay) to that same sheet with a free Zapier
      or Make.com automation — trigger "New Payment" -> action "Add
      Row to Google Sheet". Every completed donation then lands on
      the Wall of Kindness on its own.

   IMPORTANT — testing this locally: if you open donate.html by
   double-clicking it (file:// in the address bar), the sheet fetch
   will fail and the wall will show the empty state — Google Sheets'
   CORS policy blocks requests from a file:// page's "null" origin.
   This is a browser restriction, not a bug. Preview with a real
   local server instead (`npx serve .` or `python3 -m http.server`,
   see the project README) and it works. Once the site is actually
   hosted on a real domain, it works for visitors with no extra step.
   ============================================ */

(function () {

  var PAYMENT_CONFIG = {
    whatsappNumber: '919403770044',
    razorpayLink: '',
    upiId: '',
    paypalMeLink: ''
  };

  var DONOR_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQeDr1whZaxJvyBgNEIZcvtNOri6HUAgPaTNRcSbikD1Ni2sresATx-OKO58RQn1jGS4lnA3BwcVlbo/pub?output=csv';

  var CAMPAIGN_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnAqStausPOYiu_kYR_G-utZZSlB89GVeziaEhL5HnA-RlOco_JlQ-n-wc_mBo_kztqoLvYmrFtCjZ/pub?output=csv';

  // Real campaigns only — populated entirely from CAMPAIGN_SHEET_CSV_URL
  // above. Stays empty if the sheet hasn't loaded yet or fails to fetch,
  // so the page never shows placeholder/dummy campaigns.
  var CAMPAIGNS = [];

  // Real donors only — populated entirely from DONOR_SHEET_CSV_URL above.
  // Stays empty if the sheet hasn't loaded yet or fails to fetch, so the
  // wall never shows placeholder/dummy names.
  var DONORS = [];

  var currency = '₹';

  // ---------- helpers ----------

  function formatMoney(n) {
    return currency + n.toLocaleString('en-IN');
  }

  function whatsappUrl(message) {
    return 'https://wa.me/' + PAYMENT_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
  }

  // Used for both donor dates and campaign deadlines. Google Sheets date
  // columns often display without a year (e.g. "July 3"), which JS then
  // parses using an arbitrary fallback year — silently breaking date
  // comparisons. If no 4-digit year is present, assume the current year.
  //
  // Slash-separated dates (e.g. "3/7/2026") are also ambiguous — JS's Date
  // constructor assumes US-style MM/DD/YYYY, which silently misreads a date
  // typed the Indian way (DD/MM/YYYY) as the wrong month. Since sheets here
  // will naturally have dates typed day-first, parse "D/M/Y" explicitly.
  function parseFlexibleDate(raw) {
    if (!raw) return null;
    raw = raw.trim();

    var slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slashMatch) {
      var day = parseInt(slashMatch[1], 10);
      var month = parseInt(slashMatch[2], 10);
      var year = parseInt(slashMatch[3], 10);
      if (year < 100) year += 2000;
      var slashDate = new Date(year, month - 1, day);
      return isNaN(slashDate.getTime()) ? null : slashDate;
    }

    var str = /\d{4}/.test(raw) ? raw : raw + ', ' + new Date().getFullYear();
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // Minimal CSV parser (handles quoted fields containing commas) so the
  // campaign/donor sheets can be read as CSV with no dependencies.
  function parseCSV(text) {
    var rows = [];
    var lines = text.replace(/\r\n/g, '\n').split('\n').filter(function (l) { return l.length; });
    for (var i = 0; i < lines.length; i++) {
      var row = [];
      var cur = '';
      var inQuotes = false;
      var line = lines[i];
      for (var j = 0; j < line.length; j++) {
        var ch = line[j];
        if (inQuotes) {
          if (ch === '"') {
            if (line[j + 1] === '"') { cur += '"'; j++; } else { inQuotes = false; }
          } else {
            cur += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          row.push(cur); cur = '';
        } else {
          cur += ch;
        }
      }
      row.push(cur);
      rows.push(row);
    }
    return rows;
  }

  // strips any existing #hash so shared/deep-link URLs are built from a clean base,
  // and works the same whether the page is served over http(s) or opened via file://
  function pageUrl(hash) {
    var base = window.location.href.split('#')[0];
    return base + '#' + hash;
  }

  function showToast(message) {
    var toast = document.getElementById('share-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Link copied! Paste it anywhere.');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      showToast('Link copied! Paste it anywhere.');
    } catch (e) {
      showToast('Copy failed — long-press the link to copy it.');
    }
    document.body.removeChild(el);
  }

  // ---------- Ways to give ----------

  var giveActions = document.getElementById('give-actions');

  function renderGiveActions() {
    if (!giveActions) return;
    var waMessage = 'Hi! I’d like to donate to Fly High Foundation.';
    var buttons = [];

    buttons.push(
      '<a class="give-action-btn" href="' + whatsappUrl(waMessage) + '" target="_blank" rel="noopener">' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.33-.79-.71-1.33-1.58-1.48-1.85-.16-.27-.02-.41.13-.55.14-.14.32-.36.48-.54.16-.18.21-.31.32-.52.11-.21.05-.39-.02-.54-.07-.14-.62-1.5-.85-2.05-.23-.55-.46-.47-.63-.48h-.54c-.18 0-.46.07-.7.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.64 1.11 2.82.14.18 1.85 2.83 4.49 3.86 2.63 1.03 2.63.69 3.1.64.48-.05 1.6-.65 1.83-1.29.23-.64.23-1.18.16-1.29-.07-.11-.25-.18-.52-.32z"/><path d="M12.04 2C6.5 2 2 6.5 2 12.04c0 1.94.55 3.75 1.5 5.29L2 22l4.86-1.46c1.46.79 3.14 1.24 4.93 1.24h.01c5.54 0 10.04-4.5 10.04-10.04S17.58 2 12.04 2zm0 18.27h-.01c-1.6 0-3.16-.43-4.51-1.24l-.32-.19-3.34 1 1.02-3.28-.21-.34a8.18 8.18 0 0 1-1.27-4.43c0-4.56 3.71-8.27 8.27-8.27 4.56 0 8.27 3.71 8.27 8.27 0 4.56-3.71 8.48-8.4 8.48z"/></svg>' +
      'Donate via WhatsApp</a>'
    );

    if (PAYMENT_CONFIG.razorpayLink) {
      buttons.push(
        '<a class="give-action-btn give-action-btn--secondary" href="' + PAYMENT_CONFIG.razorpayLink + '" target="_blank" rel="noopener">Pay by Card / UPI / Netbanking</a>'
      );
    }
    if (PAYMENT_CONFIG.upiId) {
      var upiLink = 'upi://pay?pa=' + encodeURIComponent(PAYMENT_CONFIG.upiId) + '&pn=' + encodeURIComponent('Fly High Foundation') + '&cu=INR';
      buttons.push(
        '<a class="give-action-btn give-action-btn--secondary" href="' + upiLink + '">Pay via UPI App</a>'
      );
    }
    if (PAYMENT_CONFIG.paypalMeLink) {
      buttons.push(
        '<a class="give-action-btn give-action-btn--secondary" href="' + PAYMENT_CONFIG.paypalMeLink + '" target="_blank" rel="noopener">Pay with PayPal (International)</a>'
      );
    }

    giveActions.innerHTML = buttons.join('');
  }

  renderGiveActions();

  // ---------- Campaigns ----------

  var campaignsGrid = document.getElementById('campaigns-grid');

  var shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.4 10.7l7.2-4.1M8.4 13.3l7.2 4.1"/></svg>';
  var heartIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" xmlns="http://www.w3.org/2000/svg"><path d="M12 20s-7.5-4.7-9.7-9.2C.8 7.2 2.6 4 6 4c2 0 3.4 1.1 4 2.3C10.6 5.1 12 4 14 4c3.4 0 5.2 3.2 3.7 6.8C19.5 15.3 12 20 12 20z" stroke-linejoin="round"/></svg>';

  function daysLeft(deadline) {
    var d = parseFlexibleDate(deadline);
    if (!d) return null;
    var diff = Math.ceil((d - new Date()) / 86400000);
    return diff;
  }

  function buildCampaignCard(c) {
    var pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
    var complete = c.status === 'completed';
    var left = daysLeft(c.deadline);

    var metaText = complete
      ? 'Fully funded'
      : (left !== null && left >= 0 ? left + ' day' + (left === 1 ? '' : 's') + ' left' : 'Ongoing');

    var card = document.createElement('article');
    card.className = 'campaign-card' + (complete ? ' is-complete' : '');
    card.id = 'campaign-' + c.id;
    card.style.setProperty('--target-pct', pct + '%');

    card.innerHTML =
      '<div class="campaign-card-top">' +
        '<h3 class="campaign-title">' + c.title + '</h3>' +
        '<span class="campaign-badge' + (complete ? ' campaign-badge--done' : '') + '">' + (complete ? '✓ Done' : 'Active') + '</span>' +
      '</div>' +
      '<p class="campaign-tagline">' + c.tagline + '</p>' +
      '<div class="campaign-progress-track"><div class="campaign-progress-fill"></div></div>' +
      '<div class="campaign-stats">' +
        '<span class="campaign-raised">' + formatMoney(c.raised) + ' raised</span>' +
        '<span class="campaign-goal">of ' + formatMoney(c.goal) + '</span>' +
      '</div>' +
      '<div class="campaign-meta"><span>' + pct + '% funded</span><span>' + metaText + '</span></div>' +
      '<div class="campaign-actions">' +
        (complete
          ? '<button type="button" class="campaign-donate-btn" disabled>Thank you — goal reached!</button>'
          : '<a class="campaign-donate-btn" href="' + (c.donateLink || whatsappUrl('Hi! I’d like to donate to the “' + c.title + '” campaign.')) + '" target="_blank" rel="noopener">Donate to This</a>'
        ) +
        '<button type="button" class="campaign-share-btn" data-share-id="' + c.id + '" data-share-title="' + c.title + '" aria-label="Share this campaign">' + shareIcon + '</button>' +
      '</div>';

    return card;
  }

  // (Re)builds the campaign grid from the current CAMPAIGNS array. Called
  // once synchronously if no sheet is configured, or once the campaign
  // sheet finishes loading if it is.
  function renderCampaigns() {
    if (!campaignsGrid) return;

    if (!CAMPAIGNS.length) {
      campaignsGrid.innerHTML = '<div class="empty-state-card">' + heartIcon + '<p>No active campaigns right now — check back soon.</p></div>';
      return;
    }

    campaignsGrid.innerHTML = '';
    CAMPAIGNS.forEach(function (c) {
      campaignsGrid.appendChild(buildCampaignCard(c));
    });

    // reveal progress bars + animate their fill as each card scrolls into view
    var cards = campaignsGrid.querySelectorAll('.campaign-card');
    if ('IntersectionObserver' in window) {
      var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      cards.forEach(function (card) { cardObserver.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add('is-revealed'); });
    }

    // deep-link support: /donate.html#campaign-<id> scrolls to and briefly highlights the card
    if (window.location.hash.indexOf('#campaign-') === 0) {
      var target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('is-highlighted');
          setTimeout(function () { target.classList.remove('is-highlighted'); }, 2400);
        }, 300);
      }
    }
  }

  // Share-button clicks are delegated to the grid container itself, so this
  // only needs to be wired up once even though renderCampaigns() may
  // rebuild the cards inside it after the sheet loads.
  if (campaignsGrid) {
    campaignsGrid.addEventListener('click', function (e) {
      var shareBtn = e.target.closest('.campaign-share-btn');
      if (!shareBtn) return;

      var id = shareBtn.getAttribute('data-share-id');
      var title = shareBtn.getAttribute('data-share-title');
      var url = pageUrl('campaign-' + id);
      var shareData = {
        title: title + ' — Fly High Foundation',
        text: 'Help fund “' + title + '” for Fly High Foundation:',
        url: url
      };

      // Try the native share sheet first (best UX on the phones almost all of
      // our visitors use). If it's unavailable, unsupported on this origin, or
      // fails for any reason other than the user dismissing it, always fall
      // back to copying the link — never fail silently.
      if (navigator.share) {
        try {
          navigator.share(shareData).catch(function (err) {
            if (err && err.name === 'AbortError') return;
            copyToClipboard(url);
          });
        } catch (err) {
          copyToClipboard(url);
        }
      } else {
        copyToClipboard(url);
      }
    });
  }

  // Loads CAMPAIGN_SHEET_CSV_URL if configured, replacing the sample
  // CAMPAIGNS array with the sheet's rows before rendering. Calls `done`
  // once campaigns are in the DOM (whether from the sheet, the fallback
  // array, or an empty state), so callers can safely rely on
  // `#campaign-<id>` elements existing afterward.
  function loadCampaignSheet(done) {
    if (!CAMPAIGN_SHEET_CSV_URL) {
      renderCampaigns();
      done();
      return;
    }
    fetch(CAMPAIGN_SHEET_CSV_URL)
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var rows = parseCSV(text);
        if (!rows.length) { renderCampaigns(); done(); return; }

        var headers = rows[0].map(function (h) { return h.trim().toLowerCase(); });
        var idIdx = headers.indexOf('id');
        var titleIdx = headers.indexOf('title');
        var taglineIdx = headers.indexOf('tagline');
        var goalIdx = headers.indexOf('goal');
        var raisedIdx = headers.indexOf('raised');
        var statusIdx = headers.indexOf('status');
        var deadlineIdx = headers.indexOf('deadline');
        var linkIdx = headers.indexOf('donatelink');

        if (idIdx === -1 || titleIdx === -1 || goalIdx === -1) { renderCampaigns(); done(); return; }

        var parsed = rows.slice(1)
          .filter(function (r) { return r[idIdx] && r[idIdx].trim(); })
          .map(function (r) {
            return {
              id: r[idIdx].trim(),
              title: titleIdx > -1 ? r[titleIdx].trim() : '',
              tagline: taglineIdx > -1 ? r[taglineIdx].trim() : '',
              goal: goalIdx > -1 ? (parseInt(r[goalIdx], 10) || 0) : 0,
              raised: raisedIdx > -1 ? (parseInt(r[raisedIdx], 10) || 0) : 0,
              status: (statusIdx > -1 && r[statusIdx].trim().toLowerCase() === 'completed') ? 'completed' : 'active',
              deadline: deadlineIdx > -1 ? r[deadlineIdx].trim() : '',
              donateLink: linkIdx > -1 ? r[linkIdx].trim() : ''
            };
          });

        if (parsed.length) CAMPAIGNS = parsed;
        renderCampaigns();
        done();
      })
      .catch(function () {
        // sheet unreachable — fall back to the sample CAMPAIGNS array instead of an empty page
        renderCampaigns();
        done();
      });
  }

  // ---------- Wall of Kindness ----------

  var wallBoard = document.getElementById('wall-board');
  var wallSubline = document.getElementById('wall-subline');
  var wallToggle = document.getElementById('wall-toggle');
  var showingAll = false;

  function recentDonors() {
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return DONORS.filter(function (d) {
      var parsed = parseFlexibleDate(d.date);
      return parsed && parsed >= cutoff;
    });
  }

  function sortedDonors(list) {
    return list.slice().sort(function (a, b) {
      var da = parseFlexibleDate(a.date);
      var db = parseFlexibleDate(b.date);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });
  }

  function renderWall() {
    if (!wallBoard) return;
    var list = sortedDonors(showingAll ? DONORS : recentDonors());

    if (!list.length) {
      wallBoard.innerHTML = '<div class="empty-state-card">' + heartIcon + '<p>Be the first supporter this month — your name goes up here.</p></div>';
    } else {
      wallBoard.innerHTML = list.map(function (d) {
        return '<div class="donor-tag"><span class="donor-tag-name">' + d.name + '</span>' +
          (d.amount ? '<span class="donor-tag-amount">' + formatMoney(d.amount) + '</span>' : '') +
          '</div>';
      }).join('');
    }

    if (wallSubline) {
      wallSubline.textContent = showingAll
        ? list.length + ' supporter' + (list.length === 1 ? '' : 's') + ', all time.'
        : list.length + ' supporter' + (list.length === 1 ? '' : 's') + ' in the last 30 days.';
    }
    if (wallToggle) {
      wallToggle.textContent = showingAll ? 'Show Last 30 Days' : 'View All-Time Supporters';
    }
  }

  if (wallToggle) {
    wallToggle.addEventListener('click', function () {
      showingAll = !showingAll;
      renderWall();
    });
  }

  function loadDonorWall() {
    if (!DONOR_SHEET_CSV_URL) {
      renderWall();
      return;
    }
    fetch(DONOR_SHEET_CSV_URL)
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var rows = parseCSV(text);
        if (!rows.length) { renderWall(); return; }
        var headers = rows[0].map(function (h) { return h.trim().toLowerCase(); });
        var nameIdx = headers.indexOf('name');
        var amountIdx = headers.indexOf('amount');
        var dateIdx = headers.indexOf('date');
        var campaignIdx = headers.indexOf('campaignid');

        if (nameIdx === -1 || dateIdx === -1) { renderWall(); return; }

        var parsed = rows.slice(1)
          .filter(function (r) { return r[nameIdx] && r[nameIdx].trim(); })
          .map(function (r) {
            return {
              name: r[nameIdx].trim(),
              amount: amountIdx > -1 ? (parseInt(r[amountIdx], 10) || 0) : 0,
              date: dateIdx > -1 ? r[dateIdx].trim() : '',
              campaignId: campaignIdx > -1 ? r[campaignIdx].trim() : ''
            };
          });

        if (parsed.length) DONORS = parsed;
        renderWall();
        applyDonorTotalsToCampaigns();
      })
      .catch(function () {
        // sheet unreachable — keep showing the sample/fallback data instead of an empty wall
        renderWall();
      });
  }

  // Adds up sheet donations by campaignId and updates each matching
  // campaign card's raised amount / percentage / progress bar on top of
  // its baseline `raised` value. Doesn't touch `status` — completion is
  // still a manual flip in the CAMPAIGNS array.
  function applyDonorTotalsToCampaigns() {
    if (!campaignsGrid) return;

    var sums = {};
    DONORS.forEach(function (d) {
      if (!d.campaignId) return;
      sums[d.campaignId] = (sums[d.campaignId] || 0) + (d.amount || 0);
    });

    CAMPAIGNS.forEach(function (c) {
      var extra = sums[c.id];
      if (!extra) return;

      var totalRaised = c.raised + extra;
      var pct = Math.min(100, Math.round((totalRaised / c.goal) * 100));
      var card = document.getElementById('campaign-' + c.id);
      if (!card) return;

      var raisedEl = card.querySelector('.campaign-raised');
      var metaPctEl = card.querySelector('.campaign-meta span:first-child');
      if (raisedEl) raisedEl.textContent = formatMoney(totalRaised) + ' raised';
      if (metaPctEl) metaPctEl.textContent = pct + '% funded';
      card.style.setProperty('--target-pct', pct + '%');
    });
  }

  // Campaign cards must exist in the DOM before donor totals can be applied
  // to them, so load campaigns first and only then load the donor wall
  // (which applies matching campaignId totals once it finishes).
  loadCampaignSheet(function () {
    loadDonorWall();
  });

})();
