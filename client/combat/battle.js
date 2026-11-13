
import {
    showBattleUI,
    hideBattleUI,
    setBattleMessage,
    updateBattleStats,
    showAbilities,
    getSelectedAbility,
    clearSelectedAbility
} from "./battle-ui.js";

import {
    enableBattleControls,
    disableBattleControls
} from "./battle-controls.js";

import {
    playAttackAnimation,
    clearAttackAnimations
} from "./attack-renderer.js";

let currentBattle = null;
let localPlayerId = null;
let sendAction = null;

export function initializeBattle(playerId, actionSender) {
    localPlayerId = playerId;
    sendAction = actionSender;
}

export function startBattle(data) {
    if (!data || !data.battle) return;

    currentBattle = data.battle;

    clearAttackAnimations();
    showBattleUI();
    enableBattleControls();

    setBattleMessage("A battle has begun!");

    refreshBattleUI();
}

export function receiveBattleUpdate(battle) {
    if (!battle || battle.id !== currentBattle?.id) return;

    currentBattle = battle;
    refreshBattleUI();
}

export function receiveBattleAction(action) {
    if (!currentBattle || !action) return;

    playAttackAnimation({
        abilityId: action.abilityId,
        from: action.actorId === localPlayerId
            ? "player"
            : "enemy"
    });
}

function refreshBattleUI() {
    if (!currentBattle || !localPlayerId) return;

    const participants = Object.values(currentBattle.participants);

    const player = currentBattle.participants[localPlayerId];

    const enemy = participants.find(
        participant => participant.id !== localPlayerId
    );

    if (!player || !enemy) return;

    updateBattleStats(player, enemy);

    if (currentBattle.currentTurn === localPlayerId) {
        setBattleMessage("Your turn! Choose an action.");

        showAbilities(
            player.abilities,
            player.cooldowns,
            currentBattle.round
        );
    } else {
        setBattleMessage("Opponent's turn...");
    }
}

export function useSelectedAbility() {
    if (!currentBattle || !localPlayerId) return;

    if (currentBattle.currentTurn !== localPlayerId) {
        setBattleMessage("Wait for your turn!");
        return;
    }

    const abilityId = getSelectedAbility();

    if (!abilityId) {
        setBattleMessage("Select an ability first!");
        return;
    }

    if (typeof sendAction !== "function") {
        setBattleMessage("Connection unavailable.");
        return;
    }

    sendAction(abilityId);
    clearSelectedAbility();
    setBattleMessage("Using ability...");
}

export function finishBattle(result) {
    disableBattleControls();
    clearAttackAnimations();

    if (result?.winnerId === localPlayerId) {
        setBattleMessage("YOU WON!");
    } else if (result?.winnerId) {
        setBattleMessage("YOU WERE DEFEATED!");
    } else {
        setBattleMessage("BATTLE ENDED!");
    }

    currentBattle = null;

    setTimeout(() => {
        hideBattleUI();
    }, 2000);
}

export function getCurrentBattle() {
    return currentBattle;
}

export function isInBattle() {
    return Boolean(currentBattle);
}
