const { getNamedAccounts, ethers } = require("hardhat")
const { MAINNET_WETH_ADDRESS } = require("../helper-hardhat-config")

const AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    //call deposit function on weth token
    const iWeth = await ethers.getContractAt(
        "IWeth",
        MAINNET_WETH_ADDRESS,
        deployer
    )
    //get contract at "IWeth"(-->abi) of contract address connected to deployer
    // currently mainnet address of contract used 
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}


module.exports = {
    getWeth, AMOUNT
}
