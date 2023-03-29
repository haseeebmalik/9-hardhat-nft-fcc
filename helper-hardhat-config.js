const { ethers } = require("hardhat")

const DECIMALS="18"
const INITIAL_PRICE=ethers.utils.parseUnits("20","ether")
const networkConfig={

    5: {
        name:"goerli",
        // vrfCoordinatorV2:"0x708701a1DfF4f478de54383E49a627eD4852C816",
        vrfCoordinatorV2:"0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee:ethers.utils.parseEther("0.01"),
        gasLane:"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        
        subscriptionId:"8840",
        callbackGasLimit:"500000", //500000
        interval:"30", //30 seconds
        mintFee: "10000000000000000", // 0.01 ETH
        ethUsdPriceFeed:"0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    },
    31337:{
        name:"hardhat",
        entranceFee:ethers.utils.parseEther("0.01"),
        gasLane:"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit:"500000", //500000
        interval:"30", //30 seconds
        subscriptionId:"8840",
        mintFee: "10000000000000000", // 0.01 ETH


        
    }
}

const developmentChains=["hardhat","localhost"]

module.exports={
    networkConfig,
    developmentChains,
    INITIAL_PRICE,
    DECIMALS
}