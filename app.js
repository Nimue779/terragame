//gets the html elements
const techElement = document.getElementById('text');
const buttonBox = document.getElementById('button-box');

//holds storyline
const storyData = {
    stasis_pod: {
        text: "You open your eyes. Cold air fills your lungs. Emergency red lights pulse across the stasis bay. The stasis pod glass is frosted over, and the door lock is flashing red.",
        choices: [
            { text: "Examine the diagnostic screen on the wall", nextNode: "diagnostic_srceen" },
            { text: "Smash the emergency manual release lever", nextNode: "manual_release" }
        ]
    },
    diagnostic_screen: {
        text: "The screen flashes text through static: 'CRITICAL ERROR - Sector 4 depressurized. Crew status: UNKNOWN. Life support failing in 45 minutes.'",
        choices: [
            { text: "Back to pod door", nextNode: "stasis_pod" },
            { text: "Try to override the door control using the keypad", nextNode: "keypad_hack"}
        ]
    },
    manual_release: {
        text: "You slam your shoulder against the lever. With a loud hiss, the pod glass pops open! You step out onto the cold metal floor of the Astrea.",
        choices: [
            { text: "Head towards the command bridge", nextNode: "command_bridge" },
        ]
    },
    keypad_hack: {
        text: "You punch in the default maintenace code (0000). The screen beeps happily: 'Override accepted.' The pod door slides open!",
        choices: [
            { text: "Head towards the command bridge", nextNode: "command_bridge" }
        ]
    },
    command_bridge: {
        text: "The bridge is dead silent apart from the hum of the dying computer banks. Th Captain's chair is empty, and a coffee mug is floating in zero-G near the main viewpoints.",
        choices: [
            { text: "Check the ships navigation logs.", nextNode: "nav_logs" }

        ]
    },
    nav_logs: {
        text: "To be continued! You survived Hour 1 of your Terra project setup.",
        choices: [
            { text: "Play Again", nextNode: "stasis_pod" }
        ]
    }
};

//kicks off the start of the story
function startGame() {
    showScene("stasis_pod");
}
//updates screen with new choices
function showScene(nodeId) {
    const currentScene = storyData[nodeId];
    textElement.innerText = currentScene.text;
    buttonBox.innerHTML = "";
    //loops through previuos commands for each option
    currentScene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;

        button.addEventListener('click', () => {
            showScene(choice.nextNode);
        });

        buttonBox.appendChild(button);
    });

}

startGame();