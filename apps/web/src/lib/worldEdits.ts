/**
 * worldEdits — стор правок мира в Play-режиме.
 *
 * Три вида модификаций (все persist в localStorage):
 *   1. Additions  — кубы/коины/NPC/деревья/лампы, добавленные ребёнком через Spawn-палитру
 *   2. Removed    — набор position-hash мешей, которые ребёнок убрал с карты
 *   3. Recolored  — map position-hash → hex-цвет, для перекрашенных мешей
 *
 * Идентификация мешей по «position-hash» — округлённая до 0.5м позиция меша
 * при первом рендере сцены. Это стабильнее UUID (они регенерятся на reload)
 * и достаточно уникально для объектов которые не двигаются.
 */

export type PropKind =
  // Blocks
  | 'cube' | 'sphere' | 'cylinder' | 'ramp' | 'plate'
  // Gameplay
  | 'coin' | 'checkpoint' | 'goal' | 'spike' | 'bouncer'
  // Platformer collectibles (Kenney)
  | 'chest' | 'key' | 'star' | 'heart' | 'bomb' | 'barrel' | 'crate' | 'ladder' | 'tree-pine' | 'flag-platformer'
  // Nature
  | 'tree' | 'bush' | 'mushroom' | 'rock' | 'flower' | 'grass-tuft'
  // NPCs
  | 'npc-bunny' | 'npc-alien' | 'npc-cactoro' | 'npc-birb' | 'npc-bluedemon'
  // Lights
  | 'light' | 'torch' | 'neon-sign'
  // Decor (Kenney)
  | 'building' | 'car' | 'pumpkin' | 'coffin' | 'candle'
  // Procedural mechanics
  | 'speed-pad' | 'portal' | 'crystal' | 'campfire' | 'sign' | 'stair-step'
  // Architecture
  | 'arch' | 'fence' | 'bench' | 'flower-pot' | 'halfpipe'
  // Special
  | 'windmill' | 'snowman' | 'satellite-dish'
  // Food
  | 'cake' | 'donut' | 'ice-cream'
  // Sci-fi
  | 'rocket' | 'robot' | 'ufo'
  // Fantasy
  | 'castle-tower' | 'magic-orb' | 'throne'
  // Music
  | 'guitar' | 'piano' | 'drum-kit'
  // Sports
  | 'soccer-ball' | 'trophy' | 'goal-net'
  // Animals
  | 'duck' | 'cat-statue' | 'fish-tank'
  // Household
  | 'table' | 'bookshelf' | 'lamp-floor'
  // Transportation
  | 'airplane' | 'boat' | 'train'
  // Playground
  | 'swing' | 'slide' | 'seesaw'
  // Space
  | 'planet' | 'asteroid' | 'space-station'
  // School
  | 'book-stack' | 'globe' | 'microscope'
  // Medieval
  | 'sword' | 'shield' | 'knight-statue'
  // Ocean
  | 'coral' | 'submarine' | 'anchor'
  // Winter
  | 'igloo' | 'sled' | 'snowflake-deco'
  // Circus
  | 'circus-tent' | 'ferris-wheel' | 'hot-air-balloon' | 'pinwheel' | 'lantern'
  // Kitchen/Food2
  | 'burger' | 'pizza' | 'sushi'
  // Camping
  | 'tent' | 'backpack' | 'compass'
  // Halloween
  | 'witch-hat' | 'ghost' | 'spider-web'
  // Toys
  | 'teddy-bear' | 'lego-brick' | 'yo-yo'
  // Lab
  | 'flask' | 'atom' | 'gear'
  // Weather
  | 'rain-cloud' | 'lightning-bolt' | 'rainbow-arch' | 'snowdrift' | 'sun-deco'
  // Egypt
  | 'pyramid' | 'sphinx' | 'obelisk'
  // Candy
  | 'lollipop' | 'candy-cane' | 'gingerbread'
  // Workshop
  | 'toolbox' | 'anvil' | 'barrel-fire'
  // Art
  | 'easel' | 'sculpture' | 'vase-ancient'
  // Farm
  | 'cow' | 'barn' | 'hay-bale' | 'scarecrow' | 'well'
  // Pirates
  | 'cannon' | 'ship-wheel' | 'treasure-map' | 'jolly-roger' | 'anchor-chain'
  // Jungle
  | 'palm-tree' | 'bamboo' | 'snake-deco' | 'tribal-mask' | 'vine-swing'
  // City
  | 'traffic-light' | 'fire-hydrant' | 'mailbox' | 'street-lamp' | 'phone-booth'
  // Garden
  | 'watering-can' | 'bird-bath' | 'garden-gnome' | 'flower-bed' | 'trellis'
  // Sport-2
  | 'basketball-hoop' | 'boxing-gloves' | 'archery-target' | 'surf-board' | 'dumbbell'
  // Food-2
  | 'taco' | 'ramen-bowl' | 'boba-tea' | 'croissant' | 'watermelon-slice'
  // Vehicles
  | 'helicopter' | 'bicycle' | 'scooter' | 'hot-rod' | 'jeep'
  // Beach
  | 'sandcastle' | 'beach-umbrella' | 'lifeguard-tower' | 'buoy' | 'surfboard-rack'
  // Ancient
  | 'catapult' | 'broken-column' | 'altar' | 'sarcophagus' | 'colosseum-arch'
  // Underwater
  | 'shipwreck' | 'treasure-chest-open' | 'anemone' | 'sea-turtle' | 'whale'
  // Fairground
  | 'popcorn-stand' | 'bumper-car' | 'ticket-booth' | 'balloon-arch' | 'prize-wheel'
  // Nordic/Viking
  | 'longship' | 'runestone' | 'viking-helmet' | 'mead-hall' | 'axe-rack'
  // Magical Forest
  | 'fairy-ring' | 'giant-mushroom' | 'crystal-tree' | 'wizard-hat' | 'potion-stand'
  // Industrial
  | 'factory-chimney' | 'conveyor-belt' | 'robot-arm' | 'oil-drum' | 'crane'
  // Retro/Arcade
  | 'arcade-machine' | 'retro-tv' | 'cassette-tape' | 'game-controller' | 'pixel-heart'
  // Nature 2
  | 'waterfall' | 'lotus-pond' | 'volcano' | 'geyser' | 'cave-entrance'
  // Dinosaurs
  | 't-rex' | 'triceratops' | 'stegosaurus' | 'pterodactyl' | 'dino-egg'
  // Western
  | 'saloon' | 'cactus-tall' | 'tumbleweed' | 'wanted-sign' | 'horseshoe'
  // Ice Kingdom
  | 'ice-castle' | 'ice-spike' | 'frozen-tree' | 'snowfort' | 'polar-bear'
  // Anime
  | 'torii-gate' | 'paper-lantern' | 'sakura-tree' | 'ninja-star' | 'temple-bell'
  // Deep Space
  | 'black-hole' | 'nebula-cloud' | 'space-debris' | 'laser-turret' | 'warp-gate'
  // Magic Effects
  | 'fireworks' | 'spark-fountain' | 'smoke-cloud' | 'rainbow-jet' | 'magic-circle'
  // Superhero
  | 'hero-cape' | 'hero-mask' | 'power-shield' | 'hero-statue' | 'energy-core'
  // Buildings
  | 'house-small' | 'apartment' | 'skyscraper' | 'cottage' | 'lighthouse-prop'
  | 'castle-wall' | 'shop-front' | 'school-building' | 'barn-big' | 'temple-prop'
  // City-2
  | 'hospital' | 'police-station' | 'fire-station' | 'library-building' | 'park-fountain'
  | 'bus-stop' | 'bridge-arch' | 'stadium' | 'museum' | 'market-stall'
  // Transport-2
  | 'ambulance' | 'fire-truck' | 'police-car' | 'school-bus' | 'tractor'
  | 'submarine-mini' | 'sailboat' | 'hot-air-balloon-2' | 'cable-car' | 'monorail'
  // Food/Café
  | 'cafe-table' | 'coffee-cup' | 'cake-slice' | 'ice-cream-stand' | 'food-cart'
  | 'pizza-oven' | 'soda-machine' | 'cupcake' | 'pretzel' | 'hot-dog-stand'
  // Sports-2
  | 'swimming-pool' | 'tennis-court' | 'ski-jump' | 'bowling-pin' | 'dartboard'
  | 'golf-hole' | 'climbing-wall' | 'balance-beam' | 'racing-flag' | 'medal-stand'
  // Space-2
  | 'moon-base' | 'space-rover' | 'satellite-dish-2' | 'alien-ship' | 'cryo-pod'
  | 'space-suit' | 'meteor-shower' | 'ring-planet' | 'rocket-launch-pad' | 'space-cannon'
  // Fantasy-2
  | 'wizard-tower' | 'dragon-statue' | 'magic-wand' | 'spell-book' | 'enchanted-sword'
  | 'alchemy-table' | 'fairy-house' | 'rune-stone-glow' | 'magic-mirror' | 'cursed-chest'
  // Sci-Tech
  | 'hologram-display' | 'tesla-coil' | 'dna-helix' | 'laser-beam' | 'computer-terminal'
  | 'reactor-core' | 'data-tower' | 'magnifying-glass' | 'portal-gun' | 'hover-pad'
  // Ocean Park
  | 'jellyfish' | 'clam-shell' | 'crab-prop' | 'seaweed-tall' | 'diving-bell'
  | 'reef-rock' | 'sea-star' | 'manta-ray' | 'puffer-fish' | 'sunken-ship-bow'
  // Jungle Park
  | 'jungle-bridge' | 'tribal-drum' | 'jungle-flower' | 'tree-giant' | 'parrot-perch'
  | 'waterfall-small' | 'bamboo-wall' | 'frog-statue' | 'temple-ruin' | 'treasure-map-stand'
  // Steampunk
  | 'steam-pipe' | 'clockwork-gear' | 'airship-engine' | 'pressure-gauge' | 'steam-locomotive'
  | 'cog-tower' | 'tesla-lamp' | 'brass-telescope' | 'steam-vent' | 'dirigible'
  // Cyberpunk
  | 'neon-billboard' | 'cyber-vending' | 'holo-ad' | 'drone-prop' | 'cyberpunk-car'
  | 'server-rack' | 'cyber-street-lamp' | 'rain-puddle' | 'graffiti-wall' | 'cyber-trash'
  // Space Station
  | 'launch-silo' | 'space-capsule' | 'moon-crater' | 'ion-thruster' | 'astro-lab'
  | 'solar-collector' | 'space-beacon' | 'oxygen-tank' | 'hull-panel' | 'space-buggy'
  // Prehistoric
  | 'cave-painting' | 'mammoth' | 'dino-track' | 'bone-pile' | 'flint-club'
  | 'stone-hut' | 'fire-pit-2' | 'sabre-tooth' | 'tar-pit' | 'amber-gem'
  // Enchanted Village
  | 'magic-well' | 'enchanted-gate' | 'pixie-lamp' | 'spell-scroll' | 'crystal-ball-stand'
  | 'mushroom-house' | 'fairy-fountain' | 'glowing-tree' | 'potion-rack' | 'rune-altar'
  // Underwater Lab
  | 'submarine-hatch' | 'pressure-dome' | 'sonar-tower' | 'deep-probe' | 'bubble-vent'
  | 'coral-lab' | 'specimen-tank' | 'depth-gauge' | 'torpedo-bay' | 'biolume-tank'
  // Desert Oasis
  | 'sand-dune' | 'oasis-pool' | 'date-palm' | 'desert-tent' | 'camel-statue'
  | 'mirage-pillar' | 'desert-scorpion' | 'nomad-brazier' | 'sandstone-arch' | 'desert-skull'
  // Medieval Castle
  | 'castle-door' | 'drawbridge' | 'knight-armor' | 'catapult-prop' | 'dungeon-door'
  | 'heraldic-banner' | 'arrow-slit' | 'wall-torch' | 'moat-water' | 'portcullis'
  // Rainforest
  | 'jungle-canopy' | 'lianas' | 'tree-frog' | 'toucan-perch' | 'jungle-waterfall'
  | 'orchid-bloom' | 'jaguar-statue' | 'vine-ladder' | 'leaf-platform' | 'jungle-hut'
  // Arctic Research
  | 'igloo-lab' | 'ice-drill' | 'polar-buoy' | 'snowcat' | 'blizzard-shield'
  | 'aurora-post' | 'ice-core-rack' | 'penguin-prop' | 'walrus-statue' | 'arctic-tent'
  // Pirate Cove
  | 'pirate-ship' | 'ship-cannon' | 'treasure-map' | 'jolly-roger' | 'plank-bridge'
  | 'pirate-chest' | 'anchor-prop' | 'sea-mine' | 'crow-nest' | 'pirate-tavern'
  // Candy Land
  | 'candy-tree' | 'lollipop-tower' | 'gingerbread-house' | 'candy-cane-gate' | 'cupcake-throne'
  | 'cotton-candy-cloud' | 'chocolate-river' | 'donut-arch' | 'jellybean-path' | 'sugar-castle'
  // Volcano World
  | 'lava-pool' | 'volcano-rock' | 'fire-geyser' | 'obsidian-pillar' | 'lava-bridge'
  | 'magma-crystal' | 'fire-shrine' | 'ash-tree' | 'ember-lantern' | 'lava-golem'
  // Neon City
  | 'neon-tower' | 'hologram-kiosk' | 'cyber-pod' | 'neon-fountain' | 'hover-platform'
  | 'data-pillar' | 'glitch-box' | 'neon-bench' | 'cyber-gate' | 'signal-array'
  // Ancient Egypt
  | 'pyramid-block' | 'sphinx-head' | 'obelisk' | 'sarcophagus' | 'ankh-idol'
  | 'canopic-jar' | 'scarab-gem' | 'papyrus-scroll' | 'eye-of-ra' | 'desert-torch'
  // Fairy Garden
  | 'fairy-mushroom' | 'dewdrop-flower' | 'butterfly-perch' | 'fern-curl' | 'acorn-house'
  | 'spider-web' | 'fairy-ring' | 'pebble-path' | 'moss-log' | 'wish-well'
  // Western Town
  | 'saloon-front' | 'water-trough' | 'hitching-post' | 'wanted-poster' | 'sheriff-star'
  | 'cactus-barrel' | 'mining-cart' | 'gold-nugget' | 'western-fence' | 'hay-bale'
  // Haunted Mansion
  | 'ghost-lantern' | 'gravestone' | 'haunted-tree' | 'cauldron-bubble' | 'bat-swarm'
  | 'cobweb-arch' | 'coffin-lid' | 'potion-shelf' | 'cursed-mirror' | 'spirit-flame'
  // Robot Factory
  | 'assembly-arm' | 'conveyor-belt' | 'robot-drone' | 'gear-column' | 'spark-welder'
  | 'circuit-panel' | 'power-core' | 'sensor-tower' | 'cargo-claw' | 'bot-chassis'
  // Underwater City
  | 'kelp-tower' | 'bubble-dome' | 'sea-arch' | 'clam-throne' | 'whirlpool-gate'
  | 'glowing-jellyfish' | 'sunken-statue' | 'treasure-chest-sea' | 'anglerfish-lamp' | 'submarine-dock'
  // Sky Kingdom
  | 'cloud-castle' | 'rainbow-bridge' | 'sky-balloon' | 'wind-mill-sky' | 'floating-island'
  | 'sun-dial' | 'cloud-throne' | 'sky-crystal' | 'wind-chime' | 'storm-eye'
  // Crystal Cave
  | 'stalactite' | 'crystal-cluster' | 'cave-pool' | 'glow-worm' | 'mineral-vein'
  | 'cave-mushroom' | 'echo-stone' | 'underground-waterfall' | 'gem-geode' | 'lava-crack'
  // Dinosaur Park
  | 'dino-skeleton' | 't-rex-roar' | 'dino-egg-b21' | 'stegosaurus-spike' | 'velociraptor-nest'
  | 'fern-jurassic' | 'dino-track-b21' | 'pterodactyl-perch' | 'volcano-mud-pit' | 'dino-info-sign'
  // Atlantis City
  | 'atlantis-temple' | 'trident-monument' | 'coral-pillar' | 'seahorse-statue' | 'bubble-chamber'
  | 'atlantis-gate' | 'ocean-floor-ruin' | 'atlantis-crystal-spire' | 'mermaid-fountain' | 'neptune-idol'
  // Magic School
  | 'spell-cauldron' | 'wizard-desk' | 'spell-book-stand' | 'astro-lab-table' | 'magic-mirror-school'
  | 'graduation-podium' | 'wand-rack' | 'hourglass-school' | 'star-map' | 'magic-chalkboard'
  // Jungle Temple
  | 'jungle-pillar' | 'moss-altar' | 'vine-gate' | 'temple-idol' | 'giant-leaf'
  | 'temple-fire-brazier' | 'serpent-carving' | 'hidden-trap-door' | 'ancient-gong' | 'jungle-shrine'
  // Ice Palace
  | 'ice-palace-tower' | 'frozen-waterfall' | 'ice-statue' | 'ice-bridge' | 'snow-drift'
  | 'ice-crystal-pillar' | 'ice-blizzard-shield' | 'ice-throne-chair' | 'polar-bear-statue' | 'ice-lantern'
  // Lava Forge
  | 'forge-anvil' | 'lava-forge' | 'molten-hammer' | 'lava-tube-pipe' | 'forge-chest'
  | 'smith-bellows' | 'lava-rune' | 'forge-golem' | 'molten-crucible' | 'ember-spark'
  // Mushroom Kingdom
  | 'giant-mushroom-b24' | 'mushroom-house-b24' | 'spore-cloud' | 'glowing-mushroom-ring' | 'mushroom-bridge'
  | 'mushroom-toadstool' | 'mushroom-lamp' | 'mushroom-fountain-b24' | 'mushroom-gate' | 'toad-king-throne'
  // Space Outpost
  | 'satellite-dish-b24' | 'habitat-module' | 'space-antenna' | 'outpost-cryo-pod' | 'airblock-door'
  | 'space-tool-rack' | 'meteor-fragment' | 'outpost-beacon' | 'space-turret' | 'hull-breach-patch'
  // Toy Workshop
  | 'toy-train-b25' | 'building-block-tower' | 'wind-up-robot' | 'teddy-bear-b25' | 'kaleidoscope-tower'
  | 'snow-globe' | 'toy-chest-b25' | 'music-box-b25' | 'puppet-stage' | 'marble-machine'
  // Garden Party
  | 'garden-pavilion' | 'rose-arbor' | 'garden-bench' | 'flower-arrangement' | 'party-balloons'
  | 'cake-tower' | 'garden-sunflower' | 'garden-windmill' | 'garden-bird-bath' | 'picnic-blanket'
  // Circus Spectacular
  | 'acrobat-trapeze' | 'circus-elephant' | 'juggling-balls' | 'circus-big-tent' | 'tightrope-wire'
  | 'clown-car' | 'magic-hat-circus' | 'ring-of-fire' | 'circus-podium' | 'lion-tamer-whip'
  // Viking Age
  | 'viking-longship' | 'runestone-b26' | 'viking-iron-helmet' | 'viking-mead-hall' | 'viking-axe-rack'
  | 'bonfire-viking' | 'viking-shield' | 'dragon-prow' | 'nordic-well' | 'nordic-banner'
  // Samurai Japan
  | 'samurai-sword' | 'samurai-armor' | 'pagoda-temple' | 'torii-gate' | 'cherry-blossom'
  | 'katana-rack' | 'lantern-japanese' | 'sakura-bridge' | 'tea-house-japanese' | 'shuriken-b27'
  // Aztec Empire
  | 'aztec-pyramid' | 'aztec-sun-stone' | 'quetzal-bird' | 'aztec-water-fountain' | 'jade-mask'
  | 'obsidian-altar' | 'tepee-hut' | 'aztec-warrior' | 'aztec-serpent'
  // Deep Sea
  | 'anglerfish-b28' | 'ocean-trench' | 'giant-squid' | 'deep-sea-jellyfish' | 'sunken-ship-b28'
  | 'coral-garden' | 'deep-sub-mini'
  // Wild West
  | 'saloon-b28' | 'wild-west-wagon' | 'west-sheriff-star' | 'tumbleweed-b28' | 'water-tower-west'
  | 'west-gold-nugget' | 'cactus-big' | 'bandit-campfire' | 'oil-derrick' | 'barn-west'
  | 'west-street-lanterns' | 'gold-mine-cart'
  // Medieval Market
  | 'b29-market-stall' | 'medieval-well' | 'medieval-catapult' | 'herald-banner' | 'smithy-anvil'
  | 'medieval-tavern' | 'medieval-knight-statue' | 'medieval-crossbow' | 'merchant-chest'
  // Tech Lab
  | 'tech-hologram' | 'tech-robot-arm' | 'dna-helix' | 'quantum-computer' | 'laser-cutter'
  | 'nanodrone-swarm' | 'plasma-reactor' | 'cloning-pod' | 'lab-beaker' | 'time-portal'
  // Space Station
  | 'space-station-hub' | 'space-oxy-tank' | 'asteroid-b30' | 'space-airlock' | 'space-sat-dish'
  | 'space-pod' | 'space-helmet' | 'b30-space-debris' | 'nebula-clouds'
  // Underwater Castle
  | 'underwater-castle' | 'coral-spire' | 'mermaid-statue' | 'underwater-anchor' | 'bubble-stream'
  | 'ocean-treasure-map' | 'b30-sea-turtle' | 'wreck-cannon' | 'aqua-gargoyle' | 'underwater-gate'
  // Steampunk City
  | 'steam-piston' | 'gearwork-clock' | 'airship-b31' | 'steam-pipe-system' | 'brass-gauge'
  | 'steampunk-golem' | 'telegraph-station' | 'steam-factory' | 'zeppelin-b31'
  // Anime Dojo
  | 'dojo-punching-dummy' | 'katana-blade' | 'dojo-scroll-board' | 'ninja-tower' | 'anime-energy-orb'
  | 'tako-yaki-cart' | 'dojo-mat' | 'breaking-boards' | 'training-bell'
  // Enchanted Forest
  | 'fairy-ring-b32' | 'glowing-tree-b32' | 'pixie-dust' | 'ancient-tree-spirit' | 'enchanted-mushroom'
  | 'crystal-cave-32' | 'druid-stone' | 'wisteria-arch' | 'willow-tree'
  // Post-Apocalypse
  | 'ruined-skyscraper' | 'rusted-car-wreck' | 'radiation-barrel' | 'scavenger-tower' | 'wasteland-turret'
  | 'bunker-entrance' | 'apoc-solar-panel' | 'post-apoc-telephone'
  // Farm
  | 'farm-hay-bale' | 'chicken-coop' | 'tractor-b33' | 'farm-silo' | 'garden-scarecrow'
  | 'rooster-weather-vane' | 'pig-pen' | 'water-mill'
  // Industrial Port
  | 'port-crane' | 'shipping-container' | 'dock-cleat' | 'storage-tank-b33' | 'fork-lift'
  | 'fishing-boat' | 'lighthouse-port-b33' | 'coal-conveyor' | 'industrial-chimney'
  // Ancient Greece
  | 'greek-pillar' | 'greek-urn-b34' | 'greek-shield' | 'olive-tree-b34' | 'greek-lyre'
  | 'athens-owl-b34' | 'trireme-b34' | 'parthenon-cap'
  // Cyberpunk City
  | 'neon-sign-b34' | 'cyber-tower-b34' | 'hover-car-b34' | 'data-terminal-b34'
  | 'cyber-blade-b34' | 'synth-plant-b34' | 'cyber-drone-b34' | 'power-core-b34' | 'cyber-bridge-b34'
  // Arctic Tundra
  | 'igloo-b35' | 'polar-bear-b35' | 'arctic-fox-b35' | 'snow-drift-b35' | 'walrus-b35'
  | 'iceberg-b35' | 'northern-lights-b35' | 'penguin-b35'
  // Medieval Castle
  | 'castle-tower-b35' | 'drawbridge-b35' | 'knight-armor-b35' | 'catapult-b35'
  | 'medieval-well-b35' | 'torch-b35' | 'banner-b35'

