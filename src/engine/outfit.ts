import { OutfitSpec } from "grimoire-kolmafia";
import { $familiar, $item, $items, have } from "libram";

export function baseOutfit(): OutfitSpec {
  return {
    hat: $item`Daylight Shavings Helmet`,
    shirt: $item`Jurassic Parka`,
    weapon: $items`weeping willow wand, Fourth of May Cosplay Saber`,
    offhand: $item`unbreakable umbrella`,
    pants: $item`designer sweatpants`,
    acc1: $item`Cincho de Mayo`,
    acc2: $item`Eight Days a Week Pill Keeper`,
    acc3: $item`backup camera`,
    familiar: $familiar`Reagnimated Gnome`,
    famequip: have($item`gnomish housemaid's kgnee`)
      ? $item`gnomish housemaid's kgnee`
      : $item`toy Cupid bow`,
  };
}
