const pinataSDK=require("@pinata/sdk")
const path=require("path")
const fs=require("fs")


require('dotenv').config();
const pinataApiKey=process.env.PINATA_API_KEY
const pinataApiSecret=process.env.PINATA_API_SECRET
console.log("pinataApiKey",pinataApiKey)
console.log("pinataApiSecret",pinataApiSecret)


const pinata=new pinataSDK(pinataApiKey,pinataApiSecret)

async function storeImages(imagesFilePath){
    const fullImagesPath=path.resolve(imagesFilePath)
    console.log("fullImgPath",fullImagesPath)
    const files=fs.readdirSync(fullImagesPath)
    console.log(files)
    let responses=[]
    console.log("Uploading to pinata!")
    
    
    for(fileIndex in files){
        console.log(`woking on ${fileIndex}...`)
        const readableStreamForFile=fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const options = {
                pinataMetadata: {
                    name: files[fileIndex],
                   
                },
             
                }
            const response=await pinata.pinFileToIPFS(readableStreamForFile,options)
            responses.push(response)
        } catch(err){
            console.log("err",err)
        }
    }
    return {responses,files}
}

async function storeTokenUriMetaData(metaData){
    try {
        let randomNumber = Math.random() * 100000;
        const options = {
            pinataMetadata: {
                name: randomNumber.toString(),
               
            },
         
            }
        const response=await pinata.pinJSONToIPFS(metaData,options)
        return response
    } catch (err){
        console.log("err",err)
    }
    return null
}
module.exports={storeImages,storeTokenUriMetaData}