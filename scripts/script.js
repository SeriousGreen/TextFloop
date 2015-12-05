var canvas;
var ctx;
var interval;

var time = (1000 * 60 * 2);
var score = 0;


var boxes = new Array(null, null, null, null, null, null);
var guess = new Array(null, null, null, null, null, null);

var word = ['', '', '', '', '', ''];

var solutionWords = new Array(); //2d array, holds the words the user must find,
//and a flag to indicate whether that word has been found or not
var solutionWordObjects = new Array(); //new


var leftToFind = 0;
var foundSixLetterWord = false;


//main method
var drawMe = function() {
  canvas = document.getElementById('myCanvas');
  canvas.tabIndex = 1; //needed to intercept spacebar/backspace key defaults
  ctx = document.getElementById('myCanvas').getContext('2d');

  //canvas.addEventListener("click", doMouseDown);
  window.addEventListener("keydown", doKeyDownMessage);

  //draw the background
  drawBG();

  //post a welcome message
  splashMessage("Welcome! Press any key to begin.");

};

//    ######## ####  ######  ##    ##  ######
//       ##     ##  ##    ## ##   ##  ##    ##
//       ##     ##  ##       ##  ##   ##
//       ##     ##  ##       #####     ######
//       ##     ##  ##       ##  ##         ##
//       ##     ##  ##    ## ##   ##  ##    ##
//       ##    ####  ######  ##    ##  ######

var move = function() {
  //clear the screen
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawBG();

  //drawToFindBoxes();
  //console.log("object array length: " + solutionWordObjects.length);
  for (var i = 0;i < solutionWordObjects.length; i++) {
    solutionWordObjects[i].draw();
  }

  //draw the timer
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Time:", 170, 350);
  ctx.fillText(time, 175, 375);
  time -= 50;

  //draw the score
  ctx.fillText("Score:", 170, 300);
  ctx.fillText(score, 175, 325);

  //draw the boxes
  for (var i = 0; i < word.length; i++) {
    if (boxes[i] != null) {
      boxes[i].update();
      boxes[i].draw();
    }

    if (guess[i] != null) {
      guess[i].update();
      guess[i].draw();
    }
  }

  //find out if the round has ended:
  if (leftToFind == 0) {
    //you've found all the words, begin a new round
    newRound();
    return;
  } else if (time <= 0) {
    if (foundSixLetterWord) {
      //time is up but you found the 6 letter word so begin a new round
      newRound();
      return;
    } else {
      //time is up and you didn't find the 6 letter word, so game is over
      gameOver();
      return;
    }
  }
}

//    ######## ##     ## ######## ##    ## ########  ######
//    ##       ##     ## ##       ###   ##    ##    ##    ##
//    ##       ##     ## ##       ####  ##    ##    ##
//    ######   ##     ## ######   ## ## ##    ##     ######
//    ##        ##   ##  ##       ##  ####    ##          ##
//    ##         ## ##   ##       ##   ###    ##    ##    ##
//    ########    ###    ######## ##    ##    ##     ######


/*var doMouseDown = function(event) {
  var rect = canvas.getBoundingClientRect();
  var clickX = event.clientX - rect.left;
  var clickY = event.clientY - rect.top;
}*/

