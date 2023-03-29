const {network}=require("hardhat")
const fs=require("fs")
const {developmentChains, networkConfig}=require("../helper-hardhat-config")
const {verify} =require("../utils/verify")
require("dotenv").config()
module.exports=async function({getNamedAccounts,deployments}){

    const {deploy,log}=deployments
    const {deployer}=await getNamedAccounts()

    const chainId=network.config.chainId
    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)){
        const EthUsdAggrergator=await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress=EthUsdAggrergator.address
    } else {
        ethUsdPriceFeedAddress=networkConfig[chainId].ethUsdPriceFeed
        
    }
    const lowSVG=await fs.readFileSync("./images/dynamicNft/frown.svg",{encoding:"utf8"})
    const highSVG=await fs.readFileSync("./images/dynamicNft/happy.svg",{encoding:"utf8"})
     args=[ethUsdPriceFeedAddress,lowSVG,highSVG]
    
     log("deploying DynamicSvgNft...")
     const dynamicSvgNft=await deploy("DynamicSvgNft",{
        from: deployer,
        args:args,
        logs:true,
        waitConfirmations:network.config.blockConfirmations||1
     })
     log("DynamicSvgNft deployed.")
     if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log("verifying...")
        await verify(dynamicSvgNft.address,args)
    }
}
module.exports.tags = ["all", "dynamicnft", "main"]