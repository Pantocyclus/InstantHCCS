import {
  haveEffect,
  Item,
  itemAmount,
  Location,
  Monster,
  mpCost,
  myMp,
  print,
  retrieveItem,
  retrievePrice,
  runChoice,
  Skill,
  sweetSynthesis,
  toInt,
  toUrl,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $item, $items, $skill, $stat, get, have, set } from "libram";
import { printModtrace } from "libram/dist/modifier";
import { mainStat } from "./combat";

export enum CommunityServiceTests {
  HPTEST = 1,
  MUSTEST = 2,
  MYSTTEST = 3,
  MOXTEST = 4,
  FAMTEST = 5,
  WPNTEST = 6,
  SPELLTEST = 7,
  COMTEST = 8,
  ITEMTEST = 9,
  HOTTEST = 10,
  COILTEST = 11,
  DONATEBODY = 30,
}

const testModifiers = new Map([
  [CommunityServiceTests.HPTEST, ["Maximum HP", "Maximum HP Percent"]],
  [CommunityServiceTests.MUSTEST, ["Muscle", "Muscle Percent"]],
  [CommunityServiceTests.MYSTTEST, ["Mysticality", "Mysticality Percent"]],
  [CommunityServiceTests.MOXTEST, ["Moxie", "Moxie Percent"]],
  [CommunityServiceTests.FAMTEST, ["Familiar Weight"]],
  [CommunityServiceTests.WPNTEST, ["Weapon Damage", "Weapon Damage Percent"]],
  [CommunityServiceTests.SPELLTEST, ["Spell Damage", "Spell Damage Percent"]],
  [CommunityServiceTests.COMTEST, ["Combat Rate"]],
  [CommunityServiceTests.ITEMTEST, ["Item Drop", "Booze Drop"]],
  [CommunityServiceTests.HOTTEST, ["Hot Resistance"]],
  [CommunityServiceTests.COILTEST, []],
]);
export const testNames = new Map([
  [CommunityServiceTests.HPTEST, "HP Test"],
  [CommunityServiceTests.MUSTEST, "Muscle Test"],
  [CommunityServiceTests.MYSTTEST, "Mysticality Test"],
  [CommunityServiceTests.MOXTEST, "Moxie Test"],
  [CommunityServiceTests.FAMTEST, "Familiar Weight Test"],
  [CommunityServiceTests.WPNTEST, "Weapon Damage Test"],
  [CommunityServiceTests.SPELLTEST, "Spell Damage Test"],
  [CommunityServiceTests.COMTEST, "Noncombat Test"],
  [CommunityServiceTests.ITEMTEST, "Item Drop Test"],
  [CommunityServiceTests.HOTTEST, "Hot Resistance Test"],
  [CommunityServiceTests.COILTEST, "Coil Wire"],
]);

export function debug(message: string, color?: string): void {
  if (color) {
    print(message, color);
  } else {
    print(message);
  }
}

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

// From phccs
export function mapMonster(location: Location, monster: Monster): void {
  useSkill($skill`Map the Monsters`);
  if (!get("mappingMonsters")) throw new Error(`I am not actually mapping anything. Weird!`);
  else {
    while (get("mappingMonsters")) {
      visitUrl(toUrl(location));
      runChoice(1, `heyscriptswhatsupwinkwink=${monster.id}`);
    }
  }
}

export function tryUse(item: Item): void {
  if (have(item)) use(item);
}

