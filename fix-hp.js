const fs = require('fs');

const files = [
  'src/services/user-service.ts',
  'src/services/itemEffects.ts',
  'src/commands/hunt.ts',
  'src/commands/profile.ts',
  'src/commands/register.ts',
  'src/commands/use.ts',
  'src/commands/tavern.ts',
  'src/commands/help-rpg.ts',
  'src/services/combat.ts',
  'src/services/leveling.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace user.hp -> user.currentHp
  content = content.replace(/user\.hp/g, 'user.currentHp');
  content = content.replace(/updatedUser\.hp/g, 'updatedUser.currentHp');
  
  // Replace prisma data assignments
  content = content.replace(/hp\s*:\s*([^,}]+)/g, (match, val) => {
    // Exclude if it's already 'currentHp:' or 'maxHp:'
    // Wait, the regex `hp: ` could match `maxHp: ` if not careful.
    return 'currentHp: ' + val;
  });

  // Specifically fix maxHp, currentHp mismatches from the aggressive replace above
  content = content.replace(/maxcurrentHp/g, 'maxHp');
  content = content.replace(/currentcurrentHp/g, 'currentHp');
  
  // Manual string check for `hp:` 
  // Let's just fix it all
  content = content.replace(/hp \= /g, 'currentHp = ');

  // Types
  content = content.replace(/\| "hp"/g, '');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed hp to currentHp globally.');
