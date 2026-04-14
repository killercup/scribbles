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
