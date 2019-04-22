'use strict';

function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}

var paymentIdgen = function() {

  var obj = {};

  function ascii_to_hexa(str)
  {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n ++)
       {
      var hex = Number(str.charCodeAt(n)).toString(16);
      arr1.push(hex);
     }
    return arr1.join('');
   }


  function mn_random(bits) {
      // from mymonero.com

      if (bits % 32 !== 0) throw "Something weird went wrong: Invalid number of bits - " + bits;
      var array = new Uint32Array(bits / 32);

      var i = 0;

      function arr_is_zero() {
          for (var j = 0; j < bits / 32; ++j) {
              if (array[j] !== 0) return false;
          }
          return true;
      }

      do {
          /// Doing this in the loop is chunky, blame Microsoft and the in-flux status of the window.crypto standard
          if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
              window.crypto.getRandomValues(array);
          } else if (typeof window !== 'undefined' && typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
              window.msCrypto.getRandomValues(array);
          } else {
              throw "Unfortunately MyMonero only runs on browsers that support the JavaScript Crypto API";
          }

          ++i;
      } while (i < 5 && arr_is_zero());
      if (arr_is_zero()) {
          throw "Something went wrong and we could not securely generate random data for your account";
      }
      // Convert to hex
      var out = '';
      for (var j = 0; j < bits / 32; ++j) {
          out += ('0000000' + array[j].toString(16)).slice(-8);
      }
      return out;
  }


    function strpad(org_str, padString, length)
    {
        var str = org_str;
        while (str.length < length)
            str = padString + str;
        return str;
    };

  obj.paymnet_id_hex = '';

  obj.generateRandomPaymentID = function() {
    obj.paymnet_id_hex = mn_random(256);
  }

  obj.generateRandomID = function(inputElem) {
    obj.generateRandomPaymentID();
    obj.updatedPaymentIDDisply(inputElem);
  }

  obj.generateCustomID = function(evt, inputElem) {
    obj.paymnet_id_hex = strpad(evt.target.value, "0", 64);
    obj.updatedPaymentIDDisply(inputElem);
  }

  obj.generateAsciiID = function(evt, inputElem) {
    obj.paymnet_id_hex = ascii_to_hexa(evt.target.value);
    obj.updatedPaymentIDDisply(inputElem);
  }

  obj.updatedPaymentIDDisply = function(inputElem) {

    var payment_id = obj.paymnet_id_hex;

    if (!/^[0-9a-f]+$/.test(payment_id)) {
         inputElem.value = "payment id has incorrect characters";
         return;
    }

    if (payment_id.length < 64) {
        payment_id = strpad(payment_id, "0", 64);
    } else if (payment_id.length > 64) {
        payment_id = "payment id too long";
    }

    inputElem.value = payment_id;
  }


  return obj;
}

window.onload = (function (oldOnLoad) {
    return function () {
      if (oldOnLoad) {
        olOnLoad();
      }

      var randomIdValue = document.getElementById("random-id-value");
      var customIdValue = document.getElementById("custom-id-value");
      var asciiIdValue  = document.getElementById("ascii-id-value");

      var payID = new paymentIdgen();

      addEvent(document.getElementById("random-id-button"), 'click',
          function() {payID.generateRandomID(randomIdValue)});

      addEvent(document.getElementById("custom-id-input") , 'keyup',
          function(evt) {payID.generateCustomID(evt, customIdValue)});

       addEvent(document.getElementById("ascii-id-input")  , 'keyup',
           function(evt) {payID.generateAsciiID(evt, asciiIdValue)});

    }
  })(window.onload);
