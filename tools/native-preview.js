// Only for the private captured preview; the real site's theme handler is untouched.
if (document.documentElement.dataset.ffPreview === 'true') {
  const toggle = document.querySelector('header [role="switch"]');
  toggle?.addEventListener('click',()=>{
    const dark = document.documentElement.classList.toggle('dark');
    toggle.setAttribute('aria-checked',String(dark));
  });
}