var doKeyDown = function(event) {
  if (event.keyCode == 8) {      //backspace, remove last letter from guess
    event.preventDefault();      //and add it to the last open spot in the tray
    for (var i = guess.length; i >= 0; i--) {
      if (guess[i] != null) {
        for (var j = boxes.length - 1; j >= 0; j--) {
          if (boxes[j] == null) {
            boxes[j] = guess[i];
            guess[i] = null;
            boxes[j].setDestination((55*j)+j + 160 + 2.5, 190);
            break;
          }
        }
        break;
      }
    }
  } else if (event.keyCode == 32) { //spacebar, shuffle the letters (moving empty spaces to the end)
    event.preventDefault();
    shuffle();
  } else if (event.keyCode == 13) { //enter key, check for word match and return guess to tray
    event.preventDefault();
    //check for match

    //build the word based on the letters in the top shelf
    var wordGuess = "";
    for (var i = 0; i < guess.length; i++) {
      if (guess[i] == null) {
        break;
      } else {
        wordGuess += guess[i].letter;
      }
    }
    console.log("guess: " + wordGuess);

    var found = false;
    for (var i = 0; i < solutionWords.length; i++) {
      if (wordGuess.toLowerCase() == solutionWords[i][0]) {
        //we found the word, now decide if it's been found already
        if (solutionWords[i][1] == false) {
          console.log("match!");
          leftToFind -= 1;
          console.log("you have " + leftToFind + " words left to find.");

          //calculate score of the word
          //scoring: 3 letter word: 90 points
          //         4 letter word: 160
          //         5 250
          //         6 360

          switch(wordGuess.length) {
            case 3:
              score += 90;
              break;
            case 4:
              score += 160;
              break;
            case 5:
              score += 250;
              break;
            case 6:
              score += 360;
              console.log("You qualify for the next round!");
              foundSixLetterWord = true;
              break;
          }


          //set the found flags to true
          solutionWords[i][1] = true;
          found = true;
          break;
        } else {
          console.log("You already found this word!");
          found = true;
          break;
        }
      }
    }

    if (! found) {
      console.log("not a word");
    }

    //return letters to tray
    for (var i = 0; i < guess.length; i++) {
      if (guess[i] != null) {
        for (var j = 0; j < boxes.length; j++) {
          if (boxes[j] == null) {
            boxes[j] = guess[i];
            guess[i] = null;
            break;
          }
        }
        //break;
      }
    }

    //update each letter with its new destination
    for (var i = 0; i < word.length; i++) {
      if (boxes[i] != null) {
        boxes[i].setDestination((55*i)+i + 160 + 2.5, 190);
      }
    }
  } else {
    for (var i = 0; i < word.length; i++) {
      if ((boxes[i] != null) && (String.fromCharCode(event.keyCode) == boxes[i].letter))
      {
        for (var j = 0; j < guess.length; j++) {
          if (guess[j] == null) {
            guess[j] = boxes[i];
            boxes[i] = null;
            guess[j].setDestination((55*j)+j + 160 + 2.5, 97.5);
            break;
          }
        }
        break;
      }
    }
  }
}

var doKeyDownMessage = function(event) {
  window.removeEventListener("keydown", doKeyDownMessage);
  if(event.keyCode == 32 || event.keyCode == 8) {
    event.preventDefault();
  }
  getNewLetters()
}

//     #######  ########        ## ########  ######  ########  ######
//    ##     ## ##     ##       ## ##       ##    ##    ##    ##    ##
//    ##     ## ##     ##       ## ##       ##          ##    ##
//    ##     ## ########        ## ######   ##          ##     ######
//    ##     ## ##     ## ##    ## ##       ##          ##          ##
//    ##     ## ##     ## ##    ## ##       ##    ##    ##    ##    ##
//     #######  ########   ######  ########  ######     ##     ######


