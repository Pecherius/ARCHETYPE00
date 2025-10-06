# IPFS Deployment Instructions

## Deploy to IPFS:
1. Install IPFS: `npm install -g ipfs`
2. Start IPFS: `ipfs daemon`
3. Add files: `ipfs add -r dist/`
4. Pin: `ipfs pin add <hash>`

## Update ENS:
- Add TXT record: `ipfs://<hash>`
- Or use IPNS for dynamic updates

## Access:
- Via IPFS gateway: `https://ipfs.io/ipfs/<hash>`
- Via ENS: `punkable.eth` (after DNS propagation)
