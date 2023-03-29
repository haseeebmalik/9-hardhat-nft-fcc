//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // some logic to say "show X image" or "show Y image"

    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    uint256 public s_price;

    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256=>int256) public s_tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId,int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg

        
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        //we will give each nft a high value at the time of minting
        s_tokenCounter = s_tokenCounter+1;
        s_tokenIdToHighValue[s_tokenCounter]=highValue;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter,highValue);
    }

    //it will returns the base64 prefix for json
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        //_exists is a function in ERC721 token standard
        require(_exists(tokenId), "URI Query for nonexistent token");
        //here name function is ERC721 function
        // string memory imageURI = "hi!";

        //base64 prefix for image
        //"data:image/svg+xml;base64,"

        //base64 prefix for json
        //data:application/json;base64,

        (,int256 price,,,)=i_priceFeed.latestRoundData();

       

        string memory imageURI=i_lowImageURI;
      
        if(price>=s_tokenIdToHighValue[tokenId]){
            
            console.log("bbb667",uint256(price));
           

            imageURI=i_highImageURI;
        }
       return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name(), // You can add whatever name here
                            '", "description":"An NFT that changes based on the Chainlink Feed",',
                            '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function getLowSVG() public view returns(string memory){
        return i_lowImageURI;
    }
    function getHighSVG() public view returns(string memory){
        return i_highImageURI;
    }
    function getPriceFeed() public view returns(AggregatorV3Interface){
        return i_priceFeed;
    }
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
    function getPrice() public  returns(int256){
     (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = i_priceFeed.latestRoundData();
        return price;

    }
}
