import { OutfitSpec } from "grimoire-kolmafia";
import { $familiar, $item, $items } from "libram";

export function baseOutfit(): OutfitSpec {
  return {
    hat: $item`Daylight Shavings Helmet`,
    shirt: $item`Jurassic Parka`,
    weapon: $items`weeping willow wand, Fourth of May Cosplay Saber`,
    offhand: $item`familiar scrapbook`,
    pants: $item`designer sweatpants`,
    acc1: $item`Cincho de Mayo`,
    acc2: $item`Eight Days a Week Pill Keeper`,
    acc3: $item`backup camera`,
    // eslint-disable-next-line libram/verify-constants
    familiar: $familiar`Cooler Yeti`,
    famequip: $item`toy Cupid bow`,
  };
}
