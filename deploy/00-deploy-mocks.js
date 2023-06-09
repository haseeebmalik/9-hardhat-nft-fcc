const { deployments } = require("hardhat")

const {developmentChains,DECIMALS,INITIAL_PRICE}=require("../helper-hardhat-config")

const BASE_FEE=ethers.utils.parseEther("0.25")// 0.25 is the premium. It costs 0.25 LINK each request
const GAS_PRICE_LINK=1e9 //Link per gas
module.exports=async function({getNamedAccounts,deployments}){
    const {deploy,log}=deployments
    const {deployer}=await getNamedAccounts()
    const chainId=network.config.chainId
    const args=[BASE_FEE,GAS_PRICE_LINK]
    

    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks...")

        //deploy a mock vrfcoordinator
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            args:args
        })

        //deploy mock price feed
        await  deploy("MockV3Aggregator",{
            from:deployer,
            log:true,
            args:[DECIMALS,INITIAL_PRICE]

        })
        log("Mock deployed.")
        log("----------------------------------")
    }
}

module.exports.tags=["all","mocks"]