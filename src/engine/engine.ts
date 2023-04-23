import { Task } from "./task";
import { Engine as BaseEngine, Outfit } from "grimoire-kolmafia";
import { $effect, $skill, get, have, PropertiesManager, set, uneffect } from "libram";
import { myFullness, myHp, myInebriety, myMaxhp, mySpleenUse, print, useSkill } from "kolmafia";
import { equipDefaults } from "./outfit";

export class trackedPref {
  pref: string;
  name: string;
  maxUses?: number;

  constructor(pref: string, name: string, maxUses?: number) {
    this.pref = pref;
    this.name = name;
    if (maxUses) this.maxUses = maxUses;
  }
}

export const freeBanishPrefs: trackedPref[] = [
  new trackedPref("_feelHatredUsed", "Feel Hatred", 3),
  new trackedPref("_reflexHammerUsed", "Reflex Hammer", 3),
  new trackedPref("_latteRefillsUsed", "Latte Refills", 3),
  new trackedPref("_kgbTranquilizerDartUses", "KGB Tranquilizers", 3),
  new trackedPref("_snokebombUsed", "Snokebomb", 3),
];

export const freeKillPrefs: trackedPref[] = [
  new trackedPref("_chestXRayUsed", "Chest X-Ray", 3),
  new trackedPref("_shatteringPunchUsed", "Shattering Punch", 3),
  new trackedPref("_gingerbreadMobHitUsed", "Gingerbread Mob Hit", 1),
  new trackedPref("_missileLauncherUsed", "Missile Launcher", 1),
  new trackedPref("_CSParkaYRUsed", "Parka YR"),
];

export const notableSkillPrefs: trackedPref[] = [
  new trackedPref("_saberForceUses", "Saber Forces", 5),
  new trackedPref("_monstersMapped", "Monsters Mapped", 3),
  new trackedPref("_feelEnvyUsed", "Feel Envy", 3),
  new trackedPref("_sourceTerminalDigitizeUses", "Digitize", 3),
  new trackedPref("_sourceTerminalPortscanUses", "Portscan", 3),
  new trackedPref("_sourceTerminalEnhanceUses", "Source Terminal Enhances", 3),
  new trackedPref("_sourceTerminalDuplicateUses", "Duplicate", 1),
];

export const freeFightPrefs: trackedPref[] = [
  new trackedPref("_shadowAffinityToday", "Shadow Rift", 11),
  new trackedPref("_snojoFreeFights", "Snojo", 10),
  new trackedPref("_neverendingPartyFreeTurns", "NEP", 10),
  new trackedPref("_witchessFights", "Witchess", 5),
  new trackedPref("_machineTunnelsAdv", "DMT", 5),
  new trackedPref("_loveTunnelUsed", "LOV Tunnel", 3),
  new trackedPref("_voteFreeFights", "Voters", 3),
  new trackedPref("_godLobsterFights", "God Lobster", 3),
  new trackedPref("_speakeasyFreeFights", "Oliver's Place", 3),
  new trackedPref("_eldritchHorrorEvoked", "Eldritch Tentacle", 1),
  new trackedPref("_sausageFights", "Sausage Goblins"),
];

export const potentiallyFreeFightPrefs: trackedPref[] = [
  new trackedPref("_backUpUses", "Backup Camera", 11),
  new trackedPref("_locketMonstersFought", "Locket Reminisces", 3),
  new trackedPref("_photocopyUsed", "Fax Machine", 1),
  new trackedPref("_chateauMonsterFought", "Chateau Painting", 1),
];

export const farmingResourcePrefs: trackedPref[] = [
  new trackedPref("_powerfulGloveBatteryPowerUsed", "Powerful Glove Charges", 100),
  new trackedPref("_kgbClicksUsed", "KGB Clicks", 22),
  new trackedPref("_deckCardsDrawn", "Deck Draws", 15),
  new trackedPref("_macrometeoriteUses", "Macrometeorites", 10),
  new trackedPref("_AAABatteriesUsed", "Batteries (AAA)", 7),
  new trackedPref("_monkeyPawWishesUsed", "Monkey Paw Wishes", 5),
  new trackedPref("tomeSummons", "Tome Summons", 3),
  new trackedPref("_sproutsUsed", "Peppermint Sprouts", 3), // Assumes garden is peppermint
  new trackedPref("_genieWishesUsed", "Genie Wishes", 3),
  new trackedPref("_pottedTeaTreeUsed", "Tea Tree", 3),
  new trackedPref("_favoriteBirdVisited", "Favorite Bird", 1),
  new trackedPref("_clanFortuneBuffUsed", "Zatara Consult", 1),
  new trackedPref("_floundryItemCreated", "Clan Floundry", 1),
  new trackedPref("_gingerbreadCityNoonCompleted", "GingerbreadCity Noon", 1),
  new trackedPref("_gingerbreadCityMidnightCompleted", "GingerbreadCity Midnight", 1),
  new trackedPref("_pantogramModifier", "Pantogram", 1),
  new trackedPref("_cargoPocketEmptied", "Cargo Shorts", 1),
  new trackedPref("_freePillKeeperUsed", "Pillkeeper", 1),
];

export const trackedPreferences: trackedPref[] = [
  ...freeBanishPrefs,
  ...freeKillPrefs,
  ...notableSkillPrefs,
  ...freeFightPrefs,
  ...potentiallyFreeFightPrefs,
  ...farmingResourcePrefs,
];

export class Engine extends BaseEngine {
  public getNextTask(): Task | undefined {
    return this.tasks.find((task) => !task.completed() && (task.ready ? task.ready() : true));
  }

  public execute(task: Task): void {
    const originalValues = trackedPreferences.map(({ pref }) => [pref, get(pref).toString()]);
    const organUsage = () => [myFullness(), myInebriety(), mySpleenUse()];
    const originalOrgans = organUsage();
    this.checkLimits(task, undefined);
    super.execute(task);
    if (have($effect`Beaten Up`)) {
      if (get("lastEncounter") === "Sssshhsssblllrrggghsssssggggrrgglsssshhssslblgl")
        uneffect($effect`Beaten Up`);
      else throw "Fight was lost; stop.";
    }
    originalValues.forEach(([pref, val]) => {
      if (val !== get(pref).toString()) {
        const s = `_instant${pref}`;
        const arr = get(s, "").split(",");
        arr.push(task.name);
        set(s, arr.filter((v, i, a) => v.length > 0 && a.indexOf(v) === i).join(","));
      }
    });
    organUsage().forEach((organUse, idx) => {
      if (organUse !== originalOrgans[idx]) {
        const s = `_instant_${["fullness", "inebriety", "spleenUse"][idx]}`;
        const arr = get(s, "").split(",");
        arr.push(task.name);
        set(s, arr.filter((v, i, a) => v.length > 0 && a.indexOf(v) === i).join(","));
      }
    });
    if (task.completed()) {
      print(`${task.name} completed!`, "blue");
    } else {
      print(`${task.name} not completed!`, "blue");
    }
  }

  dress(task: Task, outfit: Outfit): void {
    if (task.combat !== undefined && !outfit.skipDefaults) equipDefaults(outfit);
    super.dress(task, outfit);
  }

  prepare(task: Task): void {
    super.prepare(task);
    if (task.combat !== undefined && myHp() < myMaxhp() * 0.9) useSkill($skill`Cannelloni Cocoon`);
  }

  initPropertiesManager(manager: PropertiesManager): void {
    super.initPropertiesManager(manager);
    manager.set({
      hpAutoRecovery: -0.05,
      mpAutoRecovery: -0.05,
      maximizerCombinationLimit: 0,
    });
  }
}
