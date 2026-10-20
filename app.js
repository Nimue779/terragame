//gets the html elements
const techElement = Document.getElementById('text');
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
    manual_release: {}
}