3 contracts

1. Basic NFT
2. Random IPFS NFT
- pros: Cheap
- corns: someone need to pin our data

3. Dynamic SVG NFT
- pros: The data is on chain!
- corns: Much more expensive.


4. To test it on main net we need to first deploy our contracts to testnet by command:
npx hardhat deploy --network goerli --tags main

Now mint nft on test net
npx hardhat deploy --network goerli --tags mint