
import { getBattle } from "./battles.js";
import { performBattleAction } from "./battle-actions.js";

const AI_ABILITY_PRIORITY = [
    "energy_bolt",
    "basic_strike",
    "guard"
];

export function performEnemyTurn(battleId, enemyId) {
    const battle = getBattle(battleId);

    if (!battle || battle.status !== "active") {
        return {
            success: false,
            reason: "Battle is not active."
        };
    }

    if (battle.currentTurn !== enemyId) {
        return {
            success: false,
            reason: "It is not the enemy's turn."
        };
    }

    const enemy = battle.participants[enemyId];

    if (!enemy || enemy.defeated) {
        return {
            success: false,
            reason: "Enemy is unavailable."
        };
    }

    const availableAbility = AI_ABILITY_PRIORITY.find(abilityId => {
        return (
            enemy.abilities.includes(abilityId) &&
            battle.round >= (enemy.cooldowns?.[abilityId] ?? 0)
        );
    });

    if (!availableAbility) {
        return {
            success: false,
            reason: "Enemy has no available abilities."
        };
    }

    return performBattleAction(
        battleId,
        enemyId,
        availableAbility
    );
}
