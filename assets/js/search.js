var SEARCH_INDEX = [
  // Home
  { title: 'Home', url: '/', section: '', snippet: 'Predictive plant breeding powered by quantitative genetics and statistical learning.' },
  { title: 'Welcome', url: '/#welcome', section: 'Home', snippet: 'Research group at the intersection of statistics, genetics, and machine learning at the University of Arkansas.' },
  { title: 'Research Themes', url: '/#research', section: 'Home', snippet: 'Statistics, Quantitative Genetics, Machine Learning, Open-source software development.' },
  { title: 'Lab News & Media', url: '/#news', section: 'Home', snippet: 'Lab news, events, media coverage, press, podcast.' },

  // About
  { title: 'About the Lab', url: '/about', section: '', snippet: 'Quantitative genetics, statistics, and AI connecting genes to traits across plant biology, physiology, and breeding.' },
  { title: 'Overview', url: '/about#overview', section: 'About', snippet: 'Center for Agricultural Data Analytics CADA. Department of Crop, Soil, and Environmental Sciences. University of Arkansas.' },
  { title: 'Mission & Vision', url: '/about#mission-vision', section: 'About', snippet: 'Connect genotype to phenotype. Identify genes behind complex traits. Predict plant performance across environments. GWAS TWAS genomic prediction.' },
  { title: 'Goals', url: '/about#goals', section: 'About', snippet: 'Multi-omics prediction, advance statistical methods, open-source software, AI machine learning, mentoring, breeding partnerships.' },

  // Team
  { title: 'Our Team', url: '/our-team', section: '', snippet: 'Statisticians, geneticists, and computer scientists working across plant breeding.' },
  { title: 'Join Us — Open Positions', url: '/our-team#openings', section: 'Team', snippet: 'Post-doctoral fellow opening in quantitative genetics, genomic prediction and machine learning for plant breeding.' },
  { title: 'Samuel B. Fernandes', url: '/our-team#pi', section: 'Team · PI', snippet: 'Assistant Professor of Agricultural Statistics and Quantitative Genetics. CADA, University of Arkansas Division of Agriculture.' },
  { title: 'Research Staff', url: '/our-team#staff', section: 'Team', snippet: 'Erin Farmer, Program Associate, University of Arkansas Division of Agriculture.' },
  { title: 'PhD Students', url: '/our-team#phd', section: 'Team', snippet: 'Elias Z. Mohellebi — deep learning, GxE predictions, GIS, machine learning, feature engineering.' },
  { title: "Master's Students", url: '/our-team#masters', section: 'Team', snippet: 'Julia Gonçalves Batista, Carlos Ramos Bisinotto, Soni Pinjala, Danilo — statistics, computer science, genomic prediction.' },
  { title: 'Interns', url: '/our-team#interns', section: 'Team', snippet: 'João Pedro Neigri Heleno — data science, machine learning, deep learning, computer engineering.' },
  { title: 'Alumni & Career Paths', url: '/our-team#alumni', section: 'Team', snippet: 'Melina Prado, Igor K. Fernandes, Matthew Murphy, Ashmita Upadhyay — former lab members and their career transitions.' },

  // Teaching
  { title: 'Teaching', url: '/teaching', section: '', snippet: 'Courses, teaching philosophy, and mentoring at the University of Arkansas.' },
  { title: 'Teaching Philosophy', url: '/teaching#philosophy', section: 'Teaching', snippet: 'Connecting quantitative theory to real-world application in plant science and genetics.' },
  { title: 'Courses', url: '/teaching#courses', section: 'Teaching', snippet: 'Graduate and undergraduate courses in statistics, genetics, and data science.' },
  { title: 'Mentoring', url: '/teaching#mentoring', section: 'Teaching', snippet: 'Training the next generation of quantitative geneticists, statisticians, and data scientists.' },

  // Projects
  { title: 'Projects', url: '/projects', section: '', snippet: 'Funded research grants, open-source software tools, and crop study systems.' },
  { title: 'Grants & Funded Projects', url: '/projects#grants', section: 'Projects', snippet: 'FFAR New Innovator Award, USDA-NIFA-AFRI, Arkansas Soybean Promotion Board. Total funding: $2,863,264.' },
  { title: 'simplePHENOTYPES', url: '/projects#software', section: 'Projects · Software', snippet: 'R package for simulating pleiotropic, linked, and epistatic phenotypes. CRAN. Benchmarking GWAS and genomic prediction.' },
  { title: 'SyntheticTraits', url: '/projects#software', section: 'Projects · Software', snippet: 'Tools for building synthetic traits that improve multi-trait genomic prediction using co-heritability.' },
  { title: 'Software & Tools', url: '/projects#software', section: 'Projects', snippet: 'Open-source R packages and code repositories for the breeding and genetics community.' },
  { title: 'Study Systems', url: '/projects#study-systems', section: 'Projects', snippet: 'Soybean, rice, maize, sorghum, blackberry, common bean, eucalyptus. Crop breeding programs.' },

  // Publications
  { title: 'Publications', url: '/publications', section: '', snippet: 'Peer-reviewed papers on genomic prediction, GWAS, quantitative genetics, high-throughput phenotyping, enviromics.' },
  { title: 'Citation Metrics', url: '/publications#metrics', section: 'Publications', snippet: '1,000+ citations, h-index 15, 40+ publications. Google Scholar.' },
  { title: 'Recent Publications', url: '/publications#recent', section: 'Publications', snippet: 'Latest peer-reviewed papers from the Fernandes Lab.' },

  // Contact
  { title: 'Contact Us', url: '/contact', section: '', snippet: 'samuelbf [at] uark [dot] edu · 479-575-5677 · Fayetteville, AR · University of Arkansas Division of Agriculture.' },
];

(function () {
  var overlay  = document.getElementById('search-overlay');
  var input    = document.getElementById('search-input');
  var results  = document.getElementById('search-results');
  var openBtn  = document.querySelector('.search-toggle');
  var closeBtn = document.querySelector('.search-close');

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    results.innerHTML = '';
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn)  openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!overlay) return;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      overlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });

  if (input) {
    input.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }

      var matches = SEARCH_INDEX.filter(function (item) {
        return (item.title + ' ' + item.section + ' ' + item.snippet).toLowerCase().indexOf(q) !== -1;
      });

      if (!matches.length) {
        results.innerHTML = '<p class="search-no-results">No results for "<strong>' + esc(input.value) + '</strong>"</p>';
        return;
      }

      results.innerHTML = matches.map(function (item) {
        var sectionHtml = item.section
          ? '<span class="search-result-section">' + esc(item.section) + ' › </span>'
          : '';
        return '<a class="search-result" href="' + item.url + '">' +
          '<div class="search-result-title">' + sectionHtml + esc(item.title) + '</div>' +
          '<div class="search-result-snippet">' + esc(item.snippet) + '</div>' +
          '</a>';
      }).join('');

      results.querySelectorAll('.search-result').forEach(function (a) {
        a.addEventListener('click', closeSearch);
      });
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
