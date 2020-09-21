
var answer;
var score = 0;

function generateQuestion(){
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
        console.log(`Correct! Score: ${score}`);
    }
    else {
        score--;
        console.log(`Incorrect! Score: ${score}`);
    }
}