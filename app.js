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
alarmAudio.volume = 0.3;  //plays when health or oxygen gets too low

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
            { 
                text: "Try to open the door using the keycard",
                nextNode: "command_bridge",
                requiredItem: "Keycard"
            },
        ]
    },
    got_o2: {
        text: "You reach into the hatch and pull out an Emergency O2 Canister. You quickly secure it to your suit pack.",
        choices: [
            { text: "Back to the pod door", nextNode: "stasis_pod" },
            { 
                text: "Try to open the door using the keycard",
                nextNode: "command_bridge",
                requiredItem: "Keycard"
            },
        ]
    },
    manual_release: {
        text: "You slam your shoulder against the lever. With a loud hiss, the pod glass pops open! You step out onto the cold metal floor of the Astraea, facing the heavy security vault door.",
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
        text: "You pull with all your might, but the heavy steel doesn't budge. Your arms burn from the effort, and you decide you need a better way through.",
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
            { text: "Enter the Reactor Control Hallway.", nextNode: "reactor_hall" },
            { text: "Enter the Medical Bay.", nextNode: "medical_bay" },
            { text: "Head down corridor toward the escape hangar", nextNode: "escape_hangar" }
        ]
    },
    bridge_searched: {
        text: "You rifle through the crate and find a foil-sealed Ration Pack. You stash it safely in your suit pocket. Nearby, the navigation console flashes red warning lights.",
        choices: [
            { text: "Check the ship's navigation logs.", nextNode: "nav_logs" },
            { text: "Head down the corridor toward the escape hangar", nextNode: "escape_hangar" }
        ]
    }, 
    reactor_hall: {
        text: "You push open the heavy blast door into Reactor Control. The floor vibrates violently, and a blinding blue glow illuminates toxic steam spewing from broken pipes.",
        choices: [
            { text: "Reroute power manually (takes suit damage)", nextNode: "reactor_rerouted", healthCost: 20},
            { text: "Search the emergency locker on the wall", nextNode: "reactor_locker", addItem: "Water Pouch" },
            { text: "Retreat to the command bridge", nextNode: "command_bridge" }
        ]
    },
    reactor_rerouted: {
        text: "Sparks shower over your helmet as you override the circuit breakers! Emergency power restores to the hangar bay terminal! You lose 20% health from heat exposure, but the pathway is clear.", 
        choices: [
            { text: "Head directly to the escape_hangar", nextNode: "escape_hangar" }
        ]
    },
    reactor_locker: {
        text: "You pry open the emergency locker and find a Water Pouch! You stash it in your pack.",
        choices: [
            { text: "Reroute power manually (Takes suit damage)", nextNode: "reactor_rerouted", healthCost: 20 },
            { text: "Retreat to the command bridge", nextNode: "command_bridge" }
        ]
    },
    medical_bay: {
        text: "The medical bay is cold and dimly lit. A shattered specimen container lies on the floor, and a faint hissing sound comes from an open O2 canister.",
        choices: [
            { text: "inspect the O2 canister (refill suit)", nextNode: "o2_refill" },
            { text: "Search doctor's desk", nextNode: "desk_searched", addItem: "Ration Pack" },
            { text: "Head towards the escape hangar", nextNode: "escape_hangar" }
        ]
    },
    o2_refill: {
        text: "You hook your suit nozzle directly into the O2 wall tap. Oxygen rushes into your tanks! (+30% oxygen)",
        choices: [
            { text: "Search doctor's desk", nextNode: "desk_searched", addItem: "Ration Pack", oxygenBoost: 30 },
            { text: "Head towards the escape hangar", nextNode: "escape_hangar", oxygenBoost: 30 }
        ]
    },
    desk_searched: {
        text: "In a locked desk drawer, you discover a preserved Ration Pack and stash it away",
        choices: [
            { text: "Head towards the escape hangar", nextNode: "escape_hangar" }
        ]

    },
    escape_hangar: {
        text: "You sprint down the dark corridor, your breath echoing in your helmet. You reach the escape hangar, but the primary shuttle is locked down behind an automated lockdown grid.",
        choices: [
            { text: "Try to hack the security terminal", nextNode: "security_riddle" },
            { text: "Turn back to the bridge", nextNode: "command_bridge" }
        ]
    },
    security_riddle: {
        text: "The terminal screen flashes a mandatory security riddle:\n\n'I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?'",
        choices: [ 
            { text: "A: A Shadow", nextNode: "riddle_fail", oxygenCost: 10, healthCost: 15 },
            { text: "B: An Echo", nextNode: "riddle_success" },
            { text: "C: A Flame", nextNode: "riddle_fail", oxygenCost: 10, healthCost: 15 }
        ]
    },
    riddle_fail: {
        text: "A harsh red error message flashes: 'ACCESS DENIED. Security penalty applied.' You lose 10% Oxygen and 15% Health.", 
        choices: [
            { text: "Try the riddle again", nextNode: "security_riddle" },
            { text: "Retreat back to the escape hangar", nextNode: "escape_hangar" }
        ]
    },
    riddle_success: {
        text: "A green light washes over the console. 'OVERRIDE ACCEPTED.' The heavy hangar bay doors grind open, revealing the rescue shuttle!",
        choices: [
            { text: "Board the escape shuttle and launch", nextNode: "nav_logs" }
        ]
    },
    nav_logs: {
        text: "MISSION ACCOMPLISHED\n\nThe thrusters roar to life as the shuttle detaches from the Astraea, sailing clear into deep space. You have survived Project Astraea.",
        choices: [
            { text: "Play Again", showTitle: true }
        ]
    }
};

