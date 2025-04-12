import {
  availableAmount,
  canInteract,
  cliExecute,
  create,
  Effect,
  getCampground,
  Item,
  myPrimestat,
  numericModifier,
  retrieveItem,
  // reverseNumberology,
  runChoice,
  takeStorage,
  toInt,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  $stat,
  get,
  have,
  SongBoom,
} from "libram";
import { mainStat } from "../combat";
import { Quest } from "../engine/task";
import { baseOutfit } from "../engine/outfit";
import {
  discoveredFurniture,
  FURNITURE_PIECES,
  FurniturePiece,
  getStats,
  installedFurniture,
  NEEDS,
  rearrangesRemaining,
  Result,
  setFurniture,
} from "libram/dist/resources/2025/Leprecondo";

export const RunStartQuest: Quest = {
  name: "Run Start",
  completed: () => get("kingLiberated"),
  tasks: [
    {
      name: "Council",
      completed: () => get("lastCouncilVisit") > 0,
      do: () => visitUrl("council.php"),
    },
    {
      name: "Toot",
      prepare: () => visitUrl("tutorial.php?action=toot"),
      completed: () =>
        get("questM05Toot") === "finished" && !have($item`letter from King Ralph XI`),
      do: () => use($item`letter from King Ralph XI`),
      limit: { tries: 1 },
    },
    {
      name: "Skeleton Store",
      completed: () => get("questM23Meatsmith") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=meatsmith&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Overgrown Lot",
      completed: () => get("questM24Doc") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=doc&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Madness Bakery",
      completed: () => get("questM25Armorer") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=armory&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    /*
    {
      name: "Numberology",
      ready: () => Object.keys(reverseNumberology()).includes("69"),
      completed: () =>
        get("_universeCalculated") >= (get("skillLevel144") > 3 ? 3 : get("skillLevel144")),
      do: () => cliExecute("numberology 69"),
      limit: { tries: 3 },
    },
    */
    {
      name: "Softcore Pulls",
      completed: () => !canInteract() || get("_roninStoragePulls").split(",").length >= 5,
      do: (): void => {
        $items`meteorite necklace, Stick-Knife of Loathing, Staff of the Roaring Hearth, norwhal helmet, witch's bra`.forEach(
          (it) => {
            if (!have(it)) takeStorage(it, 1);
          },
        );
      },
      limit: { tries: 1 },
    },
    {
      name: "Borrowed Time",
      completed: () => get("_borrowedTimeUsed"),
      do: () => use($item`borrowed time`),
      acquire: [{ item: $item`borrowed time` }],
      limit: { tries: 1 },
    },
    {
      name: "Homemade Robot Gear",
      completed: () => have($item`homemade robot gear`),
      do: (): void => {
        create(1, $item`box of Familiar Jacks`);
        use(1, $item`box of Familiar Jacks`);
        // useFamiliar($familiar`Melodramedary`);
        // create(1, $item`box of Familiar Jacks`);
        // use(1, $item`box of Familiar Jacks`);
      },
      outfit: { familiar: $familiar`Homemade Robot` },
      limit: { tries: 1 },
    },
    {
      name: "Chateau Desk",
      completed: () => get("_chateauDeskHarvested"),
      do: () => visitUrl("place.php?whichplace=chateau&action=chateau_desk"),
      limit: { tries: 1 },
    },
    {
      name: "Deck",
      ready: () => get("_deckCardsDrawn") === 0,
      completed: () => get("_deckCardsDrawn") >= 15,
      do: (): void => {
        cliExecute("cheat island");
        cliExecute("cheat ancestral recall");
        cliExecute("cheat forest");
      },
      limit: { tries: 1 },
      post: (): void => {
        while (have($item`blue mana`) && get("_ancestralRecallCasts") < 10)
          useSkill($skill`Ancestral Recall`);
      },
    },
    {
      name: "Cowboy Boots",
      completed: () => have($item`your cowboy boots`),
      do: () => visitUrl("place.php?whichplace=town_right&action=townright_ltt"),
      limit: { tries: 1 },
    },
    {
      name: "Detective Badge",
      completed: () => have($item`gold detective badge`),
      do: () => visitUrl("place.php?whichplace=town_wrong&action=townwrong_precinct"),
      limit: { tries: 1 },
    },
    /* {
      name: "Pantogramming",
      completed: () => Pantogram.havePants(),
      do: (): void => {
        Pantogram.makePants(
          "Mysticality",
          "Hot Resistance: 2",
          "Maximum HP: 40",
          "Combat Rate: -5",
          "Spell Damage Percent: 20"
        );
      },
      limit: { tries: 1 },
    }, */
    {
      name: "Mummery",
      completed: () => get("_mummeryMods").includes(`Experience (${mainStat})`),
      do: () =>
        cliExecute(
          `mummery ${
            mainStat === $stat`Muscle` ? "mus" : mainStat === $stat`Mysticality` ? "myst" : "mox"
          }`,
        ),
      outfit: baseOutfit,
      limit: { tries: 1 },
    },
    {
      name: "BoomBox",
      completed: () => SongBoom.song() === "Total Eclipse of Your Meat",
      do: () => SongBoom.setSong("Total Eclipse of Your Meat"),
      limit: { tries: 1 },
    },
    {
      name: "Horsery",
      completed: () => get("_horsery") === "dark horse",
      do: () => cliExecute("horsery dark"),
      limit: { tries: 1 },
    },
    {
      name: "Vote",
      completed: () => have($item`"I Voted!" sticker`),
      do: () => cliExecute("VotingBooth.ash"),
      limit: { tries: 1 },
    },
    {
      name: "Scavenge",
      completed: () => get("_daycareGymScavenges") > 0,
      do: (): void => {
        visitUrl("place.php?whichplace=town_wrong&action=townwrong_boxingdaycare");
        runChoice(3);
        runChoice(2);
      },
      limit: { tries: 1 },
    },
    {
      name: "Cosplay Saber",
      completed: () => get("_saberMod") > 0,
      do: () => cliExecute("saber familiar"),
      limit: { tries: 1 },
    },
    {
      name: "Bird Calendar",
      completed: () => have($skill`Seek out a Bird`),
      do: () => use($item`Bird-a-Day calendar`),
      limit: { tries: 1 },
    },

    {
      name: "Lathe",
      prepare: () => visitUrl("shop.php?whichshop=lathe"),
      completed: () => have($item`weeping willow wand`),
      do: () => retrieveItem($item`weeping willow wand`),
      limit: { tries: 1 },
    },
    {
      name: "Backup Camera",
      completed: () => get("backupCameraMode") === "ml",
      do: () => cliExecute("backupcamera ml"),
      limit: { tries: 1 },
    },
    {
      name: "Backup Camera Reverser",
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser"),
      limit: { tries: 1 },
    },
    {
      name: "Garden",
      completed: () => getCampground()[$item`peppermint sprout`.name] === 0,
      do: () => cliExecute("garden pick"),
      limit: { tries: 1 },
    },
    {
      name: "Autumnaton",
      completed: () =>
        availableAmount($item`autumn-aton`) === 0 ||
        have($item`autumn leaf`) ||
        have($effect`Crunching Leaves`),
      do: () => cliExecute("autumnaton send The Sleazy Back Alley"),
      limit: { tries: 1 },
    },
    {
      name: "Set Apriling Band Helmet (NC)",
      completed: () => get("nextAprilBandTurn") > 0,
      do: () => cliExecute("aprilband effect nc"),
      limit: { tries: 1 },
    },
    {
      name: "Update Replica Store Credits",
      completed: () =>
        !have($item`2002 Mr. Store Catalog`) || get("_2002MrStoreCreditsCollected", true),
      do: () =>
        visitUrl(`inv_use.php?whichitem=${toInt($item`2002 Mr. Store Catalog`)}&which=f0&pwd`),
      limit: { tries: 1 },
    },
    {
      name: "Grab Embers",
      completed: () => get("availableSeptEmbers") > 0 || have($item`bembershoot`),
      do: () => visitUrl("shop.php?whichshop=september"),
      limit: { tries: 1 },
    },
    {
      name: "Grab Photobooth Props",
      ready: () => have($item`Clan VIP Lounge key`),
      completed: () => get("_photoBoothEquipment", 0) >= 3,
      do: (): void => {
        cliExecute("photobooth item fake arrow-through-the-head"); // NC hat
        cliExecute("photobooth item astronaut helmet"); // Cold res hat
        cliExecute("photobooth item feather boa"); // meat%
      },
      limit: { tries: 1 },
    },
    {
      name: "Open McHugeLarge Duffel Bag",
      completed: () => !have($item`McHugeLarge duffel bag`) || have($item`McHugeLarge left ski`),
      do: () => cliExecute("inventory.php?action=skiduffel&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "PirateRealm eyepatch",
      completed: () => have($item`PirateRealm eyepatch`),
      do: () => visitUrl("place.php?whichplace=realm_pirate&action=pr_port"),
      limit: { tries: 1 },
    },
    {
      name: "Personal Ventilation Unit",
      completed: () => have($item`Personal Ventilation Unit`),
      do: $location`The Secret Government Laboratory`,
      limit: { tries: 1 },
    },
    {
      name: "April Shower Globs",
      completed: () => get("_aprilShowerGlobsCollected", false),
      do: () => visitUrl("inventory.php?action=shower"),
      limit: { tries: 1 },
    },
    {
      name: "Configure Leprecondo",
      completed: () =>
        !have($item`Leprecondo`) ||
        rearrangesRemaining() <= 0 ||
        installedFurniture().filter((furniture) => furniture !== "empty").length >=
          Math.min(4, discoveredFurniture().length),
      do: () => {
        visitUrl("inv_use.php?whichitem=11861&which=f0&pwd"); // Update discovered furnitures

        // Dictate the priority of the effects we want (starting from the most desirable)
        const effectPriorityList = [
          $effect`Your Days Are Numbed`,
          $effect`Vicarious Sweat`,
          $effect`Alone with Your Thoughts`,
          $effect`Work Out Smarter, Not Harder`,
          $effect`Moist Night's Sleep`,
          $effect`Spacious Night's Sleep`,
          $effect`Tired Muscles`,
          ...$effects`Gym Bros, Well Stimulated, Wasting Time`.sort(
            (a, b) =>
              numericModifier(a, `${myPrimestat()} Percent`) -
              numericModifier(b, `${myPrimestat()} Percent`),
          ),
          $effect`You Might Have Gotten Wet`,
          $effect`Counter Intelligence`,
          $effect`Good Night's Sleep`,
          $effect`Sur La Table`,
        ];

        function getResultEffect(result: Result): Effect {
          if (result instanceof Item) return $effect.none;
          else if (result instanceof Array) return $effect.none;
          else return result.effect;
        }

        function priorityValue(furniture: FurniturePiece): number {
          if (furniture === FURNITURE_PIECES[0]) return 2000;
          const furnitureStats = getStats(furniture);
          const values = NEEDS.map((need) => {
            if (!Object.keys(furnitureStats).includes(need)) return 1000;
            const idx = effectPriorityList.indexOf(
              getResultEffect(furnitureStats[need] ?? $item.none),
            );
            return idx >= 0 ? idx : 1000;
          });
          return Math.min(...values);
        }

        const availableFurnitures = discoveredFurniture();
        availableFurnitures.sort((a, b) => priorityValue(a) - priorityValue(b)).slice(0, 4);

        setFurniture(
          availableFurnitures.at(0) ?? FURNITURE_PIECES[0],
          availableFurnitures.at(1) ?? FURNITURE_PIECES[0],
          availableFurnitures.at(2) ?? FURNITURE_PIECES[0],
          availableFurnitures.at(3) ?? FURNITURE_PIECES[0],
        );
      },
      limit: { tries: 1 },
    },
  ],
};
