const BOT_URL = "https://t.me/subscriptionVPN_bot";
let tariffCards = [];
let selectedIndex = -1;
let cycleInterval = null;

function goToBot() {
  if (!BOT_URL || BOT_URL === "https://t.me/yourbot") {
    alert("Внимание: ссылка на бота пока не настроена. Свяжитесь с разработчиком.");
    return;
  }

  window.location.href = BOT_URL;
}

function goToInfo() {
  window.location.href = "vpn-info.html";
}

function goToLogin() {
  window.location.href = "login.html";
}

function selectTariff(index) {
  if (!tariffCards.length) return;
  tariffCards.forEach(card => card.classList.remove('selected'));
  selectedIndex = index;
  tariffCards[selectedIndex].classList.add('selected');
}

function runTariffCycle() {
  if (!tariffCards.length) return;
  cycleInterval = setInterval(() => {
    selectedIndex = (selectedIndex + 1) % tariffCards.length;
    selectTariff(selectedIndex);
  }, 1800);
}

function stopTariffCycle() {
  if (cycleInterval !== null) {
    clearInterval(cycleInterval);
    cycleInterval = null;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  tariffCards = Array.from(document.querySelectorAll('.card'));

  tariffCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      selectTariff(index);
      stopTariffCycle();
    });
  });

  // initial selection and autoplay cycling
  selectTariff(0);
  runTariffCycle();
});
