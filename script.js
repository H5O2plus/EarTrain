var synth = new Tone.Synth({
    "oscillator": {
        "type": "sine"
    },
}).toMaster();
var pressed = false;

const A4 = 440;
var answers = [
    ["C", "Do"],
    ["C+", "Do+"],
    ["C#", "Do#", "Db", "Reb"],
    ["D-", "Re-"],
    ["D", "Re"],
    ["D+", "Re+"],
    ["D#", "Re#", "Eb", "Mib"],
    ["E-", "Mi-"],
    ["E", "Mi"],
    ["E+", "Mi+", "F-", "Fa-"],
    ["F", "Fa"],
    ["F+", "Fa+"],
    ["F#", "Fa#", "Gb", "Sob", "Solb"],
    ["G-", "So-", "Solb"],
    ["G", "So", "Sol"],
    ["G+", "So+", "Sol+"],
    ["G#", "So#", "Sol#", "Ab", "Lab"],
    ["A-", "La-"],
    ["A", "La"],
    ["A+", "La+"],
    ["A#", "La#", "Bb", "Sib", "Tib"],
    ["B-", "Si-", "Ti-"],
    ["B", "Si", "Ti"],
    ["B+", "Si+", "Ti+", "C-", "Do-"],
];
var answersHtml;
var quesTotal = 0;
var quesCorrect = 0;
var mode = "begin";  //question, answer
var isShowingAccAns = false;
var curPitchIndex = 42;
var curAnswers = answers[18];

var rootPitches = [];
var pitches = [];
var frameFreq = A4;
var startStep = -18;
var pitchesCt = 24;
var fundamentalStep = Math.pow(2, 1 / pitchesCt);
synth.oscillator.type = "sine";
var startOctave = -1;
var octaveCt = 4;

//parse answers to html
function answersToHtml() {
    let finalStr = "";
    for (let i = 0; i < answers.length; i++) {
        for (let j = 0; j < answers[i].length; j++) {
            finalStr += answers[i][j] + " ";
        }
        finalStr = finalStr.slice(0, -1);
        finalStr += "<br />"
    }
    finalStr = finalStr.slice(0, -6);
    return finalStr;
}
answersHtml = answersToHtml();

//pitch index to answers row
function indexToAns(index) {
    return index % pitchesCt;
}

function relStepToFreq(relStep) {
    return frameFreq * Math.pow(fundamentalStep, relStep);
}

//one octave frequencies
for (let i = 0; i < pitchesCt; i++) {
    let relStep = i + startStep;
    rootPitches.push(relStepToFreq(relStep));
}

//multiple octave frequencies
for (let i = 0; i < octaveCt; i++) {
    let relOctave = i + startOctave;
    for (let j = 0; j < pitchesCt; j++) {
        pitches.push(rootPitches[j] * Math.pow(2, relOctave));
    }
}
//last C
pitches.push(rootPitches[0] * Math.pow(2, octaveCt));

/*
$("#page").on("touchstart touchend touchmove", event => {
    event.preventDefault();
});
*/

$("#replay").on("click", function() {
    Tone.context.resume();
    synth.triggerAttackRelease(pitches[curPitchIndex], 1, '+0.05');
});
//Doesn't work; needs user interaction first
//$("#replay").trigger("click");

$("#score").hide();
$("#begin").show();
$("#replay").hide();
$("#comment").hide();
$("#heardPitch").hide();
$("#next").hide();
$("#acceptedAns").hide();
$("#acceptedAns").html(answersHtml);

$("#begin").on("click", function() {
    if (mode === "begin") {
        $("#scoreLabel").html("Score:");
        $("#score").show();
        $("#begin").hide();
        $("#replay").show();
        $("#heardPitch").show();
        $("#next").show();

        $("#replay").trigger("click");

        mode = "question";
    }
});

$("#next").on("click", function () {
    if (mode === "question") {
        quesTotal++;
        
        if (answers[indexToAns(curPitchIndex)].includes($("#heardPitch").val())) {  //guess matches answer
            quesCorrect++;

            $("#comment").html("Correct!");
        } else {
            $("#comment").html("Wrong! It is actually: " + answers[indexToAns(curPitchIndex)][0]);
        }
        
        mode = "answer";
    } else if (mode === "answer") {
        $("#heardPitch").val("");

        curPitchIndex = Math.floor(Math.random() * (pitches.length));
        $("#replay").trigger("click");

        mode = "question";
    }

    $("#comment").toggle();
    $("#heardPitch").toggle();

    $("#score").html(quesCorrect + " / " + quesTotal);
    
    $("#heardPitch").focus();
});

$("#detailLink").on("click", function() {
    if (isShowingAccAns) {
        $("#detailLink").html("(show accepted answers)");
        $("#acceptedAns").hide();
    } else {
        $("#detailLink").html("(hide accepted answers)");
        $("#acceptedAns").show();
    }
    isShowingAccAns = !isShowingAccAns;
});

//
function delegateKeypress(event) {
    if (event.charCode == 13) {
        $("#next").trigger("click");
    } else if (event.charCode == 114) {
        $("#replay").trigger("click");
    }
}
$(document).keypress(delegateKeypress);