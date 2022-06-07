const { getNamedAccounts, ethers } = require('hardhat')
const { MAINNET_WETH_ADDRESS, MAINNET_AAVE_LENDING_POOL_ADDRESSES_PROVIDER_ADDRESS, MAINNET_AGGREGATORV3_ADDRESS, MAINNET_DAI_TOKEN_ADDRESS } = require('../helper-hardhat-config')
const {getWeth, AMOUNT} = require('./getWeth')

async function main() {
    //protocols treats everything as an ERC20 Token 
    //so use weth instead of eth
    //need abi, contractAddress
    await getWeth()
    const { deployer } = await getNamedAccounts()
    //aave interact
    // "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
    const lendingPool = await getLendingPool(deployer)
    console.log(`Lending pool address : ${lendingPool.address}`)

    //deposit
    //there is safe transfer func needing to take weth out of our wallet
    //so approve it for deposit
    const wethTokenAddress = MAINNET_WETH_ADDRESS
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(
        wethTokenAddress, /** asset */
        AMOUNT, /** amount */
        deployer, /** onBehalfOf */
        0 /**referal code - discontinued */
    )
    console.log("Deposited!!!!")
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    //get ETH DAI price chainlink price feeds 
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString()*0.95*(1/daiPrice.toNumber())
    //borrowing little less than allowed to borrow
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    
    
    //Borrow
    // how much we have borrowed, how much we can borrow, how much collateral given
    await borrowDai(
        MAINNET_DAI_TOKEN_ADDRESS,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    //getAccountData
    await getBorrowUserData(lendingPool, deployer)

    //repay
    await repayDai(
        MAINNET_DAI_TOKEN_ADDRESS,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )

    //getAccountData
    await getBorrowUserData(lendingPool, deployer)
    
}

async function repayDai(
    daiAddress, 
    lendingPool,
    amountDaiToBorrowWei,
    account
) {
    await approveErc20(daiAddress, lendingPool.address, amountDaiToBorrowWei , account)
    const repayTx = await lendingPool.repay(
        daiAddress, 
        amountDaiToBorrowWei,
        1,
        account
    )    
    await repayTx.wait(1)
    console.log(`You have repayed some Amount`)
}

async function borrowDai(
    daiAddress,
    lendingPool, 
    amountDaiToBorrowWei, 
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress, 
        amountDaiToBorrowWei, 
        1,
        0,
        account
    )   
    await borrowTx.wait(1)
    console.log('You have Borrowed')
}


async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        MAINNET_AGGREGATORV3_ADDRESS, 
    )   
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log("--------------------User Account DATA -----------------")
    console.log(`You got ${totalCollateralETH.toString()} deposited in ETH`)
    console.log(`You have borrowed ${totalDebtETH.toString()} in ETH`)
    console.log(`You can borrow ${availableBorrowsETH.toString()} in ETH`)
    console.log(`-------------------------------------------------------`)
    return {availableBorrowsETH, totalDebtETH}
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        MAINNET_AAVE_LENDING_POOL_ADDRESSES_PROVIDER_ADDRESS,
        account
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress, 
        account
    )
    return lendingingPool
}


async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    //erc20address -sender contract
    //spender address - needs to be approved
    //account - sending account 
    const erc20Token = await ethers.getContractAt(
        "IERC20", 
        erc20Address, 
        account
    )
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!!!")
}


main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })

//     [
//   totalCollateralETH: BigNumber { _hex: '0x470de4df820000', _isBigNumber: true },
//   totalDebtETH: BigNumber { _hex: '0x00', _isBigNumber: true },
//   availableBorrowsETH: BigNumber { _hex: '0x3a9ea99ecb4000', _isBigNumber: true },
//   currentLiquidationThreshold: BigNumber { _hex: '0x2134', _isBigNumber: true },
//   ltv: BigNumber { _hex: '0x203a', _isBigNumber: true }, //loan to value ratio
//   healthFactor: BigNumber {
//     _hex: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
//     _isBigNumber: true
//  
// ]
