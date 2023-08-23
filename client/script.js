const socket = io();


let content = document.getElementById('displayQuoteMe')
let contentOpponent = document.getElementById('displayQuoteOpponent')
let inpContent = document.getElementById('inpContent')
let countdown = document.getElementById('countdown-stopwatch')

let left = document.getElementById('left')
let right = document.getElementById('right')
let results = document.getElementById('results')


let game = document.getElementById('mainGame')
let join = document.getElementById('joining')


// joining/creating game code
//  

let createBtn = document.getElementById('createBtn')
let joinBtn = document.getElementById('joinBtn')
let createGame = document.getElementById('createGame')
let joinGame = document.getElementById('joinGame')

let createInp = document.getElementById('createInp')
let createAndStartGame = document.getElementById('createAndStartGame')
let joinInp = document.getElementById('joinInp')
let joinAndStartGame = document.getElementById('joinAndStartGame')
let roomDisplay = document.getElementById('roomName');

// create and start
createAndStartGame.addEventListener('click', () => {
    // validation
    if (createInp.value == '') {
        validation.style.top = '10px'
    }
    else {
        validation.style.top = '-80px'
        let room = createInp.value
        socket.emit('joinRoom', room);
        roomDisplay.innerText = `ROOM NAME: ${room}`
        join.style.display = 'none'
        game.style.display = 'flex'
    }
})


// join and start
joinAndStartGame.addEventListener('click', () => {
    // validation
    if (joinInp.value == '') {
        validation.classList.add('pop')
    }
    else {
        validation.style.top = '-80px'
        let room = joinInp.value
        socket.emit('joinRoom', room);
        roomDisplay.innerText = `ROOM NAME: ${room}`
        join.style.display = 'none'
        game.style.display = 'flex'
    }
})


// validation to start or join creating/existing room
let validation = document.getElementById('validation')


// create btn click
createBtn.addEventListener('click', () => {

    createGame.style.display = 'block'
    createBtn.style.display = 'none'
    joinBtn.style.display = 'none'
})
// join btn click
joinBtn.addEventListener('click', () => {

    joinGame.style.display = 'block'
    createBtn.style.display = 'none'
    joinBtn.style.display = 'none'
})

// 
// end of joining/creating room




socket.on('quote', quote => {
    // display quote for my use
    content.innerText = ''
    inpContent.value = null
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        content.appendChild(characterSpan)
    })
});

function correct_incorrect_class(quoteDiv) {

    const arrayQuote = quoteDiv.querySelectorAll('span')
    const arrayValue = inpContent.value.split('')

    // color change for words(red or green --> depends)
    arrayQuote.forEach((characterSpan, index) => {
        let character = arrayValue[index]
        if (character == null) {
            characterSpan.classList.remove('correct')
            characterSpan.classList.remove('incorrect')
            correct = false
        }
        else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct')
            characterSpan.classList.remove('incorrect')
            correct = true
        }
        else {
            characterSpan.classList.remove('correct')
            characterSpan.classList.add('incorrect')
            correct = false
        }
    })
}


socket.on('opponent-input', input => {
    contentOpponent.innerHTML = input
})


socket.on('stop-game-random-time', time => {
    stopGame(time)
})





// handling the start and end of the game
let timeLeft = 10;

socket.on('startCountdown', () => {
    function countdownfunc() {
        if (timeLeft === -1) {
            clearInterval(timerId);
            openButtons();
        } else {
            countdown.innerHTML = timeLeft;
            timeLeft--;
        }
    }

    var timerId = setInterval(countdownfunc, 1000);


});


function openButtons() {
    inpContent.style.pointerEvents = 'auto'

    let timeLeft = 30
    function countdownfunc() {

        if (timeLeft == 0) {
            clearInterval(aftercount);
            stopGame(90)
        }
        else {
            timeLeft--;
            countdown.innerHTML = timeLeft;

            inpContent.addEventListener('input', () => {

                correct_incorrect_class(content)

                socket.emit('opponent-input', inpContent.value)

                if (correct == true) {
                    socket.emit('stop-game-random-time', timeLeft)
                }
            })
        }
    }

    var aftercount = setInterval(countdownfunc, 1000);



}




function stopGame(time) {
    left.style.display = 'none'
    right.style.display = 'none'

    let timeToCalcWPM = 30 - timeLeft

    // calculations of your words
    // 
    let totalWordsTyped = inpContent.value.split(" ").length;
    let realmistakes = (comparewords(content.innerText, inpContent.value));

    // wpm your
    let wpRandSec = totalWordsTyped - realmistakes
    let wpm = Math.round((wpRandSec / timeToCalcWPM) * 60)

    // accuracy your
    let accuracy = ((wpRandSec / totalWordsTyped) * 100)
    let finalaccuracy = Math.trunc(accuracy);
    // 
    // calculations of your words


    // calculations of opponents words
    // 
    let OpptotalWordsTyped = contentOpponent.innerText.split(" ").length;
    let Opprealmistakes = (comparewords(content.innerText, contentOpponent.innerText));

    // wpm opponent's
    let OppwpmRandSec = OpptotalWordsTyped - Opprealmistakes
    let Oppwpm = Math.round((OppwpmRandSec / timeToCalcWPM) * 60)

    // accuracy opponent's
    let Oppaccuracy = ((OppwpmRandSec / OpptotalWordsTyped) * 100)
    var Oppfinalaccuracy = Math.trunc(Oppaccuracy);
    // 
    // calculations of opponents words



    results.innerHTML = `
    <h1>SCORES</h1>
    <br>
    <h2>YOUR WORDS PER MINUTE: ${wpm} WPM</h2>
    <h2>YOUR ACCURACY: ${finalaccuracy}%</h2>
    <br>
    <br>
    <h2>OPPONENTS WORDS PER MINUTE: ${Oppwpm} WPM</h2>
    <h2>OPPONENTS ACCURACY: ${Oppfinalaccuracy}%</h2>
    <br>
    <button class='leaveBtn' onclick='window.location.reload()'>Leave Game</button>
    `

}



// function to compare words 
const comparewords = (str1, str2) => {
    let words1 = str1.split(" ");
    let words2 = str2.split(" ");
    let cnt = 0;
    words1.forEach(function (item, index) {
        if (item == words2[index]) {
            cnt++;
        }
    })

    let mistakes = (words2.length - cnt);
    return (mistakes)
}