export const crimboCarols = $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`;

function advCost(whichTest: number): number {
  // Adapted from AutoHCCS
  const page = visitUrl("council.php");
  const testStr = `name=option value=${whichTest}>`;
  if (page.includes(testStr)) {
    const chars = 140; // chars to look ahead
    const pageStr = page.slice(
      page.indexOf(testStr) + testStr.length,
      page.indexOf(testStr) + testStr.length + chars
    );
    const advStr = pageStr.slice(pageStr.indexOf("(") + 1, pageStr.indexOf("(") + 3).trim();
    return parseInt(advStr);
  } else {
    print("Didn't find specified test on the council page. Already done?");
    return 99999;
  }
}

export function logTestSetup(whichTest: number): void {
  const testTurns = advCost(whichTest);
  printModtrace(testModifiers.get(whichTest) ?? []);
  print(
    `${testNames.get(whichTest) ?? "Unknown Test"} takes ${testTurns} adventure${
      testTurns === 1 ? "" : "s"
    }.`,
    "blue"
  );
  set(`_CSTest${whichTest}`, testTurns + (have($effect`Simmering`) ? 1 : 0));
}

/*
function mystSynthAttainable(): boolean {
  if (
    (have($item`yellow candy heart`) && have($item`Crimbo peppermint bark`)) ||
    (have($item`orange candy heart`) &&
      (have($item`Crimbo candied pecan`) || have($item`peppermint sprout`))) ||
    (have($item`pink candy heart`) &&
      (have($item`peppermint sprout`) || have($item`peppermint twist`))) ||
    (have($item`lavender candy heart`) && have($item`Crimbo fudge`))
  )
    return true;
  return false;
}
*/

function needBrickos(): boolean {
  const oysters = itemAmount($item`BRICKO oyster`);
  const brickContributions = Math.floor(itemAmount($item`BRICKO brick`) / 8);
  const eyeContributions = itemAmount($item`BRICKO eye brick`);
  const materials = brickContributions < eyeContributions ? brickContributions : eyeContributions;
  return have($skill`Summon BRICKOs`) && oysters + materials < 1;
}

function chooseLibram(useBrickos: boolean): Skill {
  const needLoveSong =
    itemAmount($item`love song of icy revenge`) +
      Math.floor(haveEffect($effect`Cold Hearted`) / 5) <
    4;
  if (useBrickos && needBrickos()) {
    return $skill`Summon BRICKOs`;
    /*
  } else if (!have($effect`Synthesis: Smart`) && !mystSynthAttainable()) {
    return $skill`Summon Candy Heart`;
    */
  } else if (
    (!have($item`resolution: be happier`) && !have($effect`Joyful Resolve`)) ||
    (!have($item`resolution: be feistier`) && !have($effect`Destructive Resolve`))
  ) {
    return $skill`Summon Resolutions`;
  } else if (
    (!have($item`green candy heart`) && !have($effect`Heart of Green`)) ||
    (!have($item`lavender candy heart`) && !have($effect`Heart of Lavender`))
  ) {
    return $skill`Summon Candy Heart`;
  } else if (needLoveSong) {
    return $skill`Summon Love Song`;
  } else if (!have($item`resolution: be kinder`) && !have($effect`Kindly Resolve`)) {
    return $skill`Summon Resolutions`;
  }

  return $skill`Summon Taffy`;
}

export function burnLibram(saveMp: number, useBrickos?: boolean): void {
  while (myMp() >= mpCost(chooseLibram(useBrickos ?? false)) + saveMp) {
    useSkill(chooseLibram(useBrickos ?? false));
  }
}

export const complexCandies = $items``.filter((candy) => candy.candyType === "complex");
const peppermintCandiesCosts = new Map<Item, number>([
  [$item`peppermint sprout`, 1],
  [$item`peppermint twist`, 1],
  [$item`peppermint patty`, 2],
  [$item`peppermint crook`, 3],
  [$item`cane-mail pants`, 10],
  [$item`peppermint rhino baby`, 11],
  [$item`cane-mail shirt`, 15],
]);
const nonPeppermintCandies = complexCandies.filter(
  (candy) => !Array.from(peppermintCandiesCosts.keys()).includes(candy)
);

function haveCandies(a: Item, b: Item): boolean {
  const candiesRequired = new Map<Item, number>();
  [a, b].forEach((candy) => {
    const currentAmount = candiesRequired.get(candy) ?? 0;
    if (nonPeppermintCandies.includes(candy)) candiesRequired.set(candy, currentAmount + 1);
    else
      candiesRequired.set(
        $item`peppermint sprout`,
        currentAmount + (peppermintCandiesCosts.get(candy) ?? Infinity)
      );
  });

  candiesRequired.forEach((amount, candy) => {
    candiesRequired.set(candy, itemAmount(candy) >= amount ? 1 : 0);
  });

  return Array.from(candiesRequired.values()).every((val) => val === 1);
}

export function getSynthExpBuff(): void {
  const rem = mainStat === $stat`Muscle` ? 2 : mainStat === $stat`Mysticality` ? 3 : 4;
  const pairs = complexCandies
    .map((a) => complexCandies.map((b) => [a, b]))
    .reduce((acc, val) => acc.concat(val), []);
  const bestPair = pairs
    .filter(([a, b]) => (toInt(a) + toInt(b)) % 5 === rem && haveCandies(a, b))
    .reduce((left, right) =>
      left.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val) <
      right.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val)
        ? left
        : right
    );
  if (bestPair[0] === bestPair[1]) retrieveItem(bestPair[0], 2);
  else bestPair.forEach((it) => retrieveItem(it));
  sweetSynthesis(bestPair[0], bestPair[1]);
}