function square(x, y, letter) {
  this.x = x;
  this.y = y;
  this.destX = x;
  this.destY = y;
  this.velocityX = 0;
  this.velocityY = 0;
  this.letter = letter;

  this.draw = function () {
    /*
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    //ctx.fillStyle = "blue";
    //ctx.fillRect(0,0,300,150);
    var grd = ctx.createRadialGradient(95, 95, 4, 95, 95, 25);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, "#8c8c8c");
    ctx.fillStyle = grd;
    ctx.arc(100,100,25,0,2*Math.PI);
    ctx.fill();*/

    grd = ctx.createRadialGradient(this.x + 18, this.y + 18, 4, this.x + 18, this.y + 18, 35);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, "#8c8c8c");
    ctx.fillStyle = grd;


    //ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x + 25,this.y + 25,25,0,2*Math.PI);
    ctx.fill();

    ctx.font = "bold 38px Consolas";
    ctx.fillStyle = "#00769d";
    ctx.fillText(this.letter, this.x + 14, this.y + 37);
  }

  this.update = function() {
    if ((this.x == this.destX) && (this.y == this.destY)) {
      //do nothing
    } else {
      this.x = this.x + this.velocityX;
      this.y = this.y + this.velocityY;
    }
  }

  /*
  this.isInside = function(x, y) {
    var insideX, insideY;

    if ((x > this.x) && (x < this.x + 75)) {
      insideX = true;
    }
    if ((y > this.y) && (y < this.y + 75)) {
      insideY = true;
    }

    if (insideX && insideY) {
      return true;
    }
  }*/

  this.setDestination = function(x, y) {

    this.destX = x;
    this.destY = y;

    //do some math to calculate the new X and Y velocities
    var deltaX = this.destX - this.x;
    var deltaY = this.destY - this.y;

    this.velocityX = deltaX / 8;
    this.velocityY = deltaY / 8;

    var slope = deltaY / deltaX;
  }
}

function matchWord(word, x, y) {
  this.x = x;
  this.y = y;
  this.word = word + "";
  this.found = false;

  this.draw = function () {
    letters = this.word.split("");
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    for (var i = 0; i < letters.length; i++) {
      ctx.fillRect((i*15) + + 3 + this.x, this.y, 11, 15);
      ctx.strokeRect((i*15) + 3 + this.x, this.y, 11, 15);
      if (this.found) {
        ctx.font = "bold 14px Courier";
        ctx.fillStyle = "black";
        ctx.fillText(letters[i].toUpperCase(), (i*15) + 4 + this.x, this.y + 15);
        ctx.stroke();
        ctx.fillStyle = "white";
      }



    }

  }

  this.setFound = function() {
    this.found = true;
  }

}


//    ###    ##        ######    #######  ########  #### ######## ##     ## ##     ##  ######
//   ## ##   ##       ##    ##  ##     ## ##     ##  ##     ##    ##     ## ###   ### ##    ##
//  ##   ##  ##       ##        ##     ## ##     ##  ##     ##    ##     ## #### #### ##
// ##     ## ##       ##   #### ##     ## ########   ##     ##    ######### ## ### ##  ######
// ######### ##       ##    ##  ##     ## ##   ##    ##     ##    ##     ## ##     ##       ##
// ##     ## ##       ##    ##  ##     ## ##    ##   ##     ##    ##     ## ##     ## ##    ##
// ##     ## ########  ######    #######  ##     ## ####    ##    ##     ## ##     ##  ######

function shuffle() {
  var emptySpots;
  //first, move empty spaces to the end
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i] == null) {
      for (var j = boxes.length; j > i; j--) {
        if (boxes[j] != null) {
          boxes[i] = boxes[j];
          boxes[j] = null;
          break;
        }
      }
    }
  }

  var toShuffle = boxes.length;
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i] == null) {
      toShuffle = i;
      break;
    }
  }

  //now, shuffle the non-empty elements (Fisher-Yates shuffle)
  var t, i;
  while (toShuffle) {
    //pick a remaining element...
    i = Math.floor(Math.random() * toShuffle --);

    //And swap it with the current element.
    t = boxes[toShuffle];
    boxes[toShuffle] = boxes[i];
    boxes[i] = t;
  }

  //update each letter with its new destination
  for (var i = 0; i < word.length; i++) {
    if (boxes[i] != null) {
      boxes[i].setDestination((55*i)+i + 160 + 2.5, 190);
    }
  }
}

