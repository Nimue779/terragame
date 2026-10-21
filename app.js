//gets the html elements
const textElement = document.getElementById('text');
const buttonBox = document.getElementById('button-box');
const inventoryElement = document.getElementById('inventory-bar');
const statsElement = document.getElementById('stats-bar');

//sound effects and bg music
const clickAudio = new Audio('click.mp3');
clickAudio.volume = 0.4;

const itemAudio = new Audio('use_item.mp3'); //sound effects for eating, drinking, oxygen
itemAudio.volume = 0.4;

const alarmAudio = new Audio('alarm.mp3');
alarmAudio.volume = 0.3;

const bgMusic = new Audio('ambience.mp3');
bgMusic.loop = true; //loops bg music forever
bgMusic.volume = 0.3; //soft volume, not too loud

function playClickSound() {
    clickAudio.currentTime = 0; //clicksplay instantly
    clickAudio.play().catch(err => console.log("Click audio block:", err));
}

//stats section
let oxygen = 100;
let health = 100;
let playerInventory = [];
let gameTimer = null; //tracks timers in bg

//consumbles effects
const itemEffects = {
    "Water Pouch": { healthBoost: 30, message: "You drank the Water Pouch. (+30 Health)" },
    "Ration Pack": { healthBoost: 40, message: "You ate the Ration Pack. (+40 Health)" },
    "O2 Canister": { oxygenBoost: 50, message: "You inhaled the O2 Canister. (+50 Oxygen)" } 
};

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
            {
                text: "Open the emergency hatch (take O2 canister)",
                nextNode: "got_o2",
                addItem: "O2 Canister"
            },
            { text: "Back to pod door", nextNode: "stasis_pod" },
            { text: "Try to open the door using the keycard", nextNode: "command_bridge"}
        ]
    },
    got_o2: {
        text: "You reach into the hatch and pull out an Emergency O2 Canister. You quickly secure it to your suit pack.",
        choices: [
            { text: "Back to the pod door", nextNode: "stasis_pod" },
            { text: "Try to open the door using the keycard", nextNode: "command_bridge" },
            
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
            { text: "Try something else", nextNode: "stasis_pod" }
        ]
    },
    command_bridge: {
        text: "The bridge is dead silent apart from the hum of the dying computer banks. The Captain's chair is empty, and a coffee mug is floating in zero-G near the main viewpoints.",
        choices: [
            {
                text: "Search the emergency supply crate (take ration pack)",
                nextNode: "bridge_searched",
                addItem: "Ration Pack"
            },
            { text: "Check the ship's navigation logs.", nextNode: "nav_logs" },
            { text: "Head down corridor toward the escape hangar", nextNode: "escape_hangar" }
        ]
    },
    bridge_searched: {
        text: "You rifle through the crate and find a foi-sealed Ration Pack. You stash it safely in your suit pocket. The navigation console flashes warning lights nearby.",
        choices: [
            { text: "Check the ship's navigation logs.", nextNode: "nav_logs" },
            { text: "Head down the corridor toward the escape hangar", nextNode: "escape_hangar" }
        ]

    }, 
    escape_hangar: {
        text: "You sprint down the dark corridor, your breathe echoing in your helmet. You reach the ecape hangar, but the primary shuttle is locked down behind an automated lockdwon grid.",
        choices: [
            { text: "Try to override the lockdown console", nextNode: "nav_logs" },
            { text: "Turn back to the bridge", nextNode: "command_bridge" }
        ]
    },
    nav_logs: {
        text: "To be continued! You've successfully navigated the first part of Project Astraea.",
        choices: [
            { text: "Play Again", showTitle: true }
        ]
    }
};

//main menu, title screen

//displays title screen and waits for the first click to start music
function showTitleScreen() {
    if (gameTimer) clearInterval(gameTimer); //stops timer at title screen
    textElement.innerText = "Project Astraea\n\nClick 'Initialize Systems' below to begin.";
    buttonBox.innerHTML = "";
    statsElement.innerText = "Oxygen: -- | Health: --";
    inventoryElement.innerText = "Inventory: Locked";

    const startBtn = document.createElement('button');
    startBtn.innerText = "▶ Initialize Systems";
    startBtn.addEventListener('click', () => {
        //first click unlocks browser audio, starts music
        bgMusic.play().catch(err => console.log("Music play blocked:", err));
        playClickSound();

        startGame();
    });

    buttonBox.appendChild(startBtn);
}

//kicks off the start of the story
function startGame() {
    playerInventory = []; //resets inventory
    oxygen = 100;
    health = 100;

    //unlock and show inventory
    statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;
    inventoryElement.innerText = "Inventory: Empty";

    startOxygenTimer(); //starts the timer
    showScene("stasis_pod");
}

