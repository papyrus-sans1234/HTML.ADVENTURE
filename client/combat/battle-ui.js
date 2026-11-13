
import { getAbilityList } from "./abilities.js";

let battleContainer = null;
let selectedAbility = null;

function createElement(tag, className, text = "") {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text) element.textContent = text;

    return element;
}

export function createBattleUI() {
    if (battleContainer) return battleContainer;

    battleContainer = createElement("div", "battle-screen");
    battleContainer.id = "battle-screen";

    const enemySection = createElement("section", "battle-enemy");
    enemySection.innerHTML = `
        <div class="battle-enemy-name" id="battle-enemy-name">ENEMY</div>
        <div class="battle-hp-track">
            <div class="battle-hp-fill" id="enemy-hp-fill"></div>
        </div>
        <div id="enemy-hp-text">100 / 100 HP</div>
    `;

    const arena = createElement("div", "battle-arena");
    arena.id = "battle-arena";

    const playerSection = createElement("section", "battle-player");
    playerSection.innerHTML = `
        <div class="battle-player-name" id="battle-player-name">PLAYER</div>
        <div class="battle-hp-track">
            <div class="battle-hp-fill" id="player-hp-fill"></div>
        </div>
        <div id="player-hp-text">100 / 100 HP</div>
    `;

    const message = createElement("div", "battle-message");
    message.id = "battle-message";
    message.textContent = "A battle has begun!";

    const abilityList = createElement("div", "battle-abilities");
    abilityList.id = "battle-abilities";

    const actions = createElement("div", "battle-actions");

    for (const action of ["FIGHT", "ACT", "ITEM", "MERCY"]) {
        const button = createElement(
            "button",
            "battle-action-button",
            action
        );

        button.dataset.action = action.toLowerCase();
        actions.appendChild(button);
    }

    battleContainer.append(
        enemySection,
        arena,
        playerSection,
        message,
        abilityList,
        actions
    );

    document.body.appendChild(battleContainer);

    return battleContainer;
}

export function showBattleUI() {
    createBattleUI();
    battleContainer.classList.add("active");
}

export function hideBattleUI() {
    if (battleContainer) {
        battleContainer.classList.remove("active");
    }

    selectedAbility = null;
}

export function setBattleMessage(message) {
    const element = document.getElementById("battle-message");

    if (element) {
        element.textContent = message;
    }
}

export function updateBattleStats(player, enemy) {
    updateHealthBar(
        "player",
        player.hp,
        player.maxHp
    );

    updateHealthBar(
        "enemy",
        enemy.hp,
        enemy.maxHp
    );

    const playerName = document.getElementById("battle-player-name");
    const enemyName = document.getElementById("battle-enemy-name");

    if (playerName) playerName.textContent = player.name;
    if (enemyName) enemyName.textContent = enemy.name;
}

function updateHealthBar(prefix, hp, maxHp) {
    const fill = document.getElementById(`${prefix}-hp-fill`);
    const text = document.getElementById(`${prefix}-hp-text`);

    if (!fill || !text) return;

    const percentage = maxHp > 0
        ? Math.max(0, Math.min(100, (hp / maxHp) * 100))
        : 0;

    fill.style.width = `${percentage}%`;
    text.textContent = `${hp} / ${maxHp} HP`;
}

export function showAbilities(abilityIds, cooldowns = {}, round = 1) {
    const container = document.getElementById("battle-abilities");

    if (!container) return;

    container.replaceChildren();
    selectedAbility = null;

    const abilities = getAbilityList(abilityIds);

    for (const ability of abilities) {
        const readyAt = cooldowns[ability.id] ?? 0;
        const onCooldown = round < readyAt;

        const button = createElement(
            "button",
            "battle-ability-button",
            onCooldown
                ? `${ability.name} (COOLDOWN)`
                : ability.name
        );

        button.disabled = onCooldown;
        button.dataset.ability = ability.id;

        button.addEventListener("click", () => {
            selectedAbility = ability.id;

            container.querySelectorAll("button").forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");
        });

        const description = createElement(
            "span",
            "battle-ability-description",
            ability.description
        );

        button.appendChild(description);
        container.appendChild(button);
    }
}

export function getSelectedAbility() {
    return selectedAbility;
}

export function clearSelectedAbility() {
    selectedAbility = null;

    document.querySelectorAll(".battle-ability-button").forEach(button => {
        button.classList.remove("selected");
    });
}
