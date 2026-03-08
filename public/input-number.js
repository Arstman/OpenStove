(function () {
  var portionSizeInput = document.querySelector('[data-hs-input-number-input]');
  var portionSize = 1;

  function parseFraction(fraction) {
    if (typeof fraction !== 'string' || fraction.indexOf('/') === -1) {
      return parseFloat(fraction) || 0;
    }
    var parts = fraction.split('/');
    var numerator = Number(parts[0]);
    var denominator = Number(parts[1]);
    return denominator > 0 ? numerator / denominator : NaN;
  }

  function adjustQuantity(quantity, mult) {
    if (!quantity) return '';
    var parsedQuantity = parseFraction(quantity);
    var adjustedQuantity = parsedQuantity * mult;
    return parseFloat(adjustedQuantity.toFixed(2)).toString();
  }

  function updateIngredientQuantities() {
    document.querySelectorAll('.count').forEach(function (el) {
      var quantity = el.dataset.quantity;
      var name = el.dataset.name || '';
      el.textContent = adjustQuantity(quantity || '', portionSize) + ' ' + name;
    });
  }

  updateIngredientQuantities();

  function updatePortionSize(newSize) {
    portionSize = newSize;
    if (portionSizeInput) {
      portionSizeInput.value = String(portionSize);
      updateIngredientQuantities();
      var inc = document.querySelector('[data-hs-input-number-increment]');
      var dec = document.querySelector('[data-hs-input-number-decrement]');
      if (portionSize >= 6) {
        if (inc) inc.setAttribute('disabled', 'disabled');
      } else {
        if (inc) inc.removeAttribute('disabled');
      }
      if (portionSize <= 0) {
        if (dec) dec.setAttribute('disabled', 'disabled');
      } else {
        if (dec) dec.removeAttribute('disabled');
      }
    }
  }

  var increment = document.querySelector('[data-hs-input-number-increment]');
  var decrement = document.querySelector('[data-hs-input-number-decrement]');
  if (increment) {
    increment.addEventListener('click', function () {
      updatePortionSize(Math.min(portionSize + 1, 99));
    });
  }
  if (decrement) {
    decrement.addEventListener('click', function () {
      updatePortionSize(Math.max(portionSize - 1, 0));
    });
  }
})();
