const {ethers,network}=require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports=async function({getNamedAccounts}){
    const {deployer}=await getNamedAccounts()

    // Basic Nft
    const basicNft=await ethers.getContract("BasicNft",deployer)
    const basicMintTx=await basicNft.mintNFT()
    await basicMintTx.wait(1)
    console.log(`Basic Nft index 1 has tokenUri:${await basicNft.tokenURI(1)}`)

   // Random IPFS NFT
   const randomIpfsNft=await ethers.getContract("RandomIpfsNft",deployer)
   const mintFee=await randomIpfsNft.getMintFee()
   await new Promise(async(resolve,reject)=>{
     setTimeout(reject("Timeout: 'NFTMinted' event did not fire"), 300000);// 5 minutes
      randomIpfsNft.once("NftMinted",async function(){
        resolve()
      })
      const randomIpfsNftMintTx=await randomIpfsNft.requestNft({value:mintFee.toString()})
       const randomIpfsNftMintTxReceipt=await randomIpfsNftMintTx.wait(1)

       if(developmentChains.includes(network.name)){
        const requestId=randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
        const vrfCoordinatorV2Mock=await ethers.getContract("VRFCoordinatorV2Mock",deployer)
        await vrfCoordinatorV2Mock.fulfillRandomWords(requestId,randomIpfsNft.address)
       }
    })

    console.log(`Random IPFS NFT index1 tokenURI is ${randomIpfsNft.tokenURI(1)}`)


    // Dynamic SVG NFT
    const highValue=ethers.utils.parseEther("4000")//4000 dollars
    const dynamicSvgNft=await ethers.getContract("DynamicSvgNft",deployer)
    const dynamicSvgNftMintTx=await dynamicSvgNft.mintNft(highValue.toString())
     await dynamicSvgNftMintTx.wait(1)
     console.log(`Dynamic SVG NFT index1 tokenURI:${await dynamicSvgNft.tokenURI(1)}`)


}

module.exports.tags=["all","mint"]