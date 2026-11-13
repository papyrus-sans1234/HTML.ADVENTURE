
let dialogueBox = null;
let currentNPC = null;
let dialogueIndex = 0;

function createDialogueBox() {
    if (dialogueBox) return dialogueBox;

    dialogueBox = document.createElement("div");
    dialogueBox.id = "npc-dialogue";
    dialogueBox.className = "npc-dialogue";

    dialogueBox.innerHTML = `
        <div id="npc-dialogue-name">NPC</div>
        <div id="npc-dialogue-text"></div>
        <div class="npc-dialogue-controls">
            <button id="npc-dialogue-next">NEXT</button>
            <button id="npc-dialogue-close">CLOSE</button>
        </div>
    `;

    document.body.appendChild(dialogueBox);

    document.getElementById("npc-dialogue-next")
        .addEventListener("click", nextDialogue);

    document.getElementById("npc-dialogue-close")
        .addEventListener("click", closeDialogue);

    return dialogueBox;
}

export function openDialogue(npc) {
    if (!npc || !Array.isArray(npc.dialogue)) return;

    currentNPC = npc;
    dialogueIndex = 0;

    createDialogueBox();

    dialogueBox.classList.add("active");

    document.getElementById("npc-dialogue-name").textContent =
        npc.name || "Unknown NPC";

    showCurrentDialogue();
}

function showCurrentDialogue() {
    if (!currentNPC) return;

    const text = document.getElementById("npc-dialogue-text");

    if (text) {
        text.textContent =
            currentNPC.dialogue[dialogueIndex] || "...";
    }

    const nextButton = document.getElementById("npc-dialogue-next");

    if (nextButton) {
        nextButton.textContent =
            dialogueIndex >= currentNPC.dialogue.length - 1
                ? "FINISH"
                : "NEXT";
    }
}

function nextDialogue() {
    if (!currentNPC) return;

    if (dialogueIndex < currentNPC.dialogue.length - 1) {
        dialogueIndex++;
        showCurrentDialogue();
    } else {
        closeDialogue();
    }
}

export function closeDialogue() {
    if (dialogueBox) {
        dialogueBox.classList.remove("active");
    }

    currentNPC = null;
    dialogueIndex = 0;
}

export function isDialogueOpen() {
    return Boolean(
        dialogueBox &&
        dialogueBox.classList.contains("active")
    );
}
