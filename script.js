'use strict';
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', e => {
  if (e.target.closest('a')) { toggle.setAttribute('aria-expanded','false'); navigation.classList.remove('open'); }
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape' && toggle.getAttribute('aria-expanded')==='true') {
    toggle.setAttribute('aria-expanded','false'); navigation.classList.remove('open'); toggle.focus();
  }
});
const cards = [...document.querySelectorAll('.plan[data-offer]')];
const need = document.querySelector('#need');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function selectOffer(value, updateForm = true) {
  cards.forEach(card => {
    const selected = card.dataset.offer === value;
    card.classList.toggle('is-selected', selected);
    card.querySelector('.plan-choice').checked = selected;
  });
  if (updateForm) need.value = value;
}
selectOffer('Croissance');
cards.forEach(card => {
  card.querySelector('.plan-choice').addEventListener('change', () => selectOffer(card.dataset.offer));
  card.querySelector('.plan-link').addEventListener('click', () => selectOffer(card.dataset.offer));
  card.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || motionPreference.matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.setProperty('--tilt-x', `${-y * 7}deg`);
    card.style.setProperty('--tilt-y', `${x * 7}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});
need.addEventListener('change', () => selectOffer(need.value, false));
const form = document.querySelector('#contact-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  const email = String(data.get('email')).trim();
  const need = String(data.get('need')).trim();
  const message = String(data.get('message')).trim();
  if (!name || !message) {
    const field = !name ? form.elements.name : form.elements.message;
    field.setCustomValidity('Veuillez renseigner ce champ.');field.reportValidity();
    field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});return;
  }
  const subject = `Demande A.DCOM${need ? ' — '+need : ''}`;
  const body = `Bonjour A.DCOM,\n\n${message}\n\nNom : ${name}\nE-mail : ${email}\nBesoin : ${need || 'À définir'}\n`;
  const mailto = `mailto:partenariatadcom@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.querySelector('#form-status');
  status.replaceChildren();
  const text = document.createElement('p');
  text.textContent = 'Votre demande est prête. Validez son envoi dans votre messagerie. Rien n’a encore été envoyé par ce site.';
  const retry = document.createElement('a');retry.href=mailto;retry.textContent='Ouvrir à nouveau ma messagerie';
  const alternate = document.createElement('a');alternate.href=`https://wa.me/221786650693?text=${encodeURIComponent(body)}`;alternate.target='_blank';alternate.rel='noopener noreferrer';alternate.textContent='Continuer sur WhatsApp';
  status.append(text,retry,document.createElement('br'),alternate);status.hidden=false;
  window.location.href=mailto;
});
