# La Forge des Brumes — notes pour reprendre le projet

Toujours répondre en **français**. Pas de Unity tant que le jeu n'est pas finalisé. Jeu séparé de « Couronne de Cendres » (dépôt Ash-Crown).

## Le jeu (refonte complète, minimaliste)
Un forgeron et un compagnon descendent une mine maudite sans fond, étage par étage.
- Chaque étage est une grille 5×7 jouée en portrait, à une main. À son tour : **1 déplacement + 1 frappe**, en touchant la grille.
- Les monstres de mêlée frappent au contact (zone de menace rouge pâle) ; les tirs, explosions et gardiens annoncent leurs cases (rouge vif).
- Filons de minerai (fer, argent, âme) à frapper pendant le combat : ils s'effondrent quand l'étage est nettoyé.
- Gardien tous les 5 étages (rune offerte, choix remonter / continuer), campement avec 1 faveur sur 3.
- À la forge : 7 armes aux frappes différentes, 3 paliers de métal, armures visibles sur le forgeron, mini-jeu de 3 coups de marteau (qualité), runes, améliorations en braises.
- Mort : on perd une partie du minerai de la descente.

## Structure
- Racine = jeu publié (GitHub Pages) : https://norbeo.github.io/Mists-Forge/
- `source/src/` : 00 util · 01 données · 02 règles (testables sous node) · 10–15 rendu · 20–21 son et icônes · 30 interface/forge · 31 mine · 39 démarrage.
- `source/build.sh` → `index.html` (aperçu) et `dist/` (à copier à la racine pour publier).
- `source/test/sim.js` : bots (`node test/sim.js 10 25 3`) — erreurs, équilibrage, record moyen.
- Sauvegarde : localStorage `forge-brumes-v2`.

## Commits
Auteur `Norbeo`, terminer par : Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