export interface SpawnedPart {
  id: string
  worldId: string
  pos: [number, number, number]
  color: string
  size: number
  kind: PropKind
}

interface StoreShape {
  additions: SpawnedPart[]
  removed: Record<string, string[]>          // worldId -> array of position hashes
  recolored: Record<string, Record<string, string>>  // worldId -> { posHash: hex }
}

const STORAGE_KEY = 'ek_world_edits_v2'
const listeners = new Set<() => void>()

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreShape>
      return {
        additions: parsed.additions ?? [],
        removed: parsed.removed ?? {},
        recolored: parsed.recolored ?? {},
      }
    }
  } catch {
    /* ignore */
  }
  return { additions: [], removed: {}, recolored: {} }
}

let state: StoreShape = load()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota */ }
}
function emit() { for (const l of listeners) l() }

export function subscribeEdits(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** Округляем до 0.5 юнита — совпадает с Spawn-палитрой и makeObjectIdFromPos. */
export function hashPos(p: [number, number, number]): string {
  const r = (n: number) => Math.round(n * 2) / 2
  return `${r(p[0])}|${r(p[1])}|${r(p[2])}`
}

// ─── Additions ────────────────────────────────────────────
export function getAdditionsForWorld(worldId: string): SpawnedPart[] {
  return state.additions.filter((s) => s.worldId === worldId)
}
export function addSpawnedPart(p: Omit<SpawnedPart, 'id'>): string {
  const id = `spawn_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  state = { ...state, additions: [...state.additions, { ...p, id }] }
  persist()
  emit()
  return id
}
export function removeSpawnedPart(id: string) {
  state = { ...state, additions: state.additions.filter((s) => s.id !== id) }
  persist()
  emit()
}

// ─── Removed ──────────────────────────────────────────────
export function getRemovedForWorld(worldId: string): Set<string> {
  return new Set(state.removed[worldId] ?? [])
}
export function addRemoved(worldId: string, posHash: string) {
  const list = state.removed[worldId] ?? []
  if (list.includes(posHash)) return
  state = { ...state, removed: { ...state.removed, [worldId]: [...list, posHash] } }
  persist()
  emit()
}
export function clearRemovedForWorld(worldId: string) {
  const next = { ...state.removed }
  delete next[worldId]
  state = { ...state, removed: next }
  persist()
  emit()
}

// ─── Recolored ────────────────────────────────────────────
export function getRecoloredForWorld(worldId: string): Record<string, string> {
  return state.recolored[worldId] ?? {}
}
export function setRecolor(worldId: string, posHash: string, hex: string) {
  const map = state.recolored[worldId] ?? {}
  state = {
    ...state,
    recolored: { ...state.recolored, [worldId]: { ...map, [posHash]: hex } },
  }
  persist()
  emit()
}
export function clearRecolorsForWorld(worldId: string) {
  const next = { ...state.recolored }
  delete next[worldId]
  state = { ...state, recolored: next }
  persist()
  emit()
}

// ─── Bulk reset ──────────────────────────────────────────
export function resetWorldEdits(worldId: string) {
  clearRemovedForWorld(worldId)
  clearRecolorsForWorld(worldId)
  state = { ...state, additions: state.additions.filter((s) => s.worldId !== worldId) }
  persist()
  emit()
}

// ─── Undo stack (паттерн GMod undo) ───────────────────────
// Простой in-memory стек последних операций. На reload сбрасывается —
// это не полноценная история, а защита от случайных кликов в Edit-режиме.
export type UndoOp =
  | { kind: 'add'; worldId: string; partId: string }
  | { kind: 'remove'; worldId: string; posHash: string }
  | { kind: 'recolor'; worldId: string; posHash: string; prevHex?: string }

const undoStack: UndoOp[] = []
const UNDO_LIMIT = 30

export function pushUndo(op: UndoOp) {
  undoStack.push(op)
  if (undoStack.length > UNDO_LIMIT) undoStack.shift()
}

export function canUndo(): boolean { return undoStack.length > 0 }

export function popUndo(): UndoOp | null {
  return undoStack.pop() ?? null
}

/** Применить reverse-операцию из стека. Возвращает true если что-то отменили. */
export function doUndo(): boolean {
  const op = popUndo()
  if (!op) return false
  switch (op.kind) {
    case 'add':
      state = { ...state, additions: state.additions.filter((s) => s.id !== op.partId) }
      break
    case 'remove': {
      const list = state.removed[op.worldId] ?? []
      state = {
        ...state,
        removed: { ...state.removed, [op.worldId]: list.filter((h) => h !== op.posHash) },
      }
      break
    }
    case 'recolor': {
      const map = { ...(state.recolored[op.worldId] ?? {}) }
      if (op.prevHex) map[op.posHash] = op.prevHex
      else delete map[op.posHash]
      state = { ...state, recolored: { ...state.recolored, [op.worldId]: map } }
      break
    }
  }
  persist()
  emit()
  return true
}

// Legacy alias
export const subscribeAdditions = subscribeEdits
