const fs = require('fs');
const path = require('path');

const migrations = [
    '20251115000000',
    '20251119000000',
    '20251120000000',
    '20251120010000',
    '20251120235959',
    '20251121000000',
    '20251121000001',
    '20251121000002',
    '20251121000003',
    '20251121000004',
    '20251121000005',
    '20251121000006',
    '20251121000007',
    '20251121000008',
    '20251121000009',
    '20251121000010',
    '20251121000011',
    '20251121000012',
    '20251121000013',
    '20251130000000',
    '20251203000000',
    '20251209000000'
];

const migrationDir = path.join(__dirname, '../supabase/migrations');

if (!fs.existsSync(migrationDir)) {
    console.error('Migration directory not found!');
    process.exit(1);
}

migrations.forEach(id => {
    const filename = `${id}_remote_sync.sql`;
    const filePath = path.join(migrationDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '-- Placeholder\n');
        console.log(`Created ${filename}`);
    } else {
        console.log(`Exists ${filename}`);
    }
});
console.log('Done.');
