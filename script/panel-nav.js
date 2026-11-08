;(function(){
  var tabsEl = document.getElementById('neronaPageTabs');
  if (tabsEl) {
    tabsEl.addEventListener('click', function(e) {
      var tab = e.target.closest('.nerona-tab');
      if (!tab) return;
      var page = tab.dataset.page;
      document.querySelectorAll('.nerona-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.nerona-page').forEach(function(p) { p.classList.remove('active'); });
      var target = document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1));
      if (target) target.classList.add('active');
    });
  }

  var clearBinBtn = document.getElementById('clearBinBtn');
  if (clearBinBtn) {
    clearBinBtn.addEventListener('click', function() {
      document.getElementById('binInput').value = '';
    });
  }

  var clearCcBtn = document.getElementById('clearCcBtn');
  if (clearCcBtn) {
    clearCcBtn.addEventListener('click', function() {
      document.getElementById('ccInput').value = '';
    });
  }
})();
