// Mobile nav toggle
document.addEventListener('click', function (e) {
  var toggle = e.target.closest('.nav-toggle');
  if (toggle) {
    document.querySelector('.nav').classList.toggle('open');
  } else if (!e.target.closest('.nav')) {
    var nav = document.querySelector('.nav.open');
    if (nav) nav.classList.remove('open');
  }
});
