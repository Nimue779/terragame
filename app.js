//gets the html elements
const textElement = document.getElementById('text');
const buttonBox = document.getElementById('button-box');
const inventoryElement = document.getElementById('inventory-bar');

//what items players are holding
let playerInventory = [];

//holds storyline
const storyData = {
    stasis_pod: {
        text: "You open your eyes. Cold air fills your lungs. Emergency red lights pulse across the stasis bay. The stasis pod glass is frosted over, and the door lock is flashing red.",
        choices: [
            { text: "Examine the diagnostic screen on the wall", nextNode: "diagnostic_screen" },
            { 
                text: "Search the technician's pocket. (take keycard)",
                nextNode: "got_keycard",
                addItem: "Keycard" //adds to inventory
            },
            { text: "Smash the emergency manual release lever", nextNode: "manual_release" }
        ]
    },
    got_keycard: {
        text: "You slide the keycard out of the technician's cold fingers and into your suit pocket. It clinks softly, and the pod door is still flashing red.",
        choices: [
            { text: "Examine the diagnostics screen", nextNode: "diagnostic_screen" },
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
        text: "You slam your shoulder against the lever. With a loud hiss, the pod glass pops open! You step out onto the cold metal floor of the Astrea, fcaing the heavy security vault door.",
        choices: [
            { 
                text: "Try to swipe your Maintenance Keycard to open the vault door",
                nextNode: "command_bridge",
                requiredItem: "Keycard" //this choice only appears if you have the keycard
            }, 
            {
                text: "Try to pry the vault open with your bare hands.",
                nextNode: "door_fail"
            }
        ]
    },
    door_fail: {
        text: "You strain with all your might, but the heavy steel doesn't budge. Your arms burn from the effort, and you decide you need a better way through.",
        choices: [
            { text: "Try something else", nextNode: "manual_release" }
        ]
    },
    command_bridge: {
        text: "The bridge is dead silent apart from the hum of the dying computer banks. The Captain's chair is empty, and a coffee mug is floating in zero-G near the main viewpoints.",
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
    playerInventory = []; //resets inventory
    showScene("stasis_pod");
}
//updates screen with new choices
function showScene(nodeId) {

    //resets inventory when returning to stasis pod
    if (nodeId === "stasis_pod") {
        playerInventory = [];
    }
    const currentScene = storyData[nodeId];
    textElement.innerText = currentScene.text;
    buttonBox.innerHTML = "";
    //loops through previuos commands for each option
    currentScene.choices.forEach(choice => {

        //if a choice requires an item a player doesnt have, dont show the choice
        if (choice.requiredItem && !playerInventory.includes(choice.requiredItem)) {
            return;
        }

        const button = document.createElement('button');
        button.innerText = choice.text;

        button.addEventListener('click', () => {

            //adds items rewarded from choices that player does not already have
            if (choice.addItem && !playerInventory.includes(choice.addItem)) {
                playerInventory.push(choice.addItem);
            }
            showScene(choice.nextNode);
        });

        buttonBox.appendChild(button);
    });

    //update inventory box at top of screen
    if (playerInventory.length === 0) {
        inventoryElement.innerText = "Inventory: Empty";
    } else {
        inventoryElement.innerText = "Inventory: " + playerInventory.join(", ");

    }

}

startGame();