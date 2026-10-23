/* ═══════════════════════ La Forge des Brumes — données ═══════════════════════
   Un forgeron, un compagnon, une mine maudite sans fond. On descend, on frappe, on remonte forger. */
const SAVE_KEY_F = "forge-brumes-v2";
const APEX_LVL = 99;
const CLASSES = { forgeron: { n: "Forgeron", pal: { cloth: "#5a3a22", trim: "#ff7a2a", metal: "#9aa2aa" }, wpn: "marteau", rk: [1] } };
const COLS = 5, ROWS = 7;

// minerais
const ORES = {
  fer: { n: "Fer", c: "#a8aeb4", ic: "iron" },
  argent: { n: "Argent", c: "#bfe0ff", ic: "gem" },
  ame: { n: "Âme", c: "#c49cff", ic: "essence" },
};
// armes : chaque arme a sa façon de frapper sur la grille
// reach : distance ; line : en ligne droite seulement ; arc : touche aussi les deux cases voisines ; all : toutes les cases autour ; pierce : traverse
const WEAPONS = {
  marteau: { n: "Marteau de forge", d: "Frappe une case voisine et repousse l'ennemi d'une case. Un ennemi projeté contre un mur ou un autre ennemi subit 1 dégât de plus.", dmg: 2, reach: 1, push: 1, unlock: 0, art: "marteau", ic: "hammer" },
  lance: { n: "Lance", d: "Frappe jusqu'à 2 cases en ligne droite et transperce les deux.", dmg: 2, reach: 2, line: 1, pierce: 1, unlock: 0, art: "lance", ic: "pierce" },
  hache: { n: "Hache", d: "Frappe une case voisine et les deux cases qui la bordent.", dmg: 2, reach: 1, arc: 1, unlock: 3, art: "hache", ic: "axe" },
  arbalete: { n: "Arbalète", d: "Tire en ligne droite jusqu'à 4 cases. Le carreau s'arrête au premier obstacle.", dmg: 2, reach: 4, line: 1, shot: 1, unlock: 6, art: "arbalete", ic: "bolt" },
  faux: { n: "Faux", d: "Fauche toutes les cases autour de vous, mais frappe moins fort.", dmg: 1, reach: 1, all: 1, unlock: 10, art: "faux", ic: "scythe" },
  fleau: { n: "Fléau", d: "Un coup terrible sur une case voisine. L'ennemi touché est étourdi un tour.", dmg: 3, reach: 1, stun: 1, unlock: 13, art: "fleau", ic: "mace" },
  epee: { n: "Lame runique", d: "Frappe une case voisine. Chaque ennemi tué vous rend 1 PV.", dmg: 2, reach: 1, vamp: 1, unlock: 16, art: "espadon", ic: "sword" },
};
const WEAPON_IDS = Object.keys(WEAPONS);
// paliers de forge : le métal fait la puissance (et l'apparence)
const TIERS = [
  { n: "Fer", ore: "fer", look: 2 },
  { n: "Argent", ore: "argent", look: 3 },
  { n: "Âme", ore: "ame", look: 5 },
];
const WEAPON_COST = [{ fer: 5 }, { fer: 4, argent: 5 }, { argent: 4, ame: 3 }];
const ARMOR = [
  { n: "Tablier de cuir", hp: 0, look: 1 },
  { n: "Haubert de fer", hp: 2, look: 2, cost: { fer: 7 } },
  { n: "Plates d'argent", hp: 4, look: 3, cost: { fer: 4, argent: 7 } },
  { n: "Armure d'âme", hp: 6, look: 5, cost: { argent: 5, ame: 5 } },
];
const QUALITY = [{ n: "Grossier", b: 0, c: "#a8a090" }, { n: "Bien forgé", b: 0, c: "#d8d0c0" }, { n: "Chef-d'œuvre", b: 1, c: "#ffc04a" }];
// runes (une seule portée), gagnées sur les gardiens
const RUNES = {
  vie: { n: "Rune de vie", d: "Soigne 1 PV à chaque nouvel étage.", ic: "heal" },
  braise: { n: "Rune de braise", d: "Vos coups enflamment : 1 dégât au début du tour suivant.", ic: "fire" },
  echo: { n: "Rune d'écho", d: "Votre premier coup de chaque tour frappe deux fois.", ic: "whirl" },
  pas: { n: "Rune du vent", d: "+1 case de déplacement par tour.", ic: "wind" },
  roc: { n: "Rune de roc", d: "Le premier coup reçu à chaque étage est bloqué.", ic: "shield" },
  fortune: { n: "Rune de fortune", d: "+1 minerai à chaque filon et à chaque gardien.", ic: "coin" },
};
const RUNE_IDS = Object.keys(RUNES);
// compagnons : ils agissent seuls après vous
const PETS = {
  loup: { n: "Loup", d: "Il court sur l'ennemi le plus proche et mord fort (2 dégâts).", dmg: 2, move: 2, unlock: 0, draw: "loup" },
  corbeau: { n: "Corbeau", d: "Il vole par-dessus les murs et marque une cible : elle subit 1 dégât de plus.", dmg: 1, move: 3, fly: 1, mark: 1, unlock: 0, draw: "corbeau" },
  chouette: { n: "Chouette", d: "Elle vous soigne d'1 PV tous les 3 tours, et pique les ennemis proches.", dmg: 1, move: 2, fly: 1, heal: 3, unlock: 0, draw: "chouette" },
  chat: { n: "Chat noir", d: "Il trouve du minerai sur les ennemis qu'il achève.", dmg: 1, move: 2, loot: 1, unlock: 5, draw: "chat_noir" },
  salamandre: { n: "Salamandre", d: "Elle crache le feu à 2 cases : 1 dégât et une brûlure.", dmg: 1, move: 1, range: 2, burn: 1, unlock: 10, draw: "salamandre" },
  drake: { n: "Drakonnet", d: "Un jeune dragon : il souffle sur toute une ligne.", dmg: 2, move: 2, fly: 1, breath: 1, unlock: 15, draw: "drake" },
};
const PET_IDS = Object.keys(PETS);
// monstres : PV en cœurs, intentions toujours annoncées
// ai : melee (frappe la case du héros si voisin), ranged (ligne), bomb (explose 3×3), web (immobilise), slam (ligne de 3), summon
const MONSTERS = {
  rat: { n: "Rat des galeries", art: "rat", hp: 1, dmg: 1, move: 2, ai: "melee", d: "Rapide, il fond sur vous." },
  squelette: { n: "Squelette mineur", art: "squelette", hp: 2, dmg: 1, move: 1, ai: "melee", d: "Il frappe ce qui est à côté de lui." },
  chauve: { n: "Chauve-souris", art: "bat", hp: 1, dmg: 1, move: 2, fly: 1, ai: "melee", d: "Elle vole par-dessus les obstacles." },
  goule: { n: "Goule", art: "goule", hp: 3, dmg: 2, move: 1, ai: "melee", d: "Lente, mais elle frappe fort.", from: 2 },
  archer: { n: "Archer d'os", art: "archer_os", hp: 1, dmg: 1, move: 1, ai: "ranged", range: 4, d: "Il tire en ligne droite. Ne restez pas dans sa ligne.", from: 2 },
  gelee: { n: "Spore putride", art: "spore", hp: 1, dmg: 2, move: 1, ai: "bomb", fuse: 3, d: "Elle explose sur 3×3 cases au bout de 3 tours, ou quand on la tue.", from: 4 },
  araignee: { n: "Araignée des puits", art: "araignee", hp: 2, dmg: 1, move: 2, ai: "web", d: "Sa toile vous empêche de bouger au tour suivant.", from: 5 },
  spectre: { n: "Spectre", art: "spectre", hp: 2, dmg: 1, move: 2, fly: 1, phase: 1, ai: "melee", d: "Un tour sur deux, il est intangible.", from: 7 },
  cultiste: { n: "Cultiste", art: "cultiste", hp: 2, dmg: 1, move: 1, ai: "summon", range: 3, d: "Il invoque des rats et lance des malédictions.", from: 8 },
  golem: { n: "Golem de roche", art: "golem", hp: 6, dmg: 3, move: 1, slow: 1, ai: "slam", d: "Il frappe toute une ligne de 3 cases. Lent : il agit un tour sur deux.", from: 9 },
};
const BOSSES = [
  { id: "contremaitre", n: "Le Contremaître", art: "chevalier_os", hp: 12, dmg: 2, move: 1, ai: "boss_slam", d: "Il commandait la mine. Il commande encore les morts.", summon: "squelette" },
  { id: "reine", n: "La Reine des Puits", art: "reine", hp: 14, dmg: 2, move: 2, ai: "boss_web", d: "Ses enfants grouillent dans chaque fissure.", summon: "araignee" },
  { id: "ver", n: "Le Ver des Profondeurs", art: "ver", hp: 16, dmg: 3, move: 0, ai: "boss_burrow", d: "Il creuse sous vos pieds et jaillit sans prévenir." },
  { id: "dragon", n: "Le Dragon de Braise", art: "dragon", hp: 20, dmg: 3, move: 1, ai: "boss_fire", d: "Il dort sur l'or de la mine depuis mille ans." },
];
// faveurs : un choix parmi trois aux campements (pour la descente en cours)
const BOONS = {
  force: { n: "Bras de fer", d: "+1 dégât à tous vos coups.", ic: "hammer" },
  coeur: { n: "Cœur solide", d: "+2 PV max, et soin complet.", ic: "heart" },
  leger: { n: "Pas léger", d: "+1 case de déplacement.", ic: "wind" },
  pierre: { n: "Peau de pierre", d: "Le premier coup reçu à chaque étage est bloqué.", ic: "shield" },
  choc: { n: "Onde de choc", d: "Les ennemis projetés subissent +1 dégât.", ic: "boom" },
  vampire: { n: "Soif", d: "Chaque ennemi tué a 35 % de chances de vous soigner.", ic: "blood" },
  prospecteur: { n: "Prospecteur", d: "+1 minerai par filon.", ic: "iron" },
  meute: { n: "Instinct de meute", d: "Le compagnon frappe +1.", ic: "paw" },
  furie: { n: "Furie", d: "Tuer un ennemi vous rend votre attaque (une fois par tour).", ic: "rage" },
  potion: { n: "Fiole de réserve", d: "+1 potion.", ic: "potion" },
  oeil: { n: "Œil du mineur", d: "Les filons rapportent un métal plus rare.", ic: "eye" },
  braise: { n: "Mains brûlantes", d: "Vos coups brûlent : 1 dégât au tour suivant.", ic: "fire" },
};
const BOON_IDS = Object.keys(BOONS);
// améliorations permanentes de la forge (payées en braises, gagnées en descendant)
const UPGRADES = {
  pv: { n: "Endurance", d: "+1 PV max.", max: 4, cost: [25, 50, 90, 150] },
  potion: { n: "Fioles", d: "+1 potion au départ.", max: 2, cost: [40, 110] },
  sacoche: { n: "Sacoche renforcée", d: "En cas de mort, vous gardez plus de minerai.", max: 3, cost: [30, 70, 130] },
  dressage: { n: "Dressage", d: "Le compagnon a +1 PV et frappe plus souvent.", max: 2, cost: [45, 120] },
  raccourci: { n: "Ascenseur", d: "Commencer la descente au dernier gardien vaincu.", max: 1, cost: [80] },
};
