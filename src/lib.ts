import {
  cliExecuteOutput,
  familiarWeight,
  Item,
  Location,
  Monster,
  myFamiliar,
  print,
  runChoice,
  toUrl,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $skill, get, have, set } from "libram";

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
export const shavingsBuffs = $effects`Barbell Moustache, Cowboy Stache, Friendly Chops, Grizzly Beard, Gull-Wing Moustache, Musician's Musician's Moustache, Pointy Wizard Beard, Space Warlord's Beard, Spectacle Moustache, Surrealist's Moustache, Toiletbrush Moustache`;

function replaceAll(str: string, searchValue: string, replaceValue: string): string {
  const newStr = str.replace(searchValue, replaceValue);
  if (newStr === str) return newStr;
  return replaceAll(newStr, searchValue, replaceValue);
}

function printModtrace(modifiers: string | string[], baseModifier?: string): void {
  if (typeof modifiers === "string") {
    return printModtrace([modifiers], modifiers);
  } else {
    if (modifiers.length === 0) return;
    if (!baseModifier) {
      const baseModifiers = new Map(
        modifiers.map((key) => {
          return [key, 1];
        })
      );

      modifiers.forEach((keyThis) => {
        for (const keyNext of modifiers) {
          if (keyThis === keyNext) continue;
          if (keyThis.includes(keyNext)) {
            baseModifiers.set(keyThis, 0);
            break;
          }
        }
      });

      modifiers.forEach((keyThis) => {
        if (baseModifiers.get(keyThis) ?? 0 !== 0) {
          const modifiersSubset = [keyThis];

          for (const keyNext of modifiers) {
            if (keyThis === keyNext) continue;
            if (keyNext.includes(keyThis)) modifiersSubset.push(keyNext);
          }
          printModtrace(modifiersSubset, keyThis);
        }
      });
    } else {
      let htmlOutput = cliExecuteOutput(`modtrace ${baseModifier}`);
      let htmlHeader = htmlOutput.substring(
        htmlOutput.indexOf("<tr>") + 4,
        htmlOutput.indexOf("</tr>")
      );
      let headers = [] as string[];
      let headerMatches = htmlHeader.match("(>)(.*?)(</td>)");
      while (headerMatches) {
        const header = headerMatches[2];
        headers.push(header);

        const idx = headerMatches[0].length + htmlHeader.search("(>)(.*?)(</td>)");
        htmlHeader = htmlHeader.substring(idx);
        headerMatches = htmlHeader.match("(>)(.*?)(</td>)");
      }
      headers = headers.slice(2);

      const exactModifierColIdx = headers.findIndex(
        (header) => header.toLowerCase() === baseModifier.toLowerCase()
      );

      if (exactModifierColIdx === -1) {
        print(
          `Could not find exact string match of ${baseModifier} in ${modifiers.toString()}`,
          "red"
        );
        return;
      }

      let totalVal = 0.0;
      // Maps modifier name to its value
      const modifierVals = new Map(
        headers.map((header) => {
          return [header, 0];
        })
      );

      const lowerCaseModifiers = modifiers.map((modifier) => modifier.toLowerCase());

      if (baseModifier.toLowerCase() === "familiar weight") {
        totalVal += familiarWeight(myFamiliar());
        print(`[Familiar Weight] Base weight (${totalVal})`);
      }

      htmlOutput = htmlOutput.substring(
        htmlOutput.indexOf("</tr>") + 5,
        htmlOutput.indexOf("</table>")
      );

      while (htmlOutput.length > 0) {
        const idxStart = htmlOutput.indexOf("<tr>");
        const idxEnd = htmlOutput.indexOf("</tr>");
        if (idxStart === -1) break;

        let row = replaceAll(htmlOutput.substring(idxStart + 4, idxEnd), "></td>", ">0</td>");
        const rowArr = [] as string[];
        let rowMatches = row.match("(>)(.*?)(</td>)");
        while (rowMatches) {
          rowArr.push(rowMatches[2]);
          row = row.replace(rowMatches[0], "");
          rowMatches = row.match("(>)(.*?)(</td>)");
        }
        rowArr
          .slice(2)
          .filter((e, idx) => idx % 2 === 0)
          .forEach((e, idx) => {
            const val = parseInt(e);
            modifierVals.set(headers[idx], (modifierVals.get(headers[idx]) ?? 0) + val);
            if (val !== 0 && lowerCaseModifiers.includes(headers[idx].toLowerCase())) {
              print(`[${headers[idx]}] ${rowArr[1]} (${val.toFixed(1)})`);
            }
          });

        htmlOutput = htmlOutput.substring(idxEnd + 5);
      }

      let total = 0.0;
      for (const modifier of headers) {
        if (lowerCaseModifiers.includes(modifier.toLowerCase())) {
          let totalVal = modifierVals.get(modifier) ?? 0;
          if (modifier.toLowerCase() === "weapon damage") {
            if (have($effect`Bow-Legged Swagger`)) {
              print(`[Weapon Damage] Bow-Legged Swagger (${totalVal.toFixed(1)})`);
              totalVal += totalVal;
            }
          } else if (modifier.toLowerCase() === "weapon damage percent") {
            if (have($effect`Bow-Legged Swagger`)) {
              print(`[Weapon Damage Percent] Bow-Legged Swagger (${totalVal.toFixed(1)})`);
              totalVal += totalVal;
            }
          }
          print(`${modifier} => ${totalVal.toFixed(1)}`, "purple");

          total += totalVal;
        }
      }

      print(`Total ${baseModifier}: ${total.toFixed(1)}`, "blue");
    }
  }
}

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
