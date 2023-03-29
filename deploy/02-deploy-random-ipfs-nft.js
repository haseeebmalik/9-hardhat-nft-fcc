const { network } = require("hardhat")

const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

const {
    storeImages,
    storeTokenUriMetaData,
} = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

const FUND_AMOUNT="1000000000000000000000" //10 link ethers

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get the Ipfs hashes of our images
    // let tokenUris;
    let tokenUris=[
        
            'ipfs://QmeG2AeyxaVnd2vEjjMFGFTyzGQQmCzcSrahVt9JyjMP48',
            'ipfs://Qmc76tnCFohyoFx92KSQ8yGnEva1aAFWLsNd5rZeF4KuXc',
            'ipfs://QmTKfwbUTadBem4dC6E6p29cATXfqKn2Gzpq8K5sz11Uud'
          
    ]
    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await handleTokenUris()
    }
    //1.With our own IPFS node. https://docs.ipfs.io/
    //2.pinata https://www.pinata.cloud/
    //3.nft.storage https://nft.storage/

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txRecept = await tx.wait(1)
        subscriptionId = txRecept.events[0].args.subId

                // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("---------------------------")

    //This is for storing images on pinata.
    // await storeImages(imagesLocation)

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]
    const randomIpfsNft=await deploy("RandomIpfsNft",{
        from: deployer,
        args:args,
        log:true,
        waitConfirmations:network.config.blockConfirmations||1,
    })

    log("--------------------------------------")
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log("verifying...")
        await verify(randomIpfsNft.address,args)
    }
}

async function handleTokenUris() {
    tokenUris = []
    //store the image in IPFS
    //store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(
        imagesLocation
    )
    for (let imageUploadResponseIndex in imageUploadResponses) {
        //create metadata
        //upload the metadata
        const options = {
            pinataMetadata: {
                name: imageUploadResponseIndex.toString(),
               
            },
         
            }
        let tokenUriMetaData = JSON.parse(JSON.stringify(metadataTemplate))
        //pug.png, st-bernard.png
        tokenUriMetaData.name = files[imageUploadResponseIndex].replace(
            ".png",
            ""
        )
        tokenUriMetaData.description = `An adorable ${tokenUriMetaData.name} pup!`
        tokenUriMetaData.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`uploading ${tokenUriMetaData.name}`)
        // store the JSON to panata/ipfs
        const metadataUploadResponse = await storeTokenUriMetaData(
            tokenUriMetaData
        )
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(tokenUris)

    return tokenUris
}
module.exports.tags = ["all", "randomipfs", "main"]
