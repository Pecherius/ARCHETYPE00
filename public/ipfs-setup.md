# IPFS Setup para archetype00.punkable.eth

## 1. Instalar IPFS:
```bash
npm install -g ipfs
```

## 2. Inicializar:
```bash
ipfs init
ipfs daemon
```

## 3. Subir sitio:
```bash
npm run build
ipfs add -r dist/
```

## 4. Obtener hash y configurar ENS:
- Copia el hash final
- En ENS: Text record con `ipfs://<hash>`
