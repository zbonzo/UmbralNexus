# Umbral Nexus - Game Mechanics Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Character Classes](#character-classes)
4. [Exploration Mode](#exploration-mode)
5. [Combat System](#combat-system)
6. [Nexus Echoes (Power-ups)](#nexus-echoes-power-ups)
7. [Multi-Floor System](#multi-floor-system)
8. [Victory & Defeat Conditions](#victory--defeat-conditions)
9. [Advanced Mechanics](#advanced-mechanics)
10. [Tips & Strategies](#tips--strategies)

## Overview

Umbral Nexus is a cooperative roguelike dungeon crawler where 1-20 players work together to explore a mysterious labyrinth, defeat enemies, and restore the shattered Nexus before it's too late. The game uniquely combines phone-based controls with a shared viewing screen, creating an experience perfect for parties, streaming, and team-building events.

### Core Gameplay Loop
1. **Explore** procedurally generated dungeon floors
2. **Engage** in tactical turn-based combat
3. **Collect** powerful Nexus Echo upgrades
4. **Progress** deeper into the labyrinth
5. **Cooperate** to achieve victory conditions

## Getting Started

### Creating a Game
1. One player (the host) visits UmbralNexus.com and clicks "Create Game"
2. Configure game settings:
   - **Player Cap**: 1-20 players
   - **Victory Conditions**: Time limit, death counter, or floor target
   - **Difficulty**: Normal, Hard, or Nightmare
3. Share the 6-character game code with other players

### Joining a Game
1. Players visit UmbralNexus.com on their phones
2. Enter the game code
3. Select a character class
4. Ready up and wait for the host to start

### Setting Up the Display
- Open `UmbralNexus.com/cast/[GAMECODE]` on a large screen
- This shows the main game view that everyone watches
- For streaming: Use this URL as a browser source

## Character Classes

Each class has unique abilities and playstyles:

### ⚔️ Warrior
- **Role**: Tank/Melee DPS
- **Starting HP**: 120
- **Abilities**:
  - **Shield Bash** (1 AP): Deal damage and stun for 1 turn
  - **Rallying Cry** (2 AP): Grant nearby allies +1 AP next turn
  - **Whirlwind** (3 AP): Damage all adjacent enemies

### 🏹 Ranger
- **Role**: Ranged DPS/Scout
- **Starting HP**: 80
- **Abilities**:
  - **Quick Shot** (1 AP): Fast ranged attack
  - **Mark Target** (2 AP): Increase all damage to target by 50%
  - **Arrow Storm** (3 AP): Hit all enemies in a 3x3 area

### 🔮 Mage
- **Role**: AoE Damage/Control
- **Starting HP**: 60
- **Abilities**:
  - **Frost Bolt** (1 AP): Damage and slow enemy
  - **Teleport** (2 AP): Move up to 5 tiles instantly
  - **Meteor** (3 AP): Massive area damage after 1 turn delay

### ✨ Cleric
- **Role**: Support/Healer
- **Starting HP**: 100
- **Abilities**:
  - **Heal** (1 AP): Restore 30 HP to target
  - **Blessing** (2 AP): Remove debuffs and grant damage reduction
  - **Sanctuary** (3 AP): Create healing area for 3 turns

## Exploration Mode

### Movement
- Use the D-pad on your phone to move your character
- Movement is real-time during exploration
- Each player can explore independently
- Fog of war reveals as players explore

### Interactions
- **Doors**: Automatically open when approached
- **Chests**: Contain items or gold (shared with party)
- **Stairs**: Move between floors (all players must be ready)
- **Shrines**: Provide temporary buffs

### Discovery Bonuses
- First player to reveal a room gets +5 XP
- Finding secret rooms grants party-wide buffs
- Exploring 100% of a floor gives bonus Nexus Echo choices

## Combat System

### Combat Initiation
- Combat begins when any player or enemy attacks
- All players on the same floor enter combat together
- Players on other floors can continue exploring

### Action Points (AP)
- Each player gets **3 AP** per turn
- Actions cost varying amounts of AP:
  - **Move**: 1 AP per tile
  - **Basic Attack**: 1 AP
  - **Use Item**: 1 AP
  - **Abilities**: 1-3 AP (varies by ability)
- Unused AP doesn't carry over

### Turn Order
1. All players take their turns simultaneously
2. Players have 30 seconds to input actions
3. Actions resolve in this order:
   - Movement
   - Defensive abilities
   - Attacks/Offensive abilities
4. Then all enemies take their turn

### Damage Calculation
```
Base Damage × Class Modifier × Equipment Bonus × Nexus Echo Multipliers
```

### Status Effects
- **Stunned**: Skip next turn
- **Slowed**: -1 AP next turn
- **Poisoned**: Take damage at turn start
- **Burning**: Take damage when moving
- **Frozen**: Cannot move (can still use abilities)
- **Blessed**: +50% damage reduction
- **Marked**: Take +50% damage from all sources

## Nexus Echoes (Power-ups)

After defeating a floor boss, each player chooses from 3 random Nexus Echoes:

### Echo Categories

#### 🗡️ Offensive Echoes
- **Bloodthirst**: +5% damage per enemy killed (stacks)
- **Chain Lightning**: Attacks jump to nearby enemies
- **Critical Surge**: +10% crit chance, crits spread status effects
- **Berserker**: +100% damage when below 30% HP

#### 🛡️ Defensive Echoes
- **Stone Skin**: +2 damage reduction per floor cleared
- **Dodge Master**: 20% chance to avoid all damage
- **Thorns**: Reflect 50% melee damage
- **Second Wind**: Revive once per floor with 50% HP

#### 🎯 Utility Echoes
- **Swift Boots**: +1 movement range
- **Eagle Eye**: +2 vision range, see through walls
- **Treasure Hunter**: Chests contain double loot
- **Efficient**: All abilities cost -1 AP (minimum 1)

#### 🌟 Legendary Echoes (Rare)
- **Nexus Attunement**: +1 AP per turn
- **Mirror Image**: Create a copy that mimics your actions
- **Time Warp**: Take an extra turn after killing a boss
- **Unity**: Share 25% of your echoes' effects with allies

### Echo Synergies
Some echoes work better together:
- **Bloodthirst + Chain Lightning** = Exponential damage growth
- **Stone Skin + Thorns** = Ultimate tank build
- **Swift Boots + Efficient** = Hyper-mobile playstyle

## Multi-Floor System

### Floor Types
1. **Standard Floors**: Regular enemies and exploration
2. **Elite Floors**: Tougher enemies, better rewards
3. **Boss Floors**: Major encounter every 5 floors
4. **Secret Floors**: Hidden areas with unique challenges
5. **The Nexus Core**: Final floor with ultimate boss

### Floor Progression
- Stairs can go up or down
- Some paths are one-way
- Backtracking may reveal new areas
- Each floor has a "darkness level" that increases over time

### Split Party Mechanics
- Players can be on different floors simultaneously
- Each floor maintains its own state (exploration/combat)
- Communication between floors via emotes only
- Reunite at stairs to progress together

## Victory & Defeat Conditions

### Victory Conditions (Host Selected)

#### ⏱️ Time Trial
- Complete objective within time limit
- Default: 60 minutes
- Time extensions found in chests
- Bonus rewards for speed

#### 💀 Survival Mode
- Limited team deaths (shared pool)
- Default: 20 deaths for full party
- Revive tokens can be found
- Dead players become spectators

#### 🏔️ Floor Rush
- Reach target floor depth
- Default: Floor 20
- Shortcuts may exist
- All players must reach target

### Defeat Triggers
- Time expires (Time Trial)
- Death counter reaches zero (Survival)
- All players dead simultaneously
- The Nexus fully corrupts (special events)

## Advanced Mechanics

### Combo System
- Actions within 2 seconds build combo
- Higher combos = more damage/XP
- Party-wide combo counter
- Special effects at 10x, 25x, 50x combos

### Environmental Interactions
- **Fire + Oil**: Creates spreading flames
- **Ice + Water**: Freezes area solid
- **Lightning + Metal**: Conducts to all touching metal
- **Wind + Projectiles**: Alters trajectory

### Darkness Mechanic
- Each floor slowly fills with darkness
- Reduces vision and spawns shadow enemies
- Light sources push back darkness
- Full darkness = constant damage

### Boss Mechanics
Each boss has unique patterns:
- **Phase transitions** at health thresholds
- **Raid mechanics** requiring coordination
- **Weak points** that rotate
- **Enrage timers** to prevent stalling

## Tips & Strategies

### For New Players
1. **Stick Together**: Easier to handle combat
2. **Communicate**: Use emotes liberally
3. **Experiment**: Try different echo combinations
4. **Watch AP**: Don't waste action points
5. **Learn Enemy Patterns**: Each type has tells

### For Coordinated Groups
1. **Role Distribution**: Balance tanks, DPS, support
2. **Split Farming**: Cover more ground efficiently
3. **Echo Planning**: Coordinate complementary builds
4. **Resource Management**: Share items strategically
5. **Boss Strategies**: Assign positions and roles

### For Speedrunners
1. **Movement Tech**: Animation canceling saves time
2. **Optimal Paths**: Some floors have shortcuts
3. **Echo Routes**: Plan build from start
4. **Skip Strategies**: Not all enemies must die
5. **Frame Perfect**: Some abilities can combo faster

### Common Mistakes to Avoid
- **AP Waste**: Moving unnecessarily in combat
- **Split Damage**: Focus fire on single targets
- **Hoarding Items**: Use consumables liberally
- **Ignoring Objectives**: Timer/deaths matter more than full clears
- **Poor Echo Choices**: Read and plan synergies

## Difficulty Modifiers

### Nightmare Mode Changes
- Enemies have +50% HP and damage
- Reduced healing effectiveness (-30%)
- More elite enemies spawn
- Darkness spreads 2x faster
- But... better echo choices and rewards!

### Custom Modifiers (Host Options)
- **Iron Man**: No revives
- **Chaos**: Random echo selections
- **Speedrun**: Reduced time limits
- **Horde**: Double enemy spawns
- **Glass Cannon**: Everyone has 1 HP but triple damage

---

*Remember: The key to victory in Umbral Nexus is cooperation. No single hero can restore the Nexus alone - it takes a united party to overcome the darkness!*

*May the echoes guide your path, Wayfinder.*