// ##    ## ######## ######## ##      ##  #######  ########  ##    ## #### ##    ##  ######
// ###   ## ##          ##    ##  ##  ## ##     ## ##     ## ##   ##   ##  ###   ## ##    ##
// ####  ## ##          ##    ##  ##  ## ##     ## ##     ## ##  ##    ##  ####  ## ##
// ## ## ## ######      ##    ##  ##  ## ##     ## ########  #####     ##  ## ## ## ##   ####
// ##  #### ##          ##    ##  ##  ## ##     ## ##   ##   ##  ##    ##  ##  #### ##    ##
// ##   ### ##          ##    ##  ##  ## ##     ## ##    ##  ##   ##   ##  ##   ### ##    ##
// ##    ## ########    ##     ###  ###   #######  ##     ## ##    ## #### ##    ##  ######

var ajax = new XMLHttpRequest(); // We create the HTTP Object

function getNewLetters() {
  url = "retrieveNewLetters.php";
  ajax.open("GET", url, true);
  ajax.onreadystatechange = handleHttpResponse;
  ajax.send(null);
}

function handleHttpResponse() {
  var words;
  if (ajax.readyState == 4 && ajax.status == 200) {
    words = ajax.responseText;
    // The words string contains words separated by the tilde (~).
    // Use the JavaScript split() function to return all the cities in an array.
    var wordsArray = words.split("~");

    //first element is the key, split that and assign it to the global "word" variable
    word = wordsArray[0].toUpperCase().split("");

    //now that we have the new word, clear the guess array, make a new tray array
    console.log("new word:\n" + word);
    for (var i = 0; i < boxes.length; i++) {
      guess[i] = null;
      boxes[i] = new square((55*i)+i + 160 + 2.5, 190, word[i]);
    }
    //since the letters come from the server in alphabetical order, lefts shuffle them!
    //shuffle(); //this caused some issues, so I'll do it later

    //clear the solution words array before adding the new words to it
    solutionWords = [];

    for (var i = 1; i < wordsArray.length; i++)
    {
      solutionWords.push([wordsArray[i],false]);

    }
    leftToFind = solutionWords.length;

    solutionWords.sort(function(a,b){
      if (a[0].length == b[0].length) {
        if (a[0] < b[0]) {
          return -1;
        } else {
          return 1;
        }
      } else {
        return a[0].length - b[0].length;
      }
    });


    var msg = "";

    //for testing, prints the words to find

    var threeLetterWords = 0;
    var fourLetterWords = 0;
    var fiveLetterWords = 0;
    var sixLetterWords = 0;

    var threesToDouble = 0;
    var foursToDouble = 0;
    var fivesToDouble = 0;

    var threesHeight;
    var foursHeight;
    var fivesHeight;

    for (var i = 0; i < solutionWords.length; i++) {
      msg += solutionWords[i][0] + ", ";
      //console.log("word:" + solutionWords[i][0] + " letters: " + solutionWords[i][0].length);
      switch (solutionWords[i][0].length) {
        case 3:
            threeLetterWords ++;
            break;
        case 4:
            fourLetterWords ++;
            break;
        case 5:
            fiveLetterWords ++;
            break;
        case 6:
            sixLetterWords ++;
            break;
      }
    }

    threesHeight = threeLetterWords
    foursHeight =  fourLetterWords;
    fivesHeight = fiveLetterWords;

    console.log("words to match (" + solutionWords.length + "):\n" + msg);
    console.log("3: " + threeLetterWords);
    console.log("4: " + fourLetterWords);
    console.log("5: " + fiveLetterWords);
    console.log("6: " + sixLetterWords);
    if (solutionWords.length > 20) {
      console.log("overlap required");
      if (solutionWords.length - Math.floor(threeLetterWords / 2) <= 20) {
        //only threes needed
        threesToDouble = solutionWords.length - 20;
        threesHeight = threeLetterWords - threesToDouble;
        console.log("threes only! doubleup: " + threesToDouble + " 3s height: " + threesHeight);
        console.log("rows to print: " + solutionWords.length - Math.floor(threeLetterWords / 2));

      } else if (solutionWords.length - (Math.floor(threeLetterWords / 2)) - (Math.floor(fourLetterWords / 2)) <= 20) {
        //3's and 4's needed
        threesToDouble = Math.floor(threeLetterWords / 2);
        threesHeight = threeLetterWords - threesToDouble;
        foursToDouble = solutionWords.length - threesToDouble - 20;
        foursHeight = fourLetterWords - foursToDouble;
        console.log("fours! " + threesToDouble + " threes and " + foursToDouble + " fours");
        console.log(solutionWords.length - (Math.floor(threeLetterWords / 2)) - (Math.floor(fourLetterWords / 2)));
      } else if (solutionWords.length - (Math.floor(threeLetterWords / 2)) - (Math.floor(fourLetterWords / 2)) - (Math.floor(fiveLetterWords / 2)) <=20) {
        threesToDouble = Math.floor(threeLetterWords / 2);
        threesHeight = threeLetterWords - threesToDouble;

        foursToDouble = Math.floor(fourLetterWords / 2);
        foursHeight = fourLetterWords - foursToDouble;

        fivesToDouble = solutionWords.length - (Math.floor(threeLetterWords / 2)) - (Math.floor(fourLetterWords / 2)) - 20;
        fivesHeight = fiveLetterWords - fivesToDouble;
        console.log("fives!" + threesToDouble + " threes, " + foursToDouble + " fours," + fivesToDouble);
        console.log(solutionWords.length - (Math.floor(threeLetterWords / 2)) - (Math.floor(fourLetterWords / 2)) - (Math.floor(fiveLetterWords / 2)));
      } else {
        console.log("overflow problem! (need to double 6's)");
      }
    }



    solutionWordObjects = [];

    //matchWord(word, x, y)
    for (var i = 0; i < solutionWords.length; i++) {
      if (i < threeLetterWords) {
        console.log("logging 3s");
        var x = 3 + ((Math.floor(i / (threesHeight)) * 15)* 4);
        var y = 3 + (((i % (threesHeight))) * 20);
        solutionWordObjects.push(new matchWord(solutionWords[i][0], x, y));
      } else if (i - threeLetterWords < fourLetterWords) {
        console.log("logging 4s");
        var x = 3 + ((Math.floor((i- threeLetterWords)/ (foursHeight)) * 15)* 5);
        //var y = 3 + ((((i - threesToDouble) % (foursHeight + threesHeight) * 20);
        var y = 3 + ((((i - threeLetterWords) % foursHeight) + threesHeight) * 20);
        solutionWordObjects.push(new matchWord(solutionWords[i][0], x, y));
      } else if (i - threeLetterWords - fourLetterWords < fiveLetterWords) {
        console.log("logging 5s");
        var x = 3 + ((Math.floor((i - threeLetterWords - fourLetterWords) / (fiveLetterWords - fivesToDouble)) * 15)* 6);
        var y = 3 + ((((i - threeLetterWords - fourLetterWords) % fivesHeight) + threesHeight + foursHeight) * 20);
        solutionWordObjects.push(new matchWord(solutionWords[i][0], x, y));
      } else {
        console.log("logging 6s");
        var x = 3;
        var y = 3 + ((i - threesToDouble - foursToDouble - fivesToDouble) * 20);
        solutionWordObjects.push(new matchWord(solutionWords[i][0], x, y));
      }
    }



    window.addEventListener("keydown", doKeyDown);
    interval = setInterval(move, 50);
  }
}

