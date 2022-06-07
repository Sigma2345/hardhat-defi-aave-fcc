# Tasks tested in code 
1. deposit collateral : ETH/WETH
2. Borrow another Asset : DAI
3. Repay the DAI 

 
Forking the mainnet using alchemy api . Due to mainnet fork all contract addresses used were mainnet address

# steps to run programme

to get code: 
```shell
git clone https://github.com/Sigma2345/hardhat-defi-aave-fcc.git
```

to download node modules:
```shell
yarn 
```

create a .env file and add ,  
-> alchemy API


compile the contracts:
```shell
yarn hardhat compile
```


to deploy scripts :
```shell
yarn hardhat run scripts/aaveBorrow.js
```


wETH is wrapped ethereum used as ERC20Token substitute for ethereum 
since aave only acts as lending-borrowing protocol for erc20 tokens