function startOxygenTimer() {
    //clear any running timers
    if (gameTimer) clearInterval(gameTimer);

    //tick every 3 seconds
    gameTimer = setInterval(() => {
        //only drains if game is running and player is alive
        if(oxygen > 0 && health > 0) {
            oxygen -= 1;

            //update stats bar as it happens
            statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;

            //play alert
            if (oxygen === 20) {
                alarmAudio.Audio().catch(err => console.log("Alarm audio block:", err));
            }

            //if oxygen hits 0, stop timer and trigger game over
            if (oxygen <= 0) {
                clearInterval(gameTimer);
                showScene("game_over_check"); //forced check
            }
        }
    }, 3000); //3000 milliseconds to drain 1%
}


// FIXED: Corrected typo from uodateInventoryUI to updateInventoryUI
function updateInventoryUI() {
    console.log("current Inventory Array:", playerInventory);

    inventoryElement.innerHTML = "Inventory: ";

    if (playerInventory.length === 0) {
        inventoryElement.innerText = "Inventory: Empty";
        return;
    }

    playerInventory.forEach((item, index) => {
        if (itemEffects[item]) {
            const useBtn = document.createElement('button');
            useBtn.innerText = `[Use ${item}]`;
            useBtn.style.marginLeft = "8px";
            useBtn.style.padding = "2px 6px";
            useBtn.style.fontSize = "0.8rem";
            useBtn.style.cursor = "pointer";

            useBtn.addEventListener('click', () => {
                useItem(item, index);
            });
            inventoryElement.appendChild(useBtn);
        } else {
            // FIXED: Properly created an element span/badge for key items like Keycards
            const itemSpan = document.createElement('span');
            itemSpan.innerText = `[${item}]`;
            itemSpan.style.marginLeft = "8px";
            itemSpan.style.color = "#ffaa00";
            itemSpan.style.fontWeight = "bold";
            inventoryElement.appendChild(itemSpan);
        }
    });
}

function useItem(itemName, index) {
    const effect = itemEffects[itemName];
    if (!effect) return;

    //play item effects
    itemAudio.currentTime = 0;
    itemAudio.play().catch(err => console.log("Audio block:", err));

    if (effect.healthBoost) {
        health = Math.min(100, health + effect.healthBoost);
    }

    if (effect.oxygenBoost) {
        oxygen = Math.min(100, oxygen + effect.oxygenBoost);
    }

    //remove item after use
    playerInventory.splice(index, 1);

    statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;
    updateInventoryUI();
}

function typeWriter(text, i = 0, callback) {
    if (i === 0) {
        textElement.innerText = "";
        buttonBox.innerHTML = ""; //hides the buttons while text is printing. prevents user clicking too early
    }

    if (i < text.length) {
        textElement.innerText += text.charAt(i);
        setTimeout(() => typeWriter(text, i + 1, callback), 20); //20ms per character
    } else {
        //wait a bit before showing choices
        setTimeout(() => {
            if (callback) callback();  //renders buttons once printing in complete
        }, 400);
        
    }
}

//updates screen with new choices
function showScene(nodeId) {

    //check for game over (dying from low oxygen or health)
    if (oxygen <= 0 || health <= 0) {
        textElement.innerText = "CRITICAL FAILURE: Life support exhausted or vital sign stopped. You died.";
        buttonBox.innerHTML = "";

        const restartBTN = document.createElement('button');
        restartBTN.innerText = "Restart Simulation";
        restartBTN.addEventListener('click', () => showTitleScreen());
        buttonBox.appendChild(restartBTN);

        statsElement.innerText = "Oxygen: 0% | Health: 0%";
        inventoryElement.innerText = "Inventory: Empty";
        return; //stops showing the regular scene
    }

    const currentScene = storyData[nodeId];

    typeWriter(currentScene.text, 0, () => {
        currentScene.choices.forEach(choice => {
            if (choice.requiredItem && !playerInventory.includes(choice.requiredItem)) {
                return;
            }

            const button = document.createElement('button');
            button.innerText = choice.text;

            button.addEventListener('click', () => {
                playClickSound();

                //restrt game sned to title screen
                if (choice.showTitle) {
                    showTitleScreen();
                    return;
                }

                if (choice.addItem && !playerInventory.includes(choice.addItem)) {
                    playerInventory.push(choice.addItem); 
                }

                if (choice.consumeItem) {
                    const itemIndex = playerInventory.indexOf(choice.consumeItem);
                    if (itemIndex > -1) {
                        playerInventory.splice(itemIndex, 1);
                    }
                }

                oxygen -= choice.oxygenCost !== undefined ? choice.oxygenCost : 0;
                health -= choice.healthCost !== undefined ? choice.healthCost : 5;

                if (choice.oxygenBoost) {
                    oxygen = Math.min(100, oxygen + choice.oxygenBoost);
                }
                if (choice.healthBoost) {
                    health = Math.min(100, health + choice.healthBoost);
                }
                showScene(choice.nextNode);
            });

            buttonBox.appendChild(button);
        });
    });

    statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;
    updateInventoryUI();
}

// Load title screen on start
showTitleScreen();