// ######## ##    ## ########      #######  ########    ########   #######  ##     ## ##    ## ########
// ##       ###   ## ##     ##    ##     ## ##          ##     ## ##     ## ##     ## ###   ## ##     ##
// ##       ####  ## ##     ##    ##     ## ##          ##     ## ##     ## ##     ## ####  ## ##     ##
// ######   ## ## ## ##     ##    ##     ## ######      ########  ##     ## ##     ## ## ## ## ##     ##
// ##       ##  #### ##     ##    ##     ## ##          ##   ##   ##     ## ##     ## ##  #### ##     ##
// ##       ##   ### ##     ##    ##     ## ##          ##    ##  ##     ## ##     ## ##   ### ##     ##
// ######## ##    ## ########      #######  ##          ##     ##  #######   #######  ##    ## ########

var newRound = function() {
  window.removeEventListener("keydown", doKeyDown);
  clearInterval(interval);
  foundSixLetterWord = false;
  time = (1000 * 60 * 2);
  //post new round message:
  splashMessage("New Round!");
  //getNewLetters();
}

var newRoundFoundAll = function() {
  window.removeEventListener("keydown", doKeyDown);
  clearInterval(interval);
  foundSixLetterWord = false;
  time = (1000 * 60 * 2);
  //post new round message:
  splashMessage("You found every word!\n Grats!");
}