// --- SAVE / LOAD FUNCTIONS ---
function saveGame(nodeId) {
    const saveData = {
        oxygen: oxygen,
        health: health,
        inventory: playerInventory,
        currentNode: nodeId
    };
    localStorage.setItem('astraea_save', JSON.stringify(saveData));
}

function loadGame() {
    const savedData = localStorage.getItem('astraea_save');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    oxygen = data.oxygen;
    health = data.health;
    playerInventory = data.inventory;

    bgMusic.play().catch(err => console.log("Music play blocked:", err));
    startOxygenTimer();
    showScene(data.currentNode);
}

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
        bgMusic.play().catch(err => console.log("Music play blocked:", err));
        playClickSound();
        startGame();
    });

    buttonBox.appendChild(startBtn);

    //continue button, only shows if a save exists
    if (localStorage.getItem('astraea_save')) {
        const continueBtn = document.createElement('button');
        continueBtn.innerText = "▶ Continue Simulation";
        continueBtn.style.marginTop = "8px";
        continueBtn.addEventListener('click', () => {
            playClickSound();
            loadGame();
        });
        buttonBox.appendChild(continueBtn);
    }
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

function startOxygenTimer() {    //oxygen will tick down by 1% every 3 seconds
    if (gameTimer) clearInterval(gameTimer);

    gameTimer = setInterval(() => {
        if (oxygen > 0 && health > 0) {
            oxygen -= 1;
            statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;

            const container = document.getElementById('game-container');
            if (oxygen <= 20) {
                container.classList.add('low-o2-alert');
                if (oxygen === 20) {
                    alarmAudio.play().catch(err => console.log("Alarm audio block", err));
                }
            } else {
                container.classList.remove('low-o2-alert');
            }

            if (oxygen <= 0) {
                clearInterval(gameTimer);
                showScene("game_over_check");
            }
        }
    }, 3000); 
}

function updateInventoryUI() {
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

    itemAudio.currentTime = 0;
    itemAudio.play().catch(err => console.log("Audio block:", err));

    if (effect.healthBoost) {
        health = Math.min(100, health + effect.healthBoost);
    }

    if (effect.oxygenBoost) {
        oxygen = Math.min(100, oxygen + effect.oxygenBoost);
    }

    playerInventory.splice(index, 1);
    statsElement.innerText = `Oxygen: ${oxygen}% | Health: ${health}%`;
    updateInventoryUI();
}

function typeWriter(text, i = 0, callback) {
    if (i === 0) {
        textElement.innerText = "";
        buttonBox.innerHTML = ""; 
    }

    if (i < text.length) {
        textElement.innerText += text.charAt(i);
        setTimeout(() => typeWriter(text, i + 1, callback), 20); 
    } else {
        setTimeout(() => {
            if (callback) callback();  
        }, 400);
    }
}

function triggerDamageFlash() {
    const container = document.getElementById('game-container');
    container.classList.add('damage-effect');
    setTimeout(() => {
        container.classList.remove('damage-effect');
    }, 400);
}

//updates screen with new choices
function showScene(nodeId) {
    if (oxygen <= 0 || health <= 0) {
        if (gameTimer) clearInterval(gameTimer);
        localStorage.removeItem('astraea_save');

        textElement.innerText = "CRITICAL FAILURE: Life support exhausted or vital sign stopped. You died.";
        buttonBox.innerHTML = "";

        const restartBTN = document.createElement('button');
        restartBTN.innerText = "Restart Simulation";
        restartBTN.addEventListener('click', () => showTitleScreen());
        buttonBox.appendChild(restartBTN);

        statsElement.innerText = "Oxygen: 0% | Health: 0%";
        inventoryElement.innerText = "Inventory: Empty";
        document.getElementById('game-container').classList.remove('low-o2-alert');

        return; 
    }

    const currentScene = storyData[nodeId];
    if (!currentScene) return;

    saveGame(nodeId);

    typeWriter(currentScene.text, 0, () => {
        currentScene.choices.forEach(choice => {
            if (choice.requiredItem && !playerInventory.includes(choice.requiredItem)) {
                return;
            }

            const button = document.createElement('button');
            button.innerText = choice.text;

            button.addEventListener('click', () => {
                playClickSound();

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

                const oxCost = choice.oxygenCost !== undefined ? choice.oxygenCost : 0;
                const hlCost = choice.healthCost !== undefined ? choice.healthCost : 0;

                oxygen -= oxCost;
                health -= hlCost;

                if (oxCost > 0 || hlCost > 0) {
                    triggerDamageFlash();
                    alarmAudio.currentTime = 0;
                    alarmAudio.play().catch(err => console.log("Alarm block:", err));
                }

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