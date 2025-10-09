#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando deploy a IPFS...\n');

try {
  // 1. Build del proyecto
  console.log('📦 Construyendo proyecto...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado\n');

  // 2. Verificar que IPFS está corriendo
  console.log('🔍 Verificando IPFS daemon...');
  try {
    execSync('ipfs id', { stdio: 'pipe' });
    console.log('✅ IPFS daemon activo\n');
  } catch (error) {
    console.log('❌ IPFS daemon no está corriendo');
    console.log('💡 Ejecuta: ipfs daemon');
    process.exit(1);
  }

  // 3. Subir a IPFS
  console.log('📤 Subiendo a IPFS...');
  const output = execSync('ipfs add -r dist/', { encoding: 'utf8' });
  
  // Extraer el hash del directorio raíz
  const lines = output.trim().split('\n');
  const rootHash = lines[lines.length - 1].split(' ')[1];
  
  console.log(`✅ Subido exitosamente!`);
  console.log(`🔗 Hash IPFS: ${rootHash}\n`);

  // 4. Generar URLs de acceso
  console.log('🌐 URLs de acceso:');
  console.log(`   IPFS Gateway: https://ipfs.io/ipfs/${rootHash}`);
  console.log(`   Cloudflare: https://cloudflare-ipfs.com/ipfs/${rootHash}`);
  console.log(`   ENS Domain: archetype00.click (después de configurar DNS)\n`);

  // 5. Guardar hash para referencia
  const deployInfo = {
    hash: rootHash,
    timestamp: new Date().toISOString(),
    urls: {
      ipfs: `https://ipfs.io/ipfs/${rootHash}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${rootHash}`,
      ens: 'archetype00.click'
    }
  };

  fs.writeFileSync('dist/deploy-info.json', JSON.stringify(deployInfo, null, 2));
  console.log('💾 Información de deploy guardada en dist/deploy-info.json');

  // 6. Instrucciones para ENS
  console.log('\n📋 Próximos pasos para ENS:');
  console.log('1. Ir a https://app.ens.domains/');
  console.log('2. Buscar "archetype00.click"');
  console.log('3. Añadir registro TXT con: ipfs://' + rootHash);
  console.log('4. Esperar propagación DNS (5-10 minutos)');

} catch (error) {
  console.error('❌ Error durante el deploy:', error.message);
  process.exit(1);
}