var gameOver = function() {
  window.removeEventListener("keydown", doKeyDown);
  clearInterval(interval);
  score = 0;
  foundSixLetterWord = false;
  time = (1000 * 60 * 2);
  //post game over message:
  splashMessage("Game over!");
}

//     ######   ########     ###    ########  ##     ## ####  ######   ######
//    ##    ##  ##     ##   ## ##   ##     ## ##     ##  ##  ##    ## ##    ##
//    ##        ##     ##  ##   ##  ##     ## ##     ##  ##  ##       ##
//    ##   #### ########  ##     ## ########  #########  ##  ##        ######
//    ##    ##  ##   ##   ######### ##        ##     ##  ##  ##             ##
//    ##    ##  ##    ##  ##     ## ##        ##     ##  ##  ##    ## ##    ##
//     ######   ##     ## ##     ## ##        ##     ## ####  ######   ######

var splashMessage = function(message) {
  window.addEventListener("keydown", doKeyDownMessage);

  //draw the message window's background
  ctx.beginPath();
  ctx.fillStyle = "#02d8fd";
  ctx.fillRect(100,100,300,200);

  //draw the message window's frame
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.lineWidth="4";
  ctx.rect(100,100,300,200);
  ctx.stroke();

  //write the message
  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(message, 115,130);

}

var drawBG = function() {
  //draw the blue background
  ctx.fillStyle = "#02d8fd";
  ctx.fillRect(0,0,500,400);

  //draw the logo
  ctx.font = "32px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Text", 350,30);
  ctx.fillText("Floop", 370,70);

  //draw the 6 letter boxes
  ctx.lineWidth = "1";
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.rect((55*i)+i + 160, 95, 55,55);
    ctx.stroke();
  }

  //draw the letter placeholders
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc((55*i)+i + 160 + 25, 215,15,0,2*Math.PI);
    ctx.fill();
  }
}

var drawToFindBoxes = function() {
  //runs once for each word in the solution array
  for (var i = 0; i < solutionWords.length; i++) {
    //runs once for each letter in the solution word
    for (var j = 0; j < solutionWords[i][0].length; j++) {
      ctx.lineWidth="1";
      //if this word has been found, write each letter...

      ctx.fillStyle = "white";
      ctx.fillRect((j*15) + 3, (i*20) + 3, 11, 15);
      ctx.strokeStyle = "black";
      ctx.strokeRect((j*15) + 3, (i*20) + 3, 11, 15);

      if (solutionWords[i][1] == true) {
        //ctx.strokeStyle = "red";
        var wordToPrint = solutionWords[i][0].split("");
        ctx.font = "bold 14px Courier";
        ctx.fillStyle = "black";
        ctx.fillText(wordToPrint[j].toUpperCase(), (j*15) + 4, (i*20) + 15);
      } else { //...otherwise, just draw the box
        //ctx.strokeStyle = "black";
      }

    }
  }
}
