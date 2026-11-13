
import {
    getBattle,
    updateParticipant,
    advanceTurn,
    endBattle
} from "./battles.js";

import {
    getAbility,
    canUseAbility,
    markAbilityUsed
} from "./ability-system.js";

export function performBattleAction(
    battleId,
    participantId,
    abilityId
) {
    const battle = getBattle(battleId);

    if (!battle || battle.status !== "active") {
        return { success: false, reason: "Battle is not active." };
    }

    if (battle.currentTurn !== participantId) {
        return { success: false, reason: "It is not your turn." };
    }

    const user = battle.participants[participantId];

    if (!user || user.defeated) {
        return { success: false, reason: "Invalid participant." };
    }

    const ability = getAbility(abilityId);

    if (!ability) {
        return { success: false, reason: "Unknown ability." };
    }

    if (!canUseAbility(user, abilityId, battle.round)) {
        return { success: false, reason: "Ability unavailable." };
    }

    if (!markAbilityUsed(user, abilityId, battle.round)) {
        return { success: false, reason: "Ability could not be used." };
    }

    let target = null;
    let damage = 0;

    if (ability.target === "opponent") {
        target = battle.turnOrder
            .map(id => battle.participants[id])
            .find(p => p && p.id !== participantId && !p.defeated);

        if (!target) {
            return { success: false, reason: "No valid opponent." };
        }

        damage = ability.damage || 0;

        if (target.guard) {
            damage = Math.max(0, damage - target.guard);
            target.guard = 0;
        }

        updateParticipant(battleId, target.id, {
            hp: target.hp - damage
        });

        target = battle.participants[target.id];
    }

    if (ability.target === "self") {
        if (ability.type === "defense") {
            user.guard = ability.damageReduction || 0;
        }
    }

    const defeated = target?.defeated || false;

    if (defeated) {
        endBattle(battleId, {
            winnerId: participantId,
            reason: "opponent-defeated"
        });
    } else {
        advanceTurn(battleId);
    }

    return {
        success: true,
        battle,
        action: {
            participantId,
            abilityId,
            abilityName: ability.name,
            targetId: target?.id || participantId,
            damage,
            targetHp: target?.hp ?? user.hp,
            targetDefeated: defeated,
            round: battle.round
        }
    };
}
