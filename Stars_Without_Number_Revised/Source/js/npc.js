/* global getAttrs, setAttrs, getSectionIDs, generateRowID, on, removeRepeatingRow, _, getTranslationByKey */

/* NPC */
const fillNPC = () => {
    getAttrs(["npc_stat_block"], (v) => {
        if (v.npc_stat_block && autofillData.statblocks[v.npc_stat_block]) {
            const [
                HD, AC, npc_attack_bonus, damage, attacks, npc_move,
                npc_morale, npc_skills, npc_saves, armor_type
            ] = autofillData.statblocks[v.npc_stat_block];

            const setting = {
                AC,
                npc_attack_bonus,
                npc_move,
                npc_morale,
                npc_skills,
                npc_saves
            };

            if (armor_type) setting.npc_armor_type = armor_type;
            if (HD.includes("hp")) setting.HP = HD.replace("hp", "");
            else setting.npc_hd = HD;

            setAttrs(setting);

            if (damage !== "Unarmed") {
                const newAttack = {
                    attack_ab: npc_attack_bonus,
                    attack_damage: damage,
                    attack_name: translate("ATTACK"),
                    attack_number: attacks
                };
                fillRepeatingSectionFromData("npc-attacks", newAttack);
            }
        }
    });
};
const addNPCAttackBonus = () => {
    getAttrs(["repeating_npc-attacks_attack_ab", "npc_attack_bonus"], v => {
        if (`${v["repeating_npc-attacks_attack_ab"]}` === "0") {
            setAttrs({
                ["repeating_npc-attacks_attack_ab"]: v.npc_attack_bonus
            });
        }
    });
};
const setNPCMultiAttacks = () => {
    getSectionIDs("repeating_npc-attacks", idArray => {
        const sourceAttrs = [
            ...idArray.map(id => `repeating_npc-attacks_${id}_attack_number`),
            "npc_roll_full_attack"
        ];
        getAttrs(sourceAttrs, v => {
            const setting = idArray.reduce((m, id) => {
                if (v.npc_roll_full_attack === "1") {
                    const num = parseInt(v[`repeating_npc-attacks_${id}_attack_number`]) || 1;
                    m[`repeating_npc-attacks_${id}_attack_extra_macro`] = [2, 3, 4, 5, 6, 7, 8].map(n => {
                        if (n <= num)
                            return `{{attack${n}=[[1d20 + @{attack_ab} @{attack_burst} @{modifier_query}]]}} ` +
                                `{{damage${n}=[[@{attack_damage} @{attack_burst}]]}} `;
                        else return "";
                    }).join("");
                } else {
                    m[`repeating_npc-attacks_${id}_attack_extra_macro`] = "";
                }
                return m;
            }, {});
            setAttrs(setting);
        });
    });
};
const handleNPCRollHide = () => {
    const types = ["hp", "initiative", "save", "skill", "morale", "reaction"];
    getAttrs(["npc_rolls_hidden", ...types.map(x => `npc_${x}_hidden`)], v => {
        const setting = types.reduce((m, n) => {
            m[`npc_${n}_hidden`] = v.npc_rolls_hidden;
            return m;
        }, {});
        mySetAttrs(setting, v);
    });
};
