//to do: document

function cipher() {
  //changes the inputs under the buttons based on the selected cipher
  function changeHTML(type) {
    var html;
    switch (type) {
      case "caesar":
        html = '<label for="shift">Right shift:&nbsp;</label><input type="text" id="shift" size="5">';
        break;
      case "atbash":
        html = '';
        break;
      case "affine":
        html = '<label for="key">Multiplicative key:&nbsp;</label><input type="text" id="key" size="5"><label for="shift">Right shift:&nbsp;</label><input type="text" id="shift" size="5">';
        break;
      case "vigenere":
        html = '<label for="key">Key:&nbsp;</label><input type="text" id="key" style="text-transform: uppercase" size="20">';
        break;
    }
    $("#data").html(html);
  };

  //Caesar cipher, p = 1 for encryption and p = -1 for decryption
  function caesar(p) {
    var shift = $("#shift").val();    //how much to shift the letters by
    if (shift === "" || isNaN(shift) || shift != parseInt(shift)) {
      alert("Please enter an integer to shift by.")
      return false;
    } else
      shift = parseInt(shift) * p;    //if p = -1, reverses the shift for decryption

    var text = $("#input").val().toUpperCase();
    var letters = text.split("");
    var char;
    for (var i = 0; i < letters.length; i++) {
      char = letters[i].charCodeAt(0);
      if (char > 64 && char < 91) {    //A = 65, Z = 90
        char = (char - 65 + shift).mod(26) + 65;  //bring charcode range to 0-25, apply shift modulo 26, return char range to normal
      }
      letters[i] = char;
    }
    $("#output").val(String.fromCharCode.apply(null, letters));
  }

  //Atbash cipher, reverses letter to number assignment (i.e. Z = 0, Y = 1, X = 2...B = 24, A = 25), encryption is same as decryption
  function atbash() {
    var text = $("#input").val().toUpperCase();
    var letters = text.split("");
    var char;
    for (var i = 0; i < letters.length; i++) {
      char = letters[i].charCodeAt(0);
      if (char > 64 && char < 91) {   //A = 65, Z = 90
        char -= 65;                   //bring charcode range to 0-25
        char = 25 - char + 65;        //distance from letter to size of alphabet, effectively reversing letter-number assignment
      }                               //  and returns char range to normal
      letters[i] = char;
    }
    $("#output").val(String.fromCharCode.apply(null, letters));
  }

  //Affine cipher: (ac + b) mod 26, a: key, b: shift, c: original letter; p = 1 for encryption and p = -1 for decryption
  function affine(p) {
    var key = $("#key").val();      //multiplicative key, "a" in the function
    var shift = $("#shift").val();  //how much to shift the letters by, "b" in the function
    if (key === "" || isNaN(key) || key != parseInt(key)) {
      alert("Please enter an integer for the key.")
      return false;
    } else if (shift === "" || isNaN(shift) || shift != parseInt(shift)) {
      alert("Please enter an integer to shift by.")
      return false;
    } else {
      key = parseInt(key);
      shift = parseInt(shift);
    }

    var text = $("#input").val().toUpperCase();
    var letters = text.split("");
    var char;
    for (var i = 0; i < letters.length; i++) {
      char = letters[i].charCodeAt(0);
      if (char > 64 && char < 91) {   //A = 65, Z = 90
        if (p > 0) char = ((char - 65) * key + (shift * p)).mod(26) + 65; //encryption, follows above function
        else {  //decryption
          var invKey = modInv(key, 26);                         //find modular inverse of "a"
          char = (invKey * (char - 65 - shift)).mod(26) + 65;   //shift by opposite of "b", multiply by inverse, modulo 26
        }
      }
      letters[i] = char;
    }
    $("#output").val(String.fromCharCode.apply(null, letters));
  }

  //Vigenère cipher, shift changes for each letter of key, p = 1 for encryption and p = -1 for decryption
  function vigenere(p) {
    var key = $("#key").val().toUpperCase();
    if (key === "" || !/^[a-zA-Z]*$/g.test(key)) {      //only letters allowed for key
      alert("Please enter a valid key (only letters).")
      return false;
    }

    var text = $("#input").val().toUpperCase();
    var letters = text.split("");
    var keyChars = key.split("");
    var error = 0;        //to account for non-letter characters that might affect encryption/decryption
    var char, shift;
    for (var i = 0; i < letters.length; i++) {
      char = letters[i].charCodeAt(0);
      if (char > 64 && char < 91) {
        shift = (keyChars[(i - error).mod(keyChars.length)].charCodeAt(0) - 65) * p;  //numeric equiv. of current letter of key
        char = (char - 65 + shift).mod(26) + 65;    //caesar shift based on the current key letter
      }
      else
        error++;    //account for non-letter characters, used to point to correct letter in key
      letters[i] = char;
    }
    $("#output").val(String.fromCharCode.apply(null, letters));
  }

  //to account for negative number modulo javascript bug
  Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
  }

  //find modular inverse of an integer "a", mod "m"
  function modInv(a, m) {
    var v = 1;
    var d = a;
    var u = (a == 1);
    var t = 1 - u;
    if (t == 1) {
      var c = m.mod(a);
      u = Math.floor(m / a);
      while (c != 1 && t == 1) {
        var q = Math.floor(d / c);
        d = d.mod(c);
        v += (q * u);
        t = (d != 1);
        if (t == 1) {
          q = Math.floor(c / d);
          c = c.mod(d);
          u += (q * v);
        }
      }
      u = v * (1 - t) + t * (m - u);
    }
    return u;
  }

  return {
    changeHTML: changeHTML,
    caesar: caesar,
    atbash: atbash,
    affine: affine,
    vigenere: vigenere
  };
};

$(document).ready(function() {
  $("#input").focus();
  var c = cipher();

  //changes inputs below buttons based on selected cipher
  $(".btn-ciph").click(function() {
    var ciphType = $(this).attr("id");
    c.changeHTML(ciphType);
  });

  //encrypts text based on selected cipher, 1 is passed as arg to signify encryption
  $("#encrypt").click(function() {
    var ciphType = $(".active").attr("id");
    if (ciphType == "caesar")
      c.caesar(1);
    else if (ciphType == "atbash")
      c.atbash();   //encryption is same as decryption for atbash, no arg needed
    else if (ciphType == "affine")
      c.affine(1);
    else if (ciphType == "vigenere")
      c.vigenere(1);
  });

  //decrypts text based on selected cipher, -1 is passed as arg to signify decryption
  $("#decrypt").click(function() {
    var ciphType = $(".active").attr("id");
    if (ciphType == "caesar")
      c.caesar(-1);
    else if (ciphType == "atbash")
      c.atbash();   //encryption is same as decryption for atbash, no arg needed
    else if (ciphType == "affine")
      c.affine(-1);
    else if (ciphType == "vigenere")
      c.vigenere(-1);
  });
});