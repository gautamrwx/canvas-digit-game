
var answer;
var score = 0;

function generateQuestion() {
    const n1 = Math.floor(Math.random() * 5);
    document.getElementById('n1').innerHTML = n1;

    const n2 = Math.floor(Math.random() * 6);
    document.getElementById('n2').innerHTML = n2;
    answer = n1 + n2;
}

function verifyAnswer() {
    const prediction = predictImage();

    if (prediction == answer) {
        score++;
        document.getElementById('up-down-image').src='./images/up-green.png'
    }
    else {
        score--;
        document.getElementById('up-down-image').src='./images/down-red.png'
    }

    console.log(score)
    document.getElementById('score').innerHTML = score

}