(function(){
  // Find all footnote refs (standard Hugo: <sup id="fnref:X"><a ...>N</a></sup>)
  var refs = document.querySelectorAll('sup[id^="fnref:"]');
  for (var i = 0; i < refs.length; i++) {
    var sup = refs[i];
    var ref = sup.id.replace('fnref:', '');
    var index = sup.querySelector('a').textContent;

    // Find the corresponding footnote content
    var li = document.getElementById('fn:' + ref);
    if (!li) continue;

    // Clone content, remove the backref link
    var clone = li.cloneNode(true);
    var backrefs = clone.querySelectorAll('.footnote-backref');
    for (var j = 0; j < backrefs.length; j++) backrefs[j].remove();

    // Create the sidenote element
    var sn = document.createElement('span');
    sn.className = 'sidenote sidenote-fn';
    sn.setAttribute('aria-hidden', 'true');
    sn.setAttribute('data-sn', index);
    sn.id = 'sn-' + ref;
    sn.innerHTML = clone.innerHTML.trim();

    // Insert right after the <sup>
    sup.insertAdjacentElement('afterend', sn);
  }

  // Create sidenotes for links with title attributes
  var article = document.querySelector('article');
  if (article) {
    var links = article.querySelectorAll('a[title]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      // Skip links that are already sidenotes or inside sidenotes
      if (link.closest('.sidenote')) continue;
      var host = '';
      try { host = new URL(link.href).host; } catch (e) {}
      var sn = document.createElement('a');
      sn.href = link.href;
      sn.className = 'sidenote sidenote-link';
      sn.setAttribute('aria-hidden', 'true');
      sn.setAttribute('tabindex', '-1');
      sn.innerHTML =
        '<span class="sidenote-link-domain">' + host + '</span> ' +
        link.title;
      link.insertAdjacentElement('afterend', sn);
    }
  }

  // Swap footnote ref hrefs based on viewport width
  var mq = window.matchMedia('(min-width: 72rem)');
  function updateRefs() {
    for (var i = 0; i < refs.length; i++) {
      var sup = refs[i];
      var ref = sup.id.replace('fnref:', '');
      var link = sup.querySelector('a');
      if (link) link.href = mq.matches ? '#sn-' + ref : '#fn:' + ref;
    }
  }
  updateRefs();
  mq.addEventListener('change', updateRefs);
